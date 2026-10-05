/**
 * The Hosting Assistant's reply engine: rule-based, no external AI.
 *
 *   1. Recommendation intent ("which plan…", "need hosting") → the dashboard-managed flow.
 *   2. FAQ: exact question match, then keyword/phrase match.
 *   3. Pricing / quote / callback / human intent → plans (if a category is mentioned) + lead form.
 *   4. Related FAQ suggestions, then the "couldn't find an exact answer" fallback + lead form.
 *
 * Future AI: anything implementing `AssistantResponder` can be passed in `responders`. They run
 * after the FAQ engine finds no confident answer and before the fallback, and get the same
 * knowledge base and conversation context — so an AI answerer or lead qualifier plugs in
 * without changing the widget, the API, storage or analytics.
 *
 * Pure (no I/O, relative imports only), so it can be unit-tested outside Next.
 */
import {
  PLAN_CATEGORIES,
  isPlanCategory,
  planCategoryLabel,
  type AssistantEvent,
  type AssistantFaq,
  type AssistantPlan,
  type AssistantSettings,
  type LoggedMessage,
  type PlanCard,
  type PlanCategory,
  type ReplyBlock,
} from "./types"

export type KnowledgeBase = { settings: AssistantSettings; faqs: AssistantFaq[]; plans: AssistantPlan[] }

export type EngineResult = {
  replies: ReplyBlock[]
  /** What to store: the visitor's turn (if any) and the assistant's reply, with analytics metadata. */
  log: LoggedMessage[]
  flowAnswers?: Record<string, string>
}

/** Extension point for future responders (e.g. an AI answerer). Return null to pass. */
export interface AssistantResponder {
  name: string
  respond(input: { text: string; kb: KnowledgeBase }): Promise<EngineResult | null>
}

const STOPWORDS = new Set(
  "a an the and or but if of to in on for with at by from is are was were be been being do does did i me my we our you your it its this that these those what which who whom how can could should would will shall may might must have has had not no yes please hi hello hey there about into than then so as any some get need want".split(
    " "
  )
)

export function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function stem(word: string) {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1)
  return word
}

export function tokens(text: string) {
  return new Set(
    normalize(text)
      .split(" ")
      .filter((word) => word && !STOPWORDS.has(word))
      .map(stem)
  )
}

const containsPhrase = (haystack: string, phrase: string) => phrase && ` ${haystack} `.includes(` ${phrase} `)

type Scored = { faq: AssistantFaq; score: number; strong: boolean }

/** Ranks published FAQs against `text`. `strong` = confident enough to answer directly. */
export function rankFaqs(text: string, faqs: AssistantFaq[]): Scored[] {
  const query = normalize(text)
  const queryTokens = tokens(text)
  if (!query) return []
  return faqs
    .filter((faq) => faq.status === "published")
    .map((faq) => {
      if (normalize(faq.question) === query) return { faq, score: 100, strong: true }
      const keywordHits = faq.keywords.filter((keyword) => containsPhrase(query, normalize(keyword))).length
      const questionTokens = tokens(faq.question)
      let overlap = 0
      for (const token of queryTokens) if (questionTokens.has(token)) overlap++
      const coverage = queryTokens.size ? overlap / queryTokens.size : 0
      const score = keywordHits * 3 + coverage * 4 + overlap * 0.5
      // Confident: a keyword phrase, most of the query's words, or every word of a short question.
      const strong = keywordHits > 0 || (overlap >= 2 && coverage >= 0.6) || (overlap >= 1 && overlap === questionTokens.size)
      return { faq, score, strong }
    })
    .filter((scored) => scored.score > 0)
    .sort((a, b) => b.score - a.score)
}

const RECOMMEND = /\b(recommend|recommendation|which (plan|hosting)|choose|choosing|pick|best plan|suggest|need (a )?hosting|looking for hosting|help me (decide|choose))\b/
const LEAD = /\b(price|prices|pricing|cost|costs|how much|quote|quotation|estimate|callback|call back|call me|contact|talk to|speak|human|agent|sales|representative|escalat\w*)\b/

/** Which plan category / lead-form service the visitor's words point at, if any. */
const TOPICS: { pattern: RegExp; category?: PlanCategory; service: string }[] = [
  { pattern: /\bvps|virtual private\b/, category: "vps", service: "vps-hosting" },
  { pattern: /\bcloud\b/, category: "cloud", service: "cloud-hosting" },
  { pattern: /\bwordpress|wp\b/, category: "wordpress", service: "wordpress-hosting" },
  { pattern: /\bmaintenance|maintain|updates?\b/, category: "maintenance", service: "website-maintenance" },
  { pattern: /\bmigrat\w*|transfer my (site|website)|move my (site|website)\b/, service: "website-migration" },
  { pattern: /\b(develop\w*|design|build (a|my) (site|website)|new website)\b/, service: "website-development" },
  { pattern: /\bdomain|dns\b/, service: "domain" },
  { pattern: /\bssl|https|certificate\b/, service: "ssl" },
  { pattern: /\bemail|mailbox|mail\b/, service: "business-email" },
  { pattern: /\bsecurity|malware|hack\w*\b/, service: "website-security" },
  { pattern: /\bdedicated\b/, service: "dedicated-server" },
  { pattern: /\bshared|hosting|host\b/, category: "shared", service: "shared-hosting" },
]

export function detectTopic(text: string) {
  const query = normalize(text)
  return TOPICS.find((topic) => topic.pattern.test(query)) ?? null
}

export function toPlanCard(plan: AssistantPlan): PlanCard {
  return {
    id: plan.id,
    name: plan.name,
    category: plan.category,
    categoryLabel: planCategoryLabel(plan.category),
    currency: plan.currency,
    monthlyPrice: plan.monthlyPrice,
    yearlyPrice: plan.yearlyPrice,
    features: plan.features,
    isPopular: plan.isPopular,
    ctaUrl: plan.ctaUrl,
  }
}

const activePlans = (kb: KnowledgeBase, category: PlanCategory) =>
  kb.plans.filter((plan) => plan.isActive && plan.category === category).sort((a, b) => a.sortOrder - b.sortOrder)

const serviceFor = (category: PlanCategory) => PLAN_CATEGORIES.find((c) => c.value === category)?.service ?? "not-sure"

const say = (text: string): ReplyBlock => ({ type: "text", text })
const assistantLog = (kind: string, body: string, metadata?: Record<string, unknown>): LoggedMessage => ({ role: "assistant", kind, body, metadata })

const FALLBACK_TEXT = "I couldn't find an exact answer.\n\nWould you like our team to contact you?"

function faqAnswer(faq: AssistantFaq, related: AssistantFaq[]): EngineResult {
  const replies: ReplyBlock[] = [say(faq.answer)]
  if (related.length) replies.push({ type: "suggestions", faqs: related.map((r) => ({ id: r.id, question: r.question })) })
  return { replies, log: [assistantLog("faq_answer", faq.answer, { faqId: faq.id, question: faq.question })] }
}

function leadPrompt(text: string, service: string, requirement?: string, kind = "lead_prompt"): EngineResult {
  return {
    replies: [say(text), { type: "lead_form", service, ...(requirement ? { requirement } : {}) }],
    log: [assistantLog(kind, text, { service })],
  }
}

/** Plans in a category, or a quote prompt when the dashboard has none configured. */
export function showPlans(kb: KnowledgeBase, category: PlanCategory): EngineResult {
  const plans = activePlans(kb, category)
  const label = planCategoryLabel(category)
  if (!plans.length) {
    return leadPrompt(`Our team will share current ${label} options and pricing for your needs. Leave your details and we'll get back to you.`, serviceFor(category), `${label} pricing`)
  }
  const intro = `Here are our ${label} plans:`
  return {
    replies: [say(intro), { type: "plans", plans: plans.map(toPlanCard) }, { type: "lead_form", service: serviceFor(category), requirement: `${label} enquiry` }],
    log: [assistantLog("plans", intro, { category, planIds: plans.map((p) => p.id) })],
  }
}

/** The answers that fit the current flow, in step order; stops at the first missing or unknown one. */
export function validAnswers(kb: KnowledgeBase, rawAnswers: Record<string, string>) {
  const answers: Record<string, string> = {}
  for (const step of kb.settings.flow.steps) {
    const answer = rawAnswers[step.id]
    if (typeof answer !== "string" || !step.options.some((option) => option.id === answer)) break
    answers[step.id] = answer
  }
  return answers
}

/** The next unanswered flow question, or the recommendation once every step is answered. */
export function advanceFlow(kb: KnowledgeBase, rawAnswers: Record<string, string>): EngineResult {
  const steps = kb.settings.flow.steps
  // Stale or forged answers are dropped, so the flow can't be steered outside its options.
  const answers = validAnswers(kb, rawAnswers)
  const next = steps.find((step) => !answers[step.id])
  if (next) {
    return {
      replies: [say(next.question), { type: "options", stepId: next.id, options: next.options.map(({ id, label }) => ({ id, label })) }],
      log: [assistantLog("flow_question", next.question, { stepId: next.id })],
      flowAnswers: answers,
    }
  }
  return recommend(kb, answers)
}

const CATEGORY_RANK: PlanCategory[] = ["maintenance", "shared", "wordpress", "vps", "cloud"]

export function recommend(kb: KnowledgeBase, answers: Record<string, string>): EngineResult {
  const chosen = kb.settings.flow.steps.flatMap((step) => step.options.filter((option) => option.id === answers[step.id]))
  const categories = chosen.map((option) => option.category).filter(isPlanCategory)
  const category = categories.length ? categories.reduce((a, b) => (CATEGORY_RANK.indexOf(b) > CATEGORY_RANK.indexOf(a) ? b : a)) : kb.settings.flow.fallbackCategory
  const size = Math.max(1, ...chosen.map((option) => option.size ?? 1))
  const notes = chosen.map((option) => option.note).filter((note): note is string => Boolean(note))
  const label = planCategoryLabel(category)
  const summary = chosen.map((option) => option.label).join(" · ")

  const plans = activePlans(kb, category)
  if (!plans.length) {
    const text = `Thanks! Based on your answers (${summary}), ${label} looks like the right fit. Our team will recommend the exact plan and pricing — leave your details below.`
    return {
      replies: [say(text), ...notes.map(say), { type: "lead_form", service: serviceFor(category), requirement: `Plan recommendation: ${label} (${summary})` }],
      log: [assistantLog("recommendation", text, { category, planIds: [], answers })],
    }
  }
  const pick = plans[Math.min(size, plans.length) - 1]
  const alternative = plans[plans.indexOf(pick) + 1]
  const shown = alternative ? [pick, alternative] : [pick]
  const text = `Based on your answers (${summary}), I recommend ${pick.name} (${label}).${alternative ? ` If you expect to grow quickly, ${alternative.name} gives you more headroom.` : ""}`
  return {
    replies: [
      say(text),
      { type: "plans", plans: shown.map(toPlanCard) },
      ...notes.map(say),
      say("Want our team to confirm the best fit and send a quote?"),
      { type: "lead_form", service: serviceFor(category), requirement: `Recommended: ${pick.name} (${summary})` },
    ],
    log: [assistantLog("recommendation", text, { category, planIds: [pick.id], recommendedPlan: pick.name, answers })],
  }
}

/** Answers free text (typed messages, starters without an action, "ask" quick actions). */
export async function answerText(text: string, kb: KnowledgeBase, responders: AssistantResponder[] = []): Promise<EngineResult> {
  const query = normalize(text)
  const topic = detectTopic(text)
  const ranked = rankFaqs(text, kb.faqs)
  const best = ranked[0]
  const exact = best?.score === 100

  if (!exact && RECOMMEND.test(query)) {
    const intro = say("Happy to help you choose. A few quick questions:")
    const flow = advanceFlow(kb, {})
    return { ...flow, replies: [intro, ...flow.replies] }
  }
  // A pricing question about a category with plans gets the plans (with prices) first.
  const pricing = /\b(price|prices|pricing|cost|costs|how much|plan|plans|rate|rates)\b/.test(query)
  if (!exact && pricing && topic?.category && activePlans(kb, topic.category).length) return showPlans(kb, topic.category)

  if (best?.strong) return faqAnswer(best.faq, ranked.slice(1, 4).filter((r) => r.score >= 1).map((r) => r.faq))

  if (LEAD.test(query)) {
    return leadPrompt("I can get our team to help with that. Share your details and we'll contact you shortly.", topic?.service ?? "not-sure", text.slice(0, 300))
  }

  for (const responder of responders) {
    const result = await responder.respond({ text, kb })
    if (result) return result
  }

  const related = ranked.slice(0, 3).map((r) => r.faq)
  return {
    replies: [
      say(FALLBACK_TEXT),
      ...(related.length ? [{ type: "suggestions" as const, faqs: related.map((faq) => ({ id: faq.id, question: faq.question })) }] : []),
      { type: "lead_form", service: topic?.service ?? "not-sure", requirement: text.slice(0, 300) },
    ],
    log: [assistantLog("fallback", FALLBACK_TEXT, { question: text.slice(0, 300), suggested: related.map((faq) => faq.id) })],
  }
}

/** Entry point: turns one visitor event into the assistant's reply and the messages to store. */
export async function respond(event: AssistantEvent, kb: KnowledgeBase, responders: AssistantResponder[] = []): Promise<EngineResult> {
  const visitor = (kind: string, body: string, metadata?: Record<string, unknown>): LoggedMessage => ({ role: "visitor", kind, body, metadata })

  switch (event.type) {
    case "message": {
      const text = event.text
      const result = await answerText(text, kb, responders)
      return { ...result, log: [visitor("text", text), ...result.log] }
    }
    case "starter": {
      const starter = kb.settings.starters.find((s) => s.id === event.starterId)
      if (!starter) return unknownEvent()
      const action = starter.actionId ? kb.settings.quickActions.find((a) => a.id === starter.actionId) : undefined
      const result = action ? await runQuickAction(action.id, kb, responders) : await answerText(starter.text, kb, responders)
      return { ...result, log: [visitor("starter", starter.text, { starterId: starter.id }), ...result.log.filter((m) => m.role === "assistant")] }
    }
    case "quick_action": {
      const action = kb.settings.quickActions.find((a) => a.id === event.actionId)
      if (!action) return unknownEvent()
      const result = await runQuickAction(action.id, kb, responders)
      return { ...result, log: [visitor("quick_action", action.label, { actionId: action.id, label: action.label }), ...result.log.filter((m) => m.role === "assistant")] }
    }
    case "faq": {
      const faq = kb.faqs.find((f) => f.id === event.faqId && f.status === "published")
      if (!faq) return unknownEvent()
      const related = rankFaqs(faq.question, kb.faqs).filter((r) => r.faq.id !== faq.id && r.score >= 1).slice(0, 3).map((r) => r.faq)
      const result = faqAnswer(faq, related)
      return { ...result, log: [visitor("faq_click", faq.question, { faqId: faq.id }), ...result.log] }
    }
    case "flow_answer": {
      const answers = validAnswers(kb, event.answers)
      const result = advanceFlow(kb, answers)
      // The visitor's turn is their newest valid answer.
      const last = kb.settings.flow.steps.filter((step) => answers[step.id]).at(-1)
      const option = last?.options.find((o) => o.id === answers[last.id])
      return { ...result, log: [...(last && option ? [visitor("flow_answer", option.label, { stepId: last.id, optionId: option.id })] : []), ...result.log] }
    }
  }
}

async function runQuickAction(actionId: string, kb: KnowledgeBase, responders: AssistantResponder[]): Promise<EngineResult> {
  const action = kb.settings.quickActions.find((a) => a.id === actionId)
  if (!action) return unknownEvent()
  switch (action.kind) {
    case "recommend": {
      const flow = advanceFlow(kb, {})
      return { ...flow, replies: [say("Let's find the right plan. A few quick questions:"), ...flow.replies] }
    }
    case "plans":
      return isPlanCategory(action.value) ? showPlans(kb, action.value) : unknownEvent()
    case "ask":
      return answerText(action.value ?? action.label, kb, responders)
    case "lead":
      return leadPrompt(`Sure — tell us a little about what you need and our team will get back to you.`, action.value ?? "not-sure", action.label, "lead_prompt")
    case "link": {
      const text = `${action.label}:`
      return { replies: [say(text), { type: "link", label: `Open ${action.label}`, href: action.value ?? "/" }], log: [assistantLog("link", text, { href: action.value })] }
    }
  }
}

function unknownEvent(): EngineResult {
  const text = "Sorry, that option isn't available any more. Please choose another or type your question."
  return { replies: [say(text)], log: [assistantLog("text", text)] }
}

/**
 * The Hosting Assistant's conversational engine: rule-based, no external AI.
 *
 * Every reply is chat text plus buttons that continue the conversation:
 *   • Dashboard-managed conversation flows (quick actions, starters, typed triggers).
 *   • The plan recommendation flow → plan cards.
 *   • FAQ answers (exact, then keyword/wording match) → related topics and questions.
 *   • Conversational lead capture: name → email → phone → requirement, one message at a time.
 *     No forms; the API delivers the lead through the normal lead pipeline.
 *   • Unrecognised text gets a guided topic menu; only a second miss in a row offers the team.
 *
 * The server stays stateless: the small `ConversationState` (lead capture progress, miss count)
 * travels with the widget, and every button carries the event it sends.
 *
 * Future AI: anything implementing `AssistantResponder` can be passed to `respond`. Responders
 * run when nothing above matched, before the guided fallback, with the same knowledge base —
 * so an AI answerer or lead qualifier plugs in without changing the widget, API or storage.
 *
 * Pure (no I/O, relative imports only), so it can be unit-tested outside Next.
 */
import { isServiceValue } from "./settings"
import {
  PLAN_CATEGORIES,
  isPlanCategory,
  planCategoryLabel,
  type AssistantEvent,
  type AssistantFaq,
  type AssistantPlan,
  type AssistantSettings,
  type ConversationFlow,
  type ConversationState,
  type FlowStepNode,
  type FlowStepOption,
  type LeadCapture,
  type LoggedMessage,
  type PlanCard,
  type PlanCategory,
  type ReplyBlock,
  type ReplyButton,
} from "./types"

export type KnowledgeBase = { settings: AssistantSettings; faqs: AssistantFaq[]; plans: AssistantPlan[] }

export type CompletedLead = { name: string; email: string; phone: string; service: string; requirement: string }

export type EngineResult = {
  replies: ReplyBlock[]
  /** What to store: the visitor's turn (if any) and the assistant's reply, with analytics metadata. */
  log: LoggedMessage[]
  /** State for the next turn; absent = cleared. */
  state?: ConversationState
  /** Set when conversational lead capture has every detail — the API delivers it. */
  submitLead?: CompletedLead
}

/** Extension point for future responders (e.g. an AI answerer). Return null to pass. */
export interface AssistantResponder {
  name: string
  respond(input: { text: string; kb: KnowledgeBase; state?: ConversationState }): Promise<EngineResult | null>
}

// --- Text helpers ----------------------------------------------------------------------------

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

const containsPhrase = (haystack: string, phrase: string) => Boolean(phrase) && ` ${haystack} `.includes(` ${phrase} `)

const say = (text: string): ReplyBlock => ({ type: "text", text })
const buttons = (list: ReplyButton[], title?: string): ReplyBlock => ({ type: "buttons", buttons: list, ...(title ? { title } : {}) })
const assistantLog = (kind: string, body: string, metadata?: Record<string, unknown>): LoggedMessage => ({ role: "assistant", kind, body, metadata })
const visitorLog = (kind: string, body: string, metadata?: Record<string, unknown>): LoggedMessage => ({ role: "visitor", kind, body, metadata })
const firstName = (name: string) => name.split(" ")[0]

// --- FAQ matching ----------------------------------------------------------------------------

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

// --- Intents & topics ------------------------------------------------------------------------

const RECOMMEND = /\b(recommend|recommendation|which (plan|hosting)|choose|choosing|pick a plan|best plan|suggest|help me (decide|choose))\b/
const LEAD = /\b(quote|quotation|estimate|callback|call back|call me|contact me|talk to|speak to|speak with|human|agent|sales|representative|expert|escalat\w*)\b/
const PRICING = /\b(price|prices|pricing|cost|costs|how much|rate|rates|cheap|cheapest)\b/
const GREETING = /^(hi+|hello|hey|hii+|good (morning|afternoon|evening)|namaste|hola)\b/
const THANKS = /^(thanks|thank you|thx|ty|great thanks|ok thanks|okay thanks|cool|great|perfect|awesome)\b/
const CANCEL = /^(cancel|stop|never ?mind|no thanks|not now|forget it|exit|quit)\b/

/** Which plan category / lead service the visitor's words point at, if any. */
const TOPICS: { pattern: RegExp; category?: PlanCategory; service: string }[] = [
  { pattern: /\bvps|virtual private\b/, category: "vps", service: "vps-hosting" },
  { pattern: /\bcloud\b/, category: "cloud", service: "cloud-hosting" },
  { pattern: /\bwordpress|wp\b/, category: "wordpress", service: "wordpress-hosting" },
  { pattern: /\bmaintenance|maintain\b/, category: "maintenance", service: "website-maintenance" },
  { pattern: /\bmigrat\w*\b/, service: "website-migration" },
  { pattern: /\b(develop\w*|design|new website)\b/, service: "website-development" },
  { pattern: /\bdomain|dns\b/, service: "domain" },
  { pattern: /\bssl|https|certificate\b/, service: "ssl" },
  { pattern: /\bemail|mailbox\b/, service: "business-email" },
  { pattern: /\bsecurity|malware|hack\w*\b/, service: "website-security" },
  { pattern: /\bdedicated\b/, service: "dedicated-server" },
  { pattern: /\bshared|hosting\b/, category: "shared", service: "shared-hosting" },
]

export function detectTopic(text: string) {
  const query = normalize(text)
  return TOPICS.find((topic) => topic.pattern.test(query)) ?? null
}

/** The flow whose triggers best match `text` (most hits, then longest); the menu flow only as a last resort. */
export function matchFlow(text: string, flows: ConversationFlow[]) {
  const query = normalize(text)
  const scored = flows
    .map((flow) => {
      const matched = flow.triggers.map(normalize).filter((trigger) => containsPhrase(query, trigger))
      return { flow, hits: matched.length, length: matched.length ? Math.max(...matched.map((t) => t.length)) : 0 }
    })
    .filter((s) => s.hits > 0)
    .sort((a, b) => Number(a.flow.id === "menu") - Number(b.flow.id === "menu") || b.hits - a.hits || b.length - a.length)
  return scored[0]?.flow ?? null
}

// --- Building blocks -------------------------------------------------------------------------

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

const categoryInfo = (category: PlanCategory) => PLAN_CATEGORIES.find((c) => c.value === category) ?? PLAN_CATEGORIES[0]

const expertButton = (service: string, context?: string, label = "Talk to an expert"): ReplyButton => ({
  label,
  event: { type: "lead_start", service: isServiceValue(service) ? service : "not-sure", ...(context ? { context: context.slice(0, 200) } : {}) },
})

/** Buttons for the main topics: the "menu" flow's first step, or the quick actions. */
function menuButtons(kb: KnowledgeBase): ReplyButton[] {
  const menu = kb.settings.flows.find((flow) => flow.id === "menu")
  if (menu) return optionButtons(menu, menu.steps[0], [])
  return kb.settings.quickActions.map((action) => ({ label: action.label, event: { type: "quick_action", actionId: action.id } }))
}

/** A flow step's options as buttons; links open directly, everything else comes back as a flow_option event. */
function optionButtons(flow: ConversationFlow, step: FlowStepNode, trail: string[]): ReplyButton[] {
  return step.options.map((option) =>
    option.kind === "link" && option.value
      ? { label: option.label, href: option.value }
      : { label: option.label, event: { type: "flow_option", flowId: flow.id, stepId: step.id, optionId: option.id, trail: [...trail, option.label].slice(-6) } }
  )
}

function runStep(flow: ConversationFlow, step: FlowStepNode, trail: string[], entry: boolean): EngineResult {
  const replies: ReplyBlock[] = [say(step.message)]
  if (step.options.length) replies.push(buttons(optionButtons(flow, step, trail)))
  return { replies, log: [assistantLog("flow_step", step.message, { flowId: flow.id, flowName: flow.name, stepId: step.id, entry })] }
}

export function startFlow(kb: KnowledgeBase, flowId: string, trail: string[] = []): EngineResult | null {
  const flow = kb.settings.flows.find((f) => f.id === flowId)
  if (!flow?.steps.length) return null
  return runStep(flow, flow.steps[0], trail.length ? trail : [flow.name], true)
}

/** Plans in a category as cards, or a pointer to the category page when none are configured. Never a dead end. */
export function showPlans(kb: KnowledgeBase, category: PlanCategory, context?: string): EngineResult {
  const list = activePlans(kb, category)
  const info = categoryInfo(category)
  if (!list.length) {
    const text = `You'll find our current **${info.label}** options on the ${info.label} page — or I can connect you with our team for a recommendation and a quote.`
    return {
      replies: [say(text), buttons([{ label: `Open ${info.label}`, href: info.page }, { label: "Help me choose", event: { type: "flow_answer", answers: {} } }, expertButton(info.service, context ?? info.label)])],
      log: [assistantLog("plans", text, { category, planIds: [] })],
    }
  }
  const intro = `Here are our **${info.label}** plans:`
  return {
    replies: [
      say(intro),
      { type: "plans", plans: list.map(toPlanCard) },
      buttons([{ label: "Help me choose", event: { type: "flow_answer", answers: {} } }, expertButton(info.service, context ?? `${info.label} plans`), { label: "Other topics", event: { type: "flow_start", flowId: "menu" } }], "What next?"),
    ],
    log: [assistantLog("plans", intro, { category, planIds: list.map((p) => p.id) })],
  }
}

// --- Plan recommendation flow ----------------------------------------------------------------

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

/** The next unanswered question (answers are carried in each button's event), or the recommendation. */
export function advanceFlow(kb: KnowledgeBase, rawAnswers: Record<string, string>): EngineResult {
  const steps = kb.settings.flow.steps
  // Stale or forged answers are dropped, so the flow can't be steered outside its options.
  const answers = validAnswers(kb, rawAnswers)
  const next = steps.find((step) => !answers[step.id])
  if (next) {
    return {
      replies: [say(next.question), buttons(next.options.map((option) => ({ label: option.label, event: { type: "flow_answer", answers: { ...answers, [next.id]: option.id } } })))],
      log: [assistantLog("flow_question", next.question, { stepId: next.id })],
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
  const info = categoryInfo(category)
  const summary = chosen.map((option) => option.label).join(" · ")
  const restart: ReplyButton = { label: "Start over", event: { type: "flow_answer", answers: {} } }

  const list = activePlans(kb, category)
  if (!list.length) {
    const text = `Thanks! Based on your answers (${summary}), **${info.label}** is the right fit for you.`
    return {
      replies: [
        say(text),
        ...notes.map(say),
        say("Our team can confirm the exact plan and price for your setup."),
        buttons([expertButton(info.service, `Plan recommendation: ${info.label} (${summary})`, "Get my recommendation"), { label: `See ${info.label}`, href: info.page }, restart]),
      ],
      log: [assistantLog("recommendation", text, { category, planIds: [], answers })],
    }
  }
  const pick = list[Math.min(size, list.length) - 1]
  const alternative = list[list.indexOf(pick) + 1]
  const shown = alternative ? [pick, alternative] : [pick]
  const text = `Great — based on your answers (${summary}), I recommend **${pick.name}** (${info.label}).${alternative ? `\n\nIf you expect to grow quickly, **${alternative.name}** gives you more headroom.` : ""}`
  return {
    replies: [
      say(text),
      { type: "plans", plans: shown.map(toPlanCard) },
      ...notes.map(say),
      buttons([expertButton(info.service, `Recommended: ${pick.name} (${summary})`, "Talk to an expert"), { label: `Compare all ${info.label}`, event: { type: "show_plans", category } }, restart], "Would you like a hand with the next step?"),
    ],
    log: [assistantLog("recommendation", text, { category, planIds: [pick.id], recommendedPlan: pick.name, answers })],
  }
}

function startRecommendation(kb: KnowledgeBase, intro = "Let's find the right plan for you. Just a few quick questions:"): EngineResult {
  const flow = advanceFlow(kb, {})
  return { ...flow, replies: [say(intro), ...flow.replies] }
}

// --- FAQ answers -----------------------------------------------------------------------------

/** Up to four flows related to a FAQ (by category and wording), as "You may also be interested in" buttons. */
function relatedTopicButtons(kb: KnowledgeBase, faq: AssistantFaq): ReplyButton[] {
  const words = tokens(`${faq.category} ${faq.question}`)
  const scored = kb.settings.flows
    .filter((flow) => flow.id !== "menu")
    .map((flow) => {
      const flowWords = tokens(`${flow.id} ${flow.name} ${flow.triggers.join(" ")}`)
      let overlap = 0
      for (const word of words) if (flowWords.has(word)) overlap++
      return { flow, overlap }
    })
    .sort((a, b) => b.overlap - a.overlap)
  const picks = [...scored.filter((s) => s.overlap > 0), ...scored.filter((s) => s.overlap === 0)].slice(0, 4)
  return picks.map(({ flow }) => ({ label: flow.name, event: { type: "flow_start", flowId: flow.id } }))
}

function faqAnswer(kb: KnowledgeBase, faq: AssistantFaq, related: AssistantFaq[]): EngineResult {
  const replies: ReplyBlock[] = [say(faq.answer), buttons(relatedTopicButtons(kb, faq), "You may also be interested in:")]
  if (related.length) replies.push({ type: "suggestions", faqs: related.map((r) => ({ id: r.id, question: r.question })) })
  return { replies, log: [assistantLog("faq_answer", faq.answer, { faqId: faq.id, question: faq.question })] }
}

// --- Conversational lead capture -------------------------------------------------------------

export function startCapture(service: string, context?: string, intro = "I'd be happy to help. 😊"): EngineResult {
  const capture: LeadCapture = { step: "name", service: isServiceValue(service) ? service : "not-sure", ...(context ? { context: context.slice(0, 200) } : {}) }
  const text = `${intro}\n\nTo connect you with the right person on our team, may I know your name?`
  return { replies: [say(text)], log: [assistantLog("lead_prompt", text, { service: capture.service, context: capture.context })], state: { capture } }
}

const EMAIL = /[^\s@<>()"]+@[^\s@<>()"]+\.[^\s@<>()".]{2,}/
const looksLikeQuestion = (text: string) => text.includes("?") || text.trim().split(/\s+/).length > 6

/** Strips "my name is…", keeps letters and spaces, and title-cases the result. */
function extractName(text: string) {
  const cleaned = text
    .replace(/^\s*(hi|hello|hey)[,!.\s]+/i, "")
    .replace(/^\s*(my name is|my name's|name is|i am|i'm|im|this is|it's|its|call me|name:)\s+/i, "")
    .replace(/[^A-Za-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (cleaned.length < 2 || cleaned.length > 80 || cleaned.split(" ").length > 4) return null
  return cleaned.replace(/\b[a-z]/g, (c) => c.toUpperCase())
}

/** The 10-digit national number (same rule as the site's lead forms: drops +91 / a leading 0). */
function extractPhone(text: string) {
  let digits = text.replace(/\D/g, "")
  if (digits.length > 10 && digits.startsWith("91")) digits = digits.slice(2)
  else if (digits.length > 10 && digits.startsWith("0")) digits = digits.slice(1)
  return /^\d{10}$/.test(digits) ? digits : null
}

async function handleCapture(text: string, capture: LeadCapture, kb: KnowledgeBase, responders: AssistantResponder[]): Promise<EngineResult> {
  const keep = (next: LeadCapture): ConversationState => ({ capture: next })
  const ask = (message: string, next: LeadCapture): EngineResult => ({ replies: [say(message)], log: [assistantLog("lead_prompt", message, { step: next.step })], state: keep(next) })

  if (CANCEL.test(normalize(text))) {
    const message = "No problem — I won't take your details. What else can I help you with?"
    return { replies: [say(message), buttons(menuButtons(kb))], log: [assistantLog("lead_cancelled", message)] }
  }

  // A question in the middle of the capture gets answered; the capture then picks up where it left off.
  const sidetrack = async (reminder: string): Promise<EngineResult> => {
    const answer = await answerText(text, kb, {}, responders)
    return { ...answer, replies: [...answer.replies, say(reminder)], state: keep(capture) }
  }

  switch (capture.step) {
    case "name": {
      const name = extractName(text)
      if (!name) return looksLikeQuestion(text) ? sidetrack("Whenever you're ready, just tell me your name.") : ask("Sorry, I didn't quite catch that. What's your name?", capture)
      return ask(`Nice to meet you, ${firstName(name)}! 👋\n\nWhat's your email address?`, { ...capture, name, step: "email" })
    }
    case "email": {
      const email = text.match(EMAIL)?.[0]?.toLowerCase()
      if (!email) return looksLikeQuestion(text) ? sidetrack("And whenever you're ready — what's your email address?") : ask("Hmm, that doesn't look like an email address. Could you check it? (e.g. name@example.com)", capture)
      return ask("Thank you. What's the best phone number to reach you on?", { ...capture, email, step: "phone" })
    }
    case "phone": {
      const phone = extractPhone(text)
      if (!phone) return looksLikeQuestion(text) ? sidetrack("And the best phone number to reach you on?") : ask("Could you share a 10-digit phone number? For example 9876543210.", capture)
      const hint = capture.context ? `\n\n(I'll let the team know you were looking at: ${capture.context}.)` : ""
      return ask(`Great. Please tell me a little about your requirement.${hint}`, { ...capture, phone, step: "requirement" })
    }
    case "requirement": {
      const said = text.trim().replace(/\s+/g, " ")
      const nothingToAdd = /^(no|nope|nothing|none|that's it|thats it|skip|n\/a|na)\.?$/i.test(said)
      const requirement = (nothingToAdd ? capture.context ?? "" : capture.context ? `${said} (Topic: ${capture.context})` : said).slice(0, 900)
      if (requirement.length < 3) return ask("Could you tell me a little more about what you need? Even one line helps.", capture)
      const done: LeadCapture = { ...capture, requirement, step: "verify" }
      return {
        replies: [],
        log: [],
        state: keep(done),
        submitLead: { name: capture.name ?? "", email: capture.email ?? "", phone: capture.phone ?? "", service: capture.service, requirement },
      }
    }
    case "verify":
      return ask("Please complete the quick security check above so I can send your details.", capture)
  }
}

/** Replies after the API has delivered (or failed to deliver) a captured lead. */
export function leadSentReplies(kb: KnowledgeBase, lead: CompletedLead, preview = false): ReplyBlock[] {
  return [
    say(
      preview
        ? `Thanks, ${firstName(lead.name)}! (Preview only — on the website your details would now go to the team and appear in Leads.)`
        : `Thank you, ${firstName(lead.name)}! ✅ I've passed your details to our team — they'll get back to you shortly at **${lead.email}** or **${lead.phone}**.`
    ),
    say("Meanwhile, is there anything else I can help you with?"),
    buttons(menuButtons(kb)),
  ]
}

export function leadFailedReplies(contact: { phone: string; email: string }): ReplyBlock[] {
  return [
    say(`Sorry — I couldn't send your details just now. Please try again in a moment, or reach us directly on **${contact.phone}** or **${contact.email}**.`),
    buttons([{ label: "Try again", event: { type: "lead_confirm" } }]),
  ]
}

// --- Free text -------------------------------------------------------------------------------

const FALLBACK_TEXT = "I couldn't find an exact answer.\n\nWould you like our team to contact you?"

/** Answers free text (typed messages, starters without an action, "ask" quick actions). */
export async function answerText(text: string, kb: KnowledgeBase, state: ConversationState = {}, responders: AssistantResponder[] = []): Promise<EngineResult> {
  const query = normalize(text)
  const topic = detectTopic(text)
  const ranked = rankFaqs(text, kb.faqs)
  const best = ranked[0]
  const related = (skip?: string) => ranked.filter((r) => r.faq.id !== skip && r.score >= 1).slice(0, 3).map((r) => r.faq)

  if (!query) return { replies: [say("What would you like to know?"), buttons(menuButtons(kb))], log: [] }
  if (best?.score === 100) return faqAnswer(kb, best.faq, related(best.faq.id))
  if (GREETING.test(query) && query.split(" ").length <= 4) {
    const message = "Hi there! 👋 I'm here to help with hosting, domains, SSL, migrations and websites. What are you working on?"
    return { replies: [say(message), buttons(menuButtons(kb))], log: [assistantLog("text", message)] }
  }
  if (THANKS.test(query) && query.split(" ").length <= 4) {
    const message = "You're welcome! 😊 Is there anything else I can help you with?"
    return { replies: [say(message), buttons(menuButtons(kb))], log: [assistantLog("text", message)] }
  }
  if (RECOMMEND.test(query)) return startRecommendation(kb, "Happy to help you choose. A few quick questions:")
  if (PRICING.test(query) && topic?.category) return showPlans(kb, topic.category, text.slice(0, 200))
  if (best?.strong) return faqAnswer(kb, best.faq, related(best.faq.id))
  if (LEAD.test(query)) return startCapture(topic?.service ?? "not-sure", text.slice(0, 200), "I'd be happy to connect you with our team. 😊")

  const flow = matchFlow(text, kb.settings.flows)
  if (flow) {
    const started = startFlow(kb, flow.id)
    if (started) return started
  }
  if (topic?.category) return showPlans(kb, topic.category, text.slice(0, 200))

  for (const responder of responders) {
    const result = await responder.respond({ text, kb, state })
    if (result) return result
  }

  // Not understood. First time: guide with topics. Second time in a row: offer the team.
  const misses = Math.min((state.misses ?? 0) + 1, 9)
  const suggestions = ranked.slice(0, 3).map((r) => r.faq)
  const suggestionBlock: ReplyBlock[] = suggestions.length ? [{ type: "suggestions", faqs: suggestions.map((faq) => ({ id: faq.id, question: faq.question })) }] : []
  if (misses === 1) {
    const message = "I'm not sure I understood that one. Here's what I can help you with — or try asking in a different way:"
    return {
      replies: [say(message), buttons(menuButtons(kb)), ...suggestionBlock],
      log: [assistantLog("fallback", message, { question: text.slice(0, 300), suggested: suggestions.map((f) => f.id), misses })],
      state: { misses },
    }
  }
  return {
    replies: [
      say(FALLBACK_TEXT),
      buttons([expertButton(topic?.service ?? "not-sure", text.slice(0, 200), "Yes, contact me"), { label: "No, show me topics", event: { type: "flow_start", flowId: "menu" } }]),
      ...suggestionBlock,
    ],
    log: [assistantLog("fallback", FALLBACK_TEXT, { question: text.slice(0, 300), suggested: suggestions.map((f) => f.id), misses })],
    state: { misses },
  }
}

// --- Entry point -----------------------------------------------------------------------------

const sanitizeTrail = (trail: unknown) =>
  Array.isArray(trail) ? trail.filter((t): t is string => typeof t === "string").map((t) => t.replace(/[\u0000-\u001F]/g, "").slice(0, 60)).slice(-6) : []

async function runOption(kb: KnowledgeBase, flow: ConversationFlow, option: FlowStepOption, trail: string[], responders: AssistantResponder[]): Promise<EngineResult> {
  const context = trail.join(" › ")
  switch (option.kind) {
    case "step": {
      const target = flow.steps.find((s) => s.id === option.value)
      return target ? runStep(flow, target, trail, false) : unknownEvent(kb)
    }
    case "flow":
      return startFlow(kb, option.value ?? "", trail) ?? unknownEvent(kb)
    case "recommend":
      return startRecommendation(kb)
    case "plans":
      return isPlanCategory(option.value) ? showPlans(kb, option.value, context) : unknownEvent(kb)
    case "ask":
      return answerText(option.value ?? option.label, kb, {}, responders)
    case "lead":
      return startCapture(option.value ?? "not-sure", context, option.response ? "Our team will be glad to help." : "I'd be happy to help. 😊")
    case "link":
      return { replies: [say(option.label), { type: "link", label: `Open ${option.label}`, href: option.value ?? "/" }], log: [assistantLog("link", option.label, { href: option.value })] }
  }
}

/** Turns one visitor event (plus the echoed state) into the assistant's reply and the messages to store. */
export async function respond(event: AssistantEvent, kb: KnowledgeBase, state: ConversationState = {}, responders: AssistantResponder[] = []): Promise<EngineResult> {
  switch (event.type) {
    case "message": {
      const result = state.capture ? await handleCapture(event.text, state.capture, kb, responders) : await answerText(event.text, kb, state, responders)
      return { ...result, log: [visitorLog("text", event.text), ...result.log] }
    }
    case "lead_confirm": {
      const capture = state.capture
      if (capture?.step === "verify" && capture.name && capture.email && capture.phone && capture.requirement) {
        return { replies: [], log: [], state: { capture }, submitLead: { name: capture.name, email: capture.email, phone: capture.phone, service: capture.service, requirement: capture.requirement } }
      }
      return startCapture(capture?.service ?? "not-sure", capture?.context, "Let's try that again.")
    }
    case "lead_start": {
      const result = startCapture(event.service, event.context)
      return { ...result, log: [visitorLog("lead_start", "Talk to an expert", { service: event.service }), ...result.log] }
    }
    case "starter": {
      const starter = kb.settings.starters.find((s) => s.id === event.starterId)
      if (!starter) return unknownEvent(kb)
      const action = starter.actionId ? kb.settings.quickActions.find((a) => a.id === starter.actionId) : undefined
      const result = (starter.flowId && startFlow(kb, starter.flowId)) || (action ? await runQuickAction(action.id, kb, responders) : await answerText(starter.text, kb, {}, responders))
      return { ...result, log: [visitorLog("starter", starter.text, { starterId: starter.id }), ...result.log.filter((m) => m.role === "assistant")] }
    }
    case "quick_action": {
      const action = kb.settings.quickActions.find((a) => a.id === event.actionId)
      if (!action) return unknownEvent(kb)
      const result = await runQuickAction(action.id, kb, responders)
      return { ...result, log: [visitorLog("quick_action", action.label, { actionId: action.id, label: action.label }), ...result.log.filter((m) => m.role === "assistant")] }
    }
    case "faq": {
      const faq = kb.faqs.find((f) => f.id === event.faqId && f.status === "published")
      if (!faq) return unknownEvent(kb)
      const related = rankFaqs(faq.question, kb.faqs).filter((r) => r.faq.id !== faq.id && r.score >= 1).slice(0, 3).map((r) => r.faq)
      const result = faqAnswer(kb, faq, related)
      return { ...result, log: [visitorLog("faq_click", faq.question, { faqId: faq.id }), ...result.log] }
    }
    case "flow_start": {
      const result = startFlow(kb, event.flowId) ?? unknownEvent(kb)
      const name = kb.settings.flows.find((f) => f.id === event.flowId)?.name ?? event.flowId
      return { ...result, log: [visitorLog("flow_option", name, { flowId: event.flowId }), ...result.log] }
    }
    case "flow_option": {
      const flow = kb.settings.flows.find((f) => f.id === event.flowId)
      const step = flow?.steps.find((s) => s.id === event.stepId)
      const option = step?.options.find((o) => o.id === event.optionId)
      if (!flow || !step || !option) return unknownEvent(kb)
      const trail = sanitizeTrail(event.trail)
      const result = await runOption(kb, flow, option, trail.length ? trail : [flow.name, option.label], responders)
      const replies = option.response ? [say(option.response), ...result.replies] : result.replies
      return { ...result, replies, log: [visitorLog("flow_option", option.label, { flowId: flow.id, stepId: step.id, optionId: option.id }), ...result.log] }
    }
    case "show_plans": {
      const result = showPlans(kb, event.category)
      return { ...result, log: [visitorLog("flow_option", `Compare all ${planCategoryLabel(event.category)}`, { category: event.category }), ...result.log] }
    }
    case "flow_answer": {
      const answers = validAnswers(kb, event.answers)
      const result = advanceFlow(kb, answers)
      // The visitor's turn is their newest valid answer.
      const last = kb.settings.flow.steps.filter((step) => answers[step.id]).at(-1)
      const option = last?.options.find((o) => o.id === answers[last.id])
      return { ...result, log: [...(last && option ? [visitorLog("flow_answer", option.label, { stepId: last.id, optionId: option.id })] : []), ...result.log] }
    }
  }
}

async function runQuickAction(actionId: string, kb: KnowledgeBase, responders: AssistantResponder[]): Promise<EngineResult> {
  const action = kb.settings.quickActions.find((a) => a.id === actionId)
  if (!action) return unknownEvent(kb)
  switch (action.kind) {
    case "flow":
      return startFlow(kb, action.value ?? "", [action.label]) ?? unknownEvent(kb)
    case "recommend":
      return startRecommendation(kb)
    case "plans":
      return isPlanCategory(action.value) ? showPlans(kb, action.value, action.label) : unknownEvent(kb)
    case "ask": {
      // A quick action must never dead-end: if the FAQ search can't place it, start the matching flow or the menu.
      const result = await answerText(action.value ?? action.label, kb, {}, responders)
      if (!result.log.some((m) => m.kind === "fallback")) return result
      const flow = matchFlow(`${action.label} ${action.value ?? ""}`, kb.settings.flows)
      return (flow && startFlow(kb, flow.id, [action.label])) || { replies: [say(`Here's how I can help with ${action.label.toLowerCase()}:`), buttons(menuButtons(kb))], log: [assistantLog("text", action.label)] }
    }
    case "lead":
      return startCapture(action.value ?? "not-sure", action.label)
    case "link": {
      const text = `${action.label}:`
      return { replies: [say(text), { type: "link", label: `Open ${action.label}`, href: action.value ?? "/" }], log: [assistantLog("link", text, { href: action.value })] }
    }
  }
}

function unknownEvent(kb: KnowledgeBase): EngineResult {
  const text = "Sorry, that option isn't available any more. Here's what I can help you with:"
  return { replies: [say(text), buttons(menuButtons(kb))], log: [assistantLog("text", text)] }
}

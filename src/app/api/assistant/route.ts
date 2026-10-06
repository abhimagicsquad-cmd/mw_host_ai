import { NextResponse } from "next/server"
import { z } from "zod"

import { siteConfig } from "@/constants/site-config"
import { logActivity } from "@/lib/admin/activity"
import { leadFailedReplies, leadSentReplies, respond } from "@/lib/assistant/engine"
import { linkLeadToConversation, loadKnowledgeBase, openConversation, overLimit, recordHit, storeMessages, underLimit } from "@/lib/assistant/server"
import { PLAN_CATEGORIES, type AssistantResponse, type ConversationState, type ReplyBlock } from "@/lib/assistant/types"
import { deliverLead } from "@/lib/lead-delivery"
import { verifyTurnstile } from "@/lib/turnstile"
import { leadApiPayloadSchema } from "@/schemas/lead-form.schema"

export const runtime = "nodejs"

const ID = /^[a-z0-9-]{1,40}$/i

/** Removes control characters and collapses whitespace runs; the widget renders text, never HTML. */
const cleanText = (value: string) =>
  value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]+/g, " ")
    .trim()

const short = (max: number) => z.string().transform(cleanText).pipe(z.string().max(max))

const captureSchema = z.object({
  step: z.enum(["name", "email", "phone", "requirement", "verify"]),
  service: z.string().max(40),
  context: short(200).optional(),
  name: short(80).optional(),
  email: short(254).optional(),
  phone: z.string().regex(/^\d{10}$/).optional(),
  requirement: short(1000).optional(),
})

const requestSchema = z.object({
  visitorId: z.string().regex(/^[A-Za-z0-9_-]{8,64}$/),
  conversationId: z.string().uuid().nullish(),
  pageUrl: z.string().max(500).optional(),
  state: z.object({ capture: captureSchema.optional(), misses: z.number().int().min(0).max(10).optional() }).optional(),
  event: z.discriminatedUnion("type", [
    z.object({ type: z.literal("message"), text: z.string().transform(cleanText).pipe(z.string().min(1).max(500)) }),
    z.object({ type: z.literal("quick_action"), actionId: z.string().regex(ID) }),
    z.object({ type: z.literal("starter"), starterId: z.string().regex(ID) }),
    z.object({ type: z.literal("faq"), faqId: z.string().uuid() }),
    z.object({ type: z.literal("flow_answer"), answers: z.record(z.string().regex(ID), z.string().regex(ID)).refine((answers) => Object.keys(answers).length <= 10) }),
    z.object({ type: z.literal("flow_start"), flowId: z.string().regex(ID) }),
    z.object({ type: z.literal("flow_option"), flowId: z.string().regex(ID), stepId: z.string().regex(ID), optionId: z.string().regex(ID), trail: z.array(short(60)).max(6).optional() }),
    z.object({ type: z.literal("show_plans"), category: z.enum(PLAN_CATEGORIES.map((c) => c.value) as [string, ...string[]]) }),
    z.object({ type: z.literal("lead_start"), service: z.string().max(40), context: short(200).optional() }),
    z.object({ type: z.literal("lead_confirm"), turnstileToken: z.string().max(2048).nullish() }),
  ]),
})

function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown"
}

const fail = (status: number, error: string) => NextResponse.json({ conversationId: null, replies: [], error } satisfies AssistantResponse, { status })

/**
 * The website widget's only endpoint. Stateless apart from storage: the widget sends the
 * visitor's event plus the small conversation state it was given last time; the reply comes from
 * the rule-based engine using the dashboard's settings, flows, FAQs and plans. When the
 * conversational lead capture is complete, the lead goes through the shared lead pipeline.
 */
export async function POST(request: Request) {
  // Browser calls are same-origin; refuse cross-site posts outright.
  const origin = request.headers.get("origin")
  if (origin && URL.parse(origin)?.host !== new URL(request.url).host) return fail(403, "Forbidden.")

  const ip = clientIp(request)
  if (overLimit(`assistant:${ip}`, 40, 60_000) || overLimit(`assistant-hour:${ip}`, 400, 3_600_000)) {
    return fail(429, "You're sending messages very quickly. Please wait a moment and try again.")
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return fail(400, "Invalid request.")
  }
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) return fail(422, "Please keep messages under 500 characters.")
  const { visitorId, conversationId, event, pageUrl } = parsed.data
  const state = parsed.data.state as ConversationState | undefined

  const kb = await loadKnowledgeBase("live")
  if (!kb.settings.enabled) return fail(403, "The assistant is currently unavailable.")

  // New stored conversations are capped per IP so storage can't be flooded. Only conversations
  // actually created count (none are while migration 0006 hasn't run).
  const newChatKey = `assistant-new:${ip}`
  const conversation = await openConversation(visitorId, conversationId, pageUrl, {
    allowed: () => underLimit(newChatKey, 15, 3_600_000),
    record: () => recordHit(newChatKey),
  })
  if (conversation === "limited") return fail(429, "Too many new chats from your network. Please try again later.")
  if (conversation === "full") return fail(429, "This chat is very long — please start a new one, or contact our team directly.")

  const result = await respond(event as Parameters<typeof respond>[0], kb, state ?? {})
  let replies: ReplyBlock[] = result.replies
  let nextState = result.state
  let leadSent = false
  const log = [...result.log]

  if (result.submitLead) {
    const lead = result.submitLead
    const token = event.type === "lead_confirm" ? event.turnstileToken : null
    const valid = leadApiPayloadSchema.safeParse({ ...lead, message: lead.requirement, source: "hosting-assistant", pageUrl })
    if (!valid.success) {
      // Shouldn't happen (the engine validated each answer), but never send an invalid lead.
      replies = [{ type: "text", text: "Sorry, something about those details didn't look right. Let's try once more — what's your name?" }]
      nextState = { capture: { step: "name", service: lead.service } }
    } else if (!(await verifyTurnstile(token, ip))) {
      // Only when Turnstile is configured: the widget runs the check, then confirms.
      replies = [{ type: "text", text: token ? "The security check didn't pass — please try it once more." : "One last step — please complete the quick security check below." }, { type: "verify" }]
    } else if (overLimit(`assistant-lead:${ip}`, 5, 600_000)) {
      replies = [{ type: "text", text: `You've sent several enquiries in a short time. Please try again in a few minutes, or call us on ${siteConfig.contact.phone}.` }]
    } else {
      const delivery = await deliverLead({ name: lead.name, email: lead.email, phone: lead.phone, service: lead.service, message: lead.requirement, source: "hosting-assistant", pageUrl })
      if (delivery.ok) {
        replies = leadSentReplies(kb, lead)
        nextState = undefined
        leadSent = true
        log.push({ role: "assistant", kind: "lead_sent", body: `Lead sent: ${lead.name} <${lead.email}>`, metadata: { leadId: delivery.leadId, service: lead.service } })
        if (!delivery.duplicate) {
          const linked = conversation ? await linkLeadToConversation(conversation.id, visitorId, delivery.leadId, `Enquiry sent: ${lead.name} <${lead.email}>`) : false
          await logActivity({
            username: "Hosting Assistant",
            action: "assistant.lead_captured",
            entityType: "lead",
            entityId: delivery.leadId,
            description: `Hosting Assistant captured a lead: ${lead.name} <${lead.email}> (${lead.service})`,
            metadata: { conversationId: linked && conversation ? conversation.id : null, source: "hosting-assistant" },
          })
          // linkLeadToConversation stored one message; keep the counter in step before storing this turn.
          if (linked && conversation) conversation.messageCount += 1
        }
      } else {
        replies = leadFailedReplies(siteConfig.contact)
      }
    }
  }

  if (conversation) await storeMessages(conversation, log)

  return NextResponse.json({
    conversationId: conversation?.id ?? null,
    replies,
    ...(nextState ? { state: nextState } : {}),
    ...(leadSent ? { leadSent } : {}),
  } satisfies AssistantResponse)
}

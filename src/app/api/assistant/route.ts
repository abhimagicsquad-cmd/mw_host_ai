import { NextResponse } from "next/server"
import { z } from "zod"

import { respond } from "@/lib/assistant/engine"
import { loadKnowledgeBase, openConversation, overLimit, recordHit, storeMessages, underLimit } from "@/lib/assistant/server"
import type { AssistantResponse } from "@/lib/assistant/types"

import "@/schemas/shared" // zod jitless mode (CSP-safe), as every form schema uses

export const runtime = "nodejs"

const ID = /^[a-z0-9-]{1,40}$/i

/** Removes control characters and collapses whitespace runs; the widget renders text, never HTML. */
const cleanText = (value: string) =>
  value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]+/g, " ")
    .trim()

const requestSchema = z.object({
  visitorId: z.string().regex(/^[A-Za-z0-9_-]{8,64}$/),
  conversationId: z.string().uuid().nullish(),
  pageUrl: z.string().max(500).optional(),
  event: z.discriminatedUnion("type", [
    z.object({ type: z.literal("message"), text: z.string().transform(cleanText).pipe(z.string().min(1).max(500)) }),
    z.object({ type: z.literal("quick_action"), actionId: z.string().regex(ID) }),
    z.object({ type: z.literal("starter"), starterId: z.string().regex(ID) }),
    z.object({ type: z.literal("faq"), faqId: z.string().uuid() }),
    z.object({
      type: z.literal("flow_answer"),
      answers: z.record(z.string().regex(ID), z.string().regex(ID)).refine((answers) => Object.keys(answers).length <= 10),
    }),
  ]),
})

function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown"
}

const fail = (status: number, error: string) => NextResponse.json({ conversationId: null, replies: [], error } satisfies AssistantResponse, { status })

/**
 * The website widget's only endpoint. Stateless apart from storage: the widget sends the
 * visitor's event (and, during the recommendation flow, the answers so far); the reply comes
 * from the rule-based engine using the dashboard's settings, FAQs and plans.
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

  const result = await respond(event, kb)
  if (conversation) await storeMessages(conversation, result.log)

  return NextResponse.json({
    conversationId: conversation?.id ?? null,
    replies: result.replies,
    ...(result.flowAnswers ? { flowAnswers: result.flowAnswers } : {}),
  } satisfies AssistantResponse)
}

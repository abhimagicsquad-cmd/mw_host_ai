import { NextResponse } from "next/server"

import { siteConfig } from "@/constants/site-config"
import { logActivity } from "@/lib/admin/activity"
import { linkLeadToConversation } from "@/lib/assistant/server"
import { deliverLead } from "@/lib/lead-delivery"
import { verifyTurnstile } from "@/lib/turnstile"
import { leadApiPayloadSchema } from "@/schemas/lead-form.schema"

export const runtime = "nodejs"

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 5
const MIN_FILL_TIME_MS = 1500

// Best-effort, in-memory only — resets on cold start/redeploy. Sufficient to blunt casual
// abuse on a lead form; swap for Vercel KV/Upstash if traffic grows enough to need it.
const requestLog = new Map<string, number[]>()

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown"
  return request.headers.get("x-real-ip") ?? "unknown"
}

/** Drops stale entries so the in-memory map can't grow without bound. */
function pruneStale(now: number) {
  if (requestLog.size < 1000) return
  for (const [key, timestamps] of requestLog) {
    if (timestamps.every((timestamp) => now - timestamp >= RATE_LIMIT_WINDOW_MS)) requestLog.delete(key)
  }
}

function isRateLimited(ip: string) {
  const now = Date.now()
  pruneStale(now)
  const timestamps = (requestLog.get(ip) ?? []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS)
  timestamps.push(now)
  requestLog.set(ip, timestamps)
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS
}

export async function POST(request: Request) {
  const ip = getClientIp(request)

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, message: `Too many requests. Please try again in a few minutes, or call us on ${siteConfig.contact.phone}.` },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 })
  }

  const parsed = leadApiPayloadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Please check the form for errors and try again." },
      { status: 422 }
    )
  }

  const { name, phone, email, message, website, source, formRenderedAt, service, company, hostingType, pageUrl, turnstileToken, assistantConversationId, assistantVisitorId } =
    parsed.data

  if (!(await verifyTurnstile(turnstileToken, ip))) {
    return NextResponse.json({ success: false, message: `The security check failed. Please try again, or call us on ${siteConfig.contact.phone}.` }, { status: 403 })
  }

  const isLikelyBot =
    Boolean(website) || (typeof formRenderedAt === "number" && Date.now() - formRenderedAt < MIN_FILL_TIME_MS)
  if (isLikelyBot) {
    return NextResponse.json({ success: true, message: "Thanks — we've received your details and will be in touch shortly." })
  }

  const delivery = await deliverLead({ name, phone, email, message, source, service, company, hostingType, pageUrl })
  if (!delivery.ok) {
    return NextResponse.json(
      {
        success: false,
        message: `Something went wrong saving your request. Please call us directly at ${siteConfig.contact.phone} or try again.`,
      },
      { status: 502 }
    )
  }
  if (delivery.duplicate) {
    return NextResponse.json({ success: true, message: "Thanks — we've received your details and will be in touch shortly." })
  }

  // Hosting Assistant enquiries: link the lead to its conversation and note it in the activity log.
  if (assistantConversationId && assistantVisitorId) {
    const leadId = delivery.leadId
    const linked = await linkLeadToConversation(assistantConversationId, assistantVisitorId, leadId, `Enquiry sent: ${name} <${email}>`)
    await logActivity({
      username: "Hosting Assistant",
      action: "assistant.lead_captured",
      entityType: "lead",
      entityId: leadId,
      description: `Hosting Assistant captured a lead: ${name} <${email}>${service ? ` (${service})` : ""}`,
      metadata: { conversationId: linked ? assistantConversationId : null, source },
    })
  }

  return NextResponse.json({
    success: true,
    message: "Thanks — we've received your details and will be in touch shortly.",
  })
}

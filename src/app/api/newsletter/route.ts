import { NextResponse } from "next/server"

import { sendNewsletterNotificationEmail } from "@/lib/email"
import { storeNewsletterSubscriber } from "@/lib/newsletter-store"
import { verifyTurnstile } from "@/lib/turnstile"
import { newsletterApiPayloadSchema } from "@/schemas/newsletter-form.schema"

export const runtime = "nodejs"

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 5
const MIN_FILL_TIME_MS = 1500

// Best-effort, in-memory only — resets on cold start/redeploy, same tradeoff as /api/leads.
const requestLog = new Map<string, number[]>()

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown"
  return request.headers.get("x-real-ip") ?? "unknown"
}

/** Drops stale entries so the in-memory maps can't grow without bound. */
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
    return NextResponse.json({ success: false, message: "Too many requests. Please try again in a few minutes." }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 })
  }

  const parsed = newsletterApiPayloadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Please enter a valid email address." }, { status: 422 })
  }

  const { email, website, source, formRenderedAt, pageUrl, turnstileToken } = parsed.data

  if (!(await verifyTurnstile(turnstileToken, ip))) {
    return NextResponse.json({ success: false, message: "The security check failed. Please try again." }, { status: 403 })
  }

  const isLikelyBot =
    Boolean(website) || (typeof formRenderedAt === "number" && Date.now() - formRenderedAt < MIN_FILL_TIME_MS)

  if (isLikelyBot) {
    return NextResponse.json({ success: true, message: "You're subscribed!" })
  }

  const result = await storeNewsletterSubscriber({ email, source, pageUrl })

  if (!result.stored && !result.skipped) {
    console.error("[api/newsletter] Supabase insert failed.", { email })
    return NextResponse.json({ success: false, message: "Something went wrong. Please try again." }, { status: 502 })
  }

  const alreadySubscribed = result.stored && "alreadySubscribed" in result && result.alreadySubscribed
  if (!alreadySubscribed) {
    // The subscriber is saved either way; a failed notification is logged, not shown to them.
    const notified = await sendNewsletterNotificationEmail({ email, source, pageUrl })
    if (!notified.sent && !notified.skipped) console.error("[api/newsletter] Notification email failed after the subscriber was stored.", { email })
  }

  return NextResponse.json({
    success: true,
    message: alreadySubscribed ? "You're already subscribed!" : "You're subscribed!",
  })
}

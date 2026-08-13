import { NextResponse } from "next/server"

import { storeNewsletterSubscriber } from "@/lib/newsletter-store"
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

function isRateLimited(ip: string) {
  const now = Date.now()
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

  const { email, website, source, formRenderedAt, pageUrl } = parsed.data

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

  return NextResponse.json({
    success: true,
    message: result.stored && "alreadySubscribed" in result && result.alreadySubscribed ? "You're already subscribed!" : "You're subscribed!",
  })
}

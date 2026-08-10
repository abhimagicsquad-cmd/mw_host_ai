import { NextResponse } from "next/server"

import { siteConfig } from "@/constants/site-config"
import { sendLeadNotificationEmail } from "@/lib/email"
import { storeLead } from "@/lib/leads-store"
import { leadApiPayloadSchema } from "@/schemas/lead-form.schema"

export const runtime = "nodejs"

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 5
const DUPLICATE_WINDOW_MS = 60 * 1000
const MIN_FILL_TIME_MS = 1500

// Best-effort, in-memory only — resets on cold start/redeploy. Sufficient to blunt casual
// abuse on a lead form; swap for Vercel KV/Upstash if traffic grows enough to need it.
const requestLog = new Map<string, number[]>()
const recentSubmissions = new Map<string, number>()

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

function markAndCheckDuplicate(key: string) {
  const now = Date.now()
  const lastSeen = recentSubmissions.get(key)
  recentSubmissions.set(key, now)
  return typeof lastSeen === "number" && now - lastSeen < DUPLICATE_WINDOW_MS
}

export async function POST(request: Request) {
  const ip = getClientIp(request)

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Please try again in a few minutes." },
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

  const { name, phone, email, message, website, source, formRenderedAt, service, company, hostingType, pageUrl } =
    parsed.data

  const isLikelyBot =
    Boolean(website) || (typeof formRenderedAt === "number" && Date.now() - formRenderedAt < MIN_FILL_TIME_MS)

  const isDuplicate = markAndCheckDuplicate(`${email.toLowerCase()}:${phone}`)

  if (isLikelyBot || isDuplicate) {
    return NextResponse.json({
      success: true,
      message: "Thanks — we've received your details and will be in touch shortly.",
    })
  }

  const [storeResult, emailResult] = await Promise.all([
    storeLead({ name, phone, email, message, source, service, company, hostingType, pageUrl }),
    sendLeadNotificationEmail({ name, phone, email, message, source, service, company, hostingType }),
  ])

  if (!storeResult.stored && !storeResult.skipped) {
    // Case C/D: the durable record failed to save — that's the one outcome we can't let
    // silently succeed, even if the notification email went out (emailResult.sent).
    console.error("[api/leads] Supabase insert failed; lead was not persisted.", {
      email,
      source,
      emailSent: emailResult.sent,
    })
    return NextResponse.json(
      {
        success: false,
        message: `Something went wrong saving your request. Please call us directly at ${siteConfig.contact.phone} or try again.`,
      },
      { status: 502 }
    )
  }

  if (!emailResult.sent && !emailResult.skipped) {
    // Case B: lead is safely stored (or Supabase isn't configured yet); only the
    // notification email failed — log it, but don't fail the user's submission.
    console.error("[api/leads] Notification email failed after the lead was stored.", { email, source })
  }

  return NextResponse.json({
    success: true,
    message: "Thanks — we've received your details and will be in touch shortly.",
  })
}

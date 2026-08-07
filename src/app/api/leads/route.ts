import { NextResponse } from "next/server"

import { siteConfig } from "@/constants/site-config"
import { sendLeadNotificationEmail } from "@/lib/email"
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

  const { name, phone, email, message, company, source, formRenderedAt } = parsed.data

  const isLikelyBot =
    Boolean(company) || (typeof formRenderedAt === "number" && Date.now() - formRenderedAt < MIN_FILL_TIME_MS)

  const isDuplicate = markAndCheckDuplicate(`${email.toLowerCase()}:${phone}`)

  if (!isLikelyBot && !isDuplicate) {
    const result = await sendLeadNotificationEmail({ name, phone, email, message, source })

    if (!result.sent && !result.skipped) {
      return NextResponse.json(
        {
          success: false,
          message: `Something went wrong sending your request. Please call us directly at ${siteConfig.contact.phone} or try again.`,
        },
        { status: 502 }
      )
    }
  }

  return NextResponse.json({
    success: true,
    message: "Thanks — we've received your details and will be in touch shortly.",
  })
}

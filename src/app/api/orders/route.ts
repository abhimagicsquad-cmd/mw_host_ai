import { randomUUID } from "node:crypto"

import { NextResponse } from "next/server"

import { siteConfig } from "@/constants/site-config"
import { sendOrderNotificationEmail } from "@/lib/email"
import { storeOrder } from "@/lib/orders-store"
import { orderApiPayloadSchema } from "@/schemas/order-form.schema"

export const runtime = "nodejs"

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 5
const DUPLICATE_WINDOW_MS = 60 * 1000
const MIN_FILL_TIME_MS = 1500

// Best-effort, in-memory only — resets on cold start/redeploy, same tradeoff as /api/leads.
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

function generateOrderRef() {
  return `MWH-${randomUUID().slice(0, 8).toUpperCase()}`
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

  const parsed = orderApiPayloadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Please check the form for errors and try again." },
      { status: 422 }
    )
  }

  const { name, phone, email, company, website, source, formRenderedAt, pageUrl, planSlug, planName, billingCycle, billingLabel, amount } =
    parsed.data

  const isLikelyBot =
    Boolean(website) || (typeof formRenderedAt === "number" && Date.now() - formRenderedAt < MIN_FILL_TIME_MS)

  const isDuplicate = markAndCheckDuplicate(`${email.toLowerCase()}:${planSlug}`)

  // A mock order reference is always returned, even for a suppressed duplicate/bot
  // resubmission, so the checkout flow's confirmation step always has a ref to show.
  const orderRef = generateOrderRef()

  if (isLikelyBot || isDuplicate) {
    return NextResponse.json({
      success: true,
      orderRef,
      message: "Your order (test mode) was placed successfully.",
    })
  }

  const [storeResult, emailResult] = await Promise.all([
    storeOrder({ orderRef, planSlug, planName, billingCycle, billingLabel, amount, name, email, phone, company, source, pageUrl }),
    sendOrderNotificationEmail({ orderRef, planName, billingLabel, amount, name, email, phone, company }),
  ])

  if (!storeResult.stored && !storeResult.skipped) {
    console.error("[api/orders] Supabase insert failed; order was not persisted.", { orderRef, email, emailSent: emailResult.sent })
    return NextResponse.json(
      {
        success: false,
        message: `Something went wrong saving your order. Please call us directly at ${siteConfig.contact.phone} or try again.`,
      },
      { status: 502 }
    )
  }

  if (!emailResult.sent && !emailResult.skipped) {
    console.error("[api/orders] Notification email failed after the order was stored.", { orderRef, email })
  }

  return NextResponse.json({
    success: true,
    orderRef,
    message: "Your order (test mode) was placed successfully.",
  })
}

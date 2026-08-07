import { Resend } from "resend"

import { hostingTypeOptions, serviceOptions } from "@/constants/service-options"
import { siteConfig } from "@/constants/site-config"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || "MagicWorks Host <onboarding@resend.dev>"
const NOTIFICATION_ADDRESS = process.env.LEAD_NOTIFICATION_EMAIL || siteConfig.contact.email

export type LeadEmailPayload = {
  name: string
  phone: string
  email: string
  message?: string
  source?: string
  service?: string
  company?: string
  hostingType?: string
}

export type SendEmailResult = { sent: true } | { sent: false; skipped: true } | { sent: false; skipped: false; error: unknown }

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/** Strips non-printable control characters and trims — a minimal sanitization pass before a value is embedded in an email body. */
function sanitize(value: string) {
  return value
    .split("")
    .filter((char) => {
      const code = char.charCodeAt(0)
      return code > 31 && code !== 127
    })
    .join("")
    .trim()
}

function serviceLabel(value?: string) {
  if (!value) return ""
  return serviceOptions.find((option) => option.value === value)?.label ?? value
}

function hostingTypeLabel(value?: string) {
  if (!value) return ""
  return hostingTypeOptions.find((option) => option.value === value)?.label ?? value
}

export async function sendLeadNotificationEmail(payload: LeadEmailPayload): Promise<SendEmailResult> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY is not set — logging lead instead of sending email.", payload)
    return { sent: false, skipped: true }
  }

  const name = sanitize(payload.name)
  const phone = sanitize(payload.phone)
  const email = sanitize(payload.email)
  const message = payload.message ? sanitize(payload.message) : ""
  const source = payload.source ? sanitize(payload.source) : "website"
  const company = payload.company ? sanitize(payload.company) : ""
  const service = serviceLabel(payload.service)
  const hostingType = hostingTypeLabel(payload.hostingType)

  const extraRows = [
    company ? { label: "Company", value: company } : null,
    service ? { label: "Service", value: service } : null,
    hostingType ? { label: "Hosting type", value: hostingType } : null,
  ].filter((row): row is { label: string; value: string } => row !== null)

  const html = `
    <div style="font-family:sans-serif;font-size:14px;line-height:1.6;color:#1c2329">
      <h2 style="margin:0 0 16px;color:#2a363f">New lead &mdash; ${escapeHtml(source)}</h2>
      <p style="margin:0 0 4px"><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p style="margin:0 0 4px"><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      <p style="margin:0 0 4px"><strong>Email:</strong> ${escapeHtml(email)}</p>
      ${extraRows.map((row) => `<p style="margin:0 0 4px"><strong>${escapeHtml(row.label)}:</strong> ${escapeHtml(row.value)}</p>`).join("")}
      ${message ? `<p style="margin:16px 0 4px"><strong>Message:</strong></p><p style="margin:0;white-space:pre-wrap">${escapeHtml(message)}</p>` : ""}
    </div>
  `

  const text = [
    `New lead - ${source}`,
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email}`,
    ...extraRows.map((row) => `${row.label}: ${row.value}`),
    message ? `\nMessage:\n${message}` : "",
  ]
    .filter(Boolean)
    .join("\n")

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: NOTIFICATION_ADDRESS,
      replyTo: email,
      subject: `New lead from ${source}: ${name}`,
      html,
      text,
    })

    if (error) {
      console.error("[email] Resend returned an error", error)
      return { sent: false, skipped: false, error }
    }

    return { sent: true }
  } catch (error) {
    console.error("[email] Failed to send lead notification", error)
    return { sent: false, skipped: false, error }
  }
}

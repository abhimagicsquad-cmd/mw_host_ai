import "server-only"

import { Resend } from "resend"

import { hostingTypeOptions, serviceOptions } from "@/constants/service-options"
import { AFFILIATE_SERVICE_VALUE } from "@/schemas/lead-form.schema"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

/**
 * Sender. Until a domain is verified in Resend, only Resend's shared test sender works (and it
 * can only deliver to the Resend account owner's address). After verifying magicworkshost.com
 * in Resend, set EMAIL_FROM_ADDRESS, e.g. "MagicWorks Host <notifications@magicworkshost.com>".
 */
const FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || "MagicWorks Host <onboarding@resend.dev>"

/** Where website enquiries are sent (ADMIN_NOTIFICATION_EMAIL overrides; comma-separate several). */
const NOTIFICATION_ADDRESSES = (process.env.ADMIN_NOTIFICATION_EMAIL || "abhimagicsquad@gmail.com")
  .split(",")
  .map((address) => address.trim())
  .filter(Boolean)

export type LeadEmailPayload = {
  name: string
  phone: string
  email: string
  message?: string
  source?: string
  service?: string
  company?: string
  hostingType?: string
  pageUrl?: string
}

export type SendEmailResult = { sent: true; id: string } | { sent: false; skipped: true } | { sent: false; skipped: false; error: unknown }

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
  if (value === AFFILIATE_SERVICE_VALUE) return "Affiliate Programme application"
  if (!value) return ""
  return serviceOptions.find((option) => option.value === value)?.label ?? value
}

function hostingTypeLabel(value?: string) {
  if (!value) return ""
  return hostingTypeOptions.find((option) => option.value === value)?.label ?? value
}

/** "contact-page:quote" → which form was used, for the subject line. */
function formLabel(source: string) {
  return /quote/i.test(source) ? "Quote request" : "Enquiry"
}

function submittedAt() {
  return new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) + " IST"
}

type Row = { label: string; value: string }

function renderEmail(heading: string, rows: Row[], message?: string) {
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#1c2329">
      <h2 style="margin:0 0 16px;color:#2a363f">${escapeHtml(heading)}</h2>
      ${rows.map((row) => `<p style="margin:0 0 4px"><strong>${escapeHtml(row.label)}:</strong> ${escapeHtml(row.value)}</p>`).join("")}
      ${message ? `<p style="margin:16px 0 4px"><strong>Message:</strong></p><p style="margin:0;white-space:pre-wrap">${escapeHtml(message)}</p>` : ""}
      <p style="margin:24px 0 0;font-size:12px;color:#666">Sent by the magicworkshost.com website. Reply to this email to answer the customer directly.</p>
    </div>
  `
  const text = [heading, "", ...rows.map((row) => `${row.label}: ${row.value}`), message ? `\nMessage:\n${message}` : ""].filter((line) => line !== undefined).join("\n")
  return { html, text }
}

async function send(options: { subject: string; html: string; text: string; replyTo?: string }, logPayload: unknown): Promise<SendEmailResult> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY is not set — logging instead of sending email.", logPayload)
    return { sent: false, skipped: true }
  }
  try {
    const { data, error } = await resend.emails.send({ from: FROM_ADDRESS, to: NOTIFICATION_ADDRESSES, ...options })
    if (error || !data) {
      console.error("[email] Resend returned an error", error)
      return { sent: false, skipped: false, error }
    }
    console.info("[email] notification accepted by Resend", { id: data.id, subject: options.subject })
    return { sent: true, id: data.id }
  } catch (error) {
    console.error("[email] Failed to send notification", error)
    return { sent: false, skipped: false, error }
  }
}

export async function sendLeadNotificationEmail(payload: LeadEmailPayload): Promise<SendEmailResult> {
  const name = sanitize(payload.name)
  const email = sanitize(payload.email)
  const source = payload.source ? sanitize(payload.source) : "website"
  const message = payload.message ? sanitize(payload.message) : ""
  const rows: Row[] = [
    { label: "Name", value: name },
    { label: "Phone", value: sanitize(payload.phone) },
    { label: "Email", value: email },
    ...(payload.company ? [{ label: "Company", value: sanitize(payload.company) }] : []),
    ...(payload.service ? [{ label: "Service", value: serviceLabel(payload.service) }] : []),
    ...(payload.hostingType ? [{ label: "Hosting type", value: hostingTypeLabel(payload.hostingType) }] : []),
    { label: "Form", value: source },
    ...(payload.pageUrl ? [{ label: "Page", value: sanitize(payload.pageUrl) }] : []),
    { label: "Submitted", value: submittedAt() },
  ]
  const kind = formLabel(source)
  const { html, text } = renderEmail(`New website ${kind.toLowerCase()} from ${name}`, rows, message)
  return send({ subject: `${kind} from ${name} — MagicWorks Host website`, html, text, replyTo: email }, payload)
}

export async function sendNewsletterNotificationEmail(payload: { email: string; source?: string; pageUrl?: string; alreadySubscribed?: boolean }): Promise<SendEmailResult> {
  const email = sanitize(payload.email)
  const rows: Row[] = [
    { label: "Email", value: email },
    { label: "Form", value: payload.source ? sanitize(payload.source) : "newsletter" },
    ...(payload.pageUrl ? [{ label: "Page", value: sanitize(payload.pageUrl) }] : []),
    { label: "Submitted", value: submittedAt() },
  ]
  const { html, text } = renderEmail("New newsletter subscriber", rows)
  return send({ subject: `New newsletter subscriber: ${email} — MagicWorks Host website`, html, text, replyTo: email }, payload)
}

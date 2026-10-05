import "server-only"

import { sendLeadNotificationEmail } from "@/lib/email"
import { storeLead, type LeadRecord } from "@/lib/leads-store"

const DUPLICATE_WINDOW_MS = 60 * 1000

// Best-effort, in-memory only — resets on cold start/redeploy (as the per-route rate limits do).
const recentSubmissions = new Map<string, number>()

function pruneStale(now: number) {
  if (recentSubmissions.size < 1000) return
  for (const [key, seenAt] of recentSubmissions) {
    if (now - seenAt >= DUPLICATE_WINDOW_MS) recentSubmissions.delete(key)
  }
}

export type DeliveryResult =
  /** Saved (or skipped because storage isn't configured) and the team notified. */
  | { ok: true; duplicate: false; leadId: string | null }
  /** The same email + phone was sent in the last minute; treated as success, nothing new saved. */
  | { ok: true; duplicate: true; leadId: null }
  /** The durable record couldn't be saved — the visitor must be told and can retry. */
  | { ok: false }

/**
 * The shared lead pipeline behind every lead source (website forms via /api/leads, and the
 * Hosting Assistant's conversational capture): duplicate guard → Supabase `leads` → notification
 * email. Input must already be validated (leadApiPayloadSchema).
 */
export async function deliverLead(lead: LeadRecord): Promise<DeliveryResult> {
  const now = Date.now()
  pruneStale(now)
  const key = `${lead.email.toLowerCase()}:${lead.phone}`
  const lastSeen = recentSubmissions.get(key)
  recentSubmissions.set(key, now)
  if (typeof lastSeen === "number" && now - lastSeen < DUPLICATE_WINDOW_MS) return { ok: true, duplicate: true, leadId: null }

  const [storeResult, emailResult] = await Promise.all([storeLead(lead), sendLeadNotificationEmail(lead)])

  if (!storeResult.stored && !storeResult.skipped) {
    // Forget this submission so the visitor's retry is saved, not swallowed as a duplicate.
    recentSubmissions.delete(key)
    // The durable record failed to save — the one outcome we can't let silently succeed,
    // even if the notification email went out.
    console.error("[leads] Supabase insert failed; lead was not persisted.", { email: lead.email, source: lead.source, emailSent: emailResult.sent })
    return { ok: false }
  }

  if (!emailResult.sent && !emailResult.skipped) {
    // The lead is stored (or Supabase isn't configured yet); only the notification failed — log it.
    console.error("[leads] Notification email failed after the lead was stored.", { email: lead.email, source: lead.source })
  }

  return { ok: true, duplicate: false, leadId: storeResult.stored ? storeResult.id : null }
}

import { supabaseAdmin } from "@/lib/supabase/server-client"

export type LeadRecord = {
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

export type StoreLeadResult =
  | { stored: true; skipped: false }
  | { stored: false; skipped: true }
  | { stored: false; skipped: false; error: unknown }

/**
 * Inserts a lead into Supabase. Mirrors `sendLeadNotificationEmail`'s skip/error shape so
 * /api/leads can reason about both outcomes the same way. Returns `skipped: true` (not an
 * error) when Supabase isn't configured yet, so the pipeline degrades to "email only" instead
 * of failing every submission — see docs/09-project-accounts.md for why this wasn't wired up
 * until now.
 */
export async function storeLead(lead: LeadRecord): Promise<StoreLeadResult> {
  if (!supabaseAdmin) {
    console.warn("[leads-store] Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) — skipping persistence.", {
      email: lead.email,
    })
    return { stored: false, skipped: true }
  }

  const { error } = await supabaseAdmin.from("leads").insert({
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    message: lead.message || null,
    source: lead.source || null,
    service: lead.service || null,
    company: lead.company || null,
    hosting_type: lead.hostingType || null,
    page_url: lead.pageUrl || null,
  })

  if (error) {
    console.error("[leads-store] Supabase insert failed", { error, email: lead.email, source: lead.source })
    return { stored: false, skipped: false, error }
  }

  return { stored: true, skipped: false }
}

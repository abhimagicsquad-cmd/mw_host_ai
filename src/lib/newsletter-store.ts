import { supabaseAdmin } from "@/lib/supabase/server-client"

export type NewsletterRecord = {
  email: string
  source?: string
  pageUrl?: string
}

export type StoreSubscriberResult =
  | { stored: true; skipped: false; alreadySubscribed: boolean }
  | { stored: false; skipped: true; alreadySubscribed: false }
  | { stored: false; skipped: false; alreadySubscribed: false; error: unknown }

const POSTGRES_UNIQUE_VIOLATION = "23505"

/** Inserts a newsletter subscriber into Supabase. Mirrors `storeLead`'s skip/error shape. */
export async function storeNewsletterSubscriber(record: NewsletterRecord): Promise<StoreSubscriberResult> {
  if (!supabaseAdmin) {
    console.warn(
      "[newsletter-store] Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) — skipping persistence.",
      { email: record.email }
    )
    return { stored: false, skipped: true, alreadySubscribed: false }
  }

  const { error } = await supabaseAdmin.from("newsletter_subscribers").insert({
    email: record.email.toLowerCase(),
    source: record.source || null,
    page_url: record.pageUrl || null,
  })

  if (error) {
    if (error.code === POSTGRES_UNIQUE_VIOLATION) {
      return { stored: true, skipped: false, alreadySubscribed: true }
    }
    console.error("[newsletter-store] Supabase insert failed", { error, email: record.email })
    return { stored: false, skipped: false, alreadySubscribed: false, error }
  }

  return { stored: true, skipped: false, alreadySubscribed: false }
}

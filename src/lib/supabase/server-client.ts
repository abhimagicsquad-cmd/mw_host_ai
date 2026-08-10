import { createClient } from "@supabase/supabase-js"

/**
 * Server-only client using the service role key — bypasses RLS, so it must never be imported
 * from a "use client" file or exposed via a NEXT_PUBLIC_ env var. Used exclusively by
 * /api/leads to insert validated, rate-limited lead submissions.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null

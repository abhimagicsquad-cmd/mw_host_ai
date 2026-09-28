import "server-only"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/** Cache tag on every public CMS read — invalidated by admin server actions via `updateTag`. */
export const CMS_CACHE_TAG = "cms"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const isCmsConfigured = Boolean(supabaseUrl && serviceRoleKey)

function build(fetchImpl: typeof fetch): SupabaseClient | null {
  if (!supabaseUrl || !serviceRoleKey) return null
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { fetch: fetchImpl },
  })
}

/**
 * Website reads: every GET is cached in Next's data cache under the "cms" tag so pages stay
 * static/fast, and saving anything in the admin expires the tag so the change is live on
 * the next request. Non-GETs (none today) are never cached.
 */
export const cmsPublicDb = build((input, init) => {
  const method = (init?.method ?? "GET").toUpperCase()
  if (method !== "GET") return fetch(input, init)
  return fetch(input, { ...init, cache: "force-cache", next: { tags: [CMS_CACHE_TAG] } })
})

/** Admin reads/writes: always fresh. Service role — server only, never import from a client file. */
export const cmsAdminDb = build((input, init) => fetch(input, { ...init, cache: "no-store" }))

/** PostgREST error code for "relation does not exist" — i.e. the CMS migration hasn't been run. */
export function isMissingTableError(error: { code?: string; message?: string } | null | undefined) {
  if (!error) return false
  return error.code === "42P01" || error.code === "PGRST205" || /does not exist|schema cache/i.test(error.message ?? "")
}

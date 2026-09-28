import "server-only"

import { updateTag } from "next/cache"

import { AuthorizationError } from "@/lib/admin/auth"
import { CMS_CACHE_TAG, isMissingTableError } from "@/lib/cms/db"
import type { ActionState } from "@/lib/cms/types"

/** Turns anything thrown inside an action into a user-facing `ActionState` error. */
export function toActionError(error: unknown): ActionState {
  if (error instanceof AuthorizationError) return { error: error.message }
  const pgError = error as { code?: string; message?: string } | null
  if (isMissingTableError(pgError)) {
    return { error: "CMS tables are missing — run supabase/migrations/0004_create_cms.sql in the Supabase SQL editor." }
  }
  if (pgError?.code === "23505") return { error: "That value is already in use (must be unique)." }
  console.error("[admin action]", error)
  return { error: pgError?.message || "Something went wrong. Please try again." }
}

/** Expires every cached CMS read so the live website reflects the change on the next request. */
export function refreshWebsite() {
  updateTag(CMS_CACHE_TAG)
}

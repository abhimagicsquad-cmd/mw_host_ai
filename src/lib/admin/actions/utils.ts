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

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
/** Most rows a single bulk action may touch (the admin lists load at most 500). */
export const BULK_LIMIT = 500

/** Validates the id list a bulk action receives from the client: unique UUIDs, 1–BULK_LIMIT of them. */
export function parseBulkIds(ids: unknown): string[] | null {
  if (!Array.isArray(ids)) return null
  const unique = [...new Set(ids)]
  if (!unique.length || unique.length > BULK_LIMIT) return null
  return unique.every((id) => typeof id === "string" && UUID.test(id)) ? (unique as string[]) : null
}

export const BULK_SELECTION_ERROR: ActionState = { error: `Select between 1 and ${BULK_LIMIT} items and try again.` }

/** "1 page" / "3 pages". */
export function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`
}

/** Expires every cached CMS read so the live website reflects the change on the next request. */
export function refreshWebsite() {
  updateTag(CMS_CACHE_TAG)
}

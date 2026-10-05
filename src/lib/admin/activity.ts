import "server-only"

import { headers } from "next/headers"

import { cmsAdminDb } from "@/lib/cms/db"

import { actorId, type CurrentAdmin } from "./auth"

export type ActivityAction =
  | "auth.login"
  | "auth.login_failed"
  | "auth.logout"
  | "auth.password_changed"
  | "page.created"
  | "page.updated"
  | "page.deleted"
  | "page.published"
  | "page.unpublished"
  | "page.duplicated"
  | "content.updated"
  | "media.uploaded"
  | "media.replaced"
  | "media.updated"
  | "media.deleted"
  | "seo.updated"
  | "menu.updated"
  | "user.created"
  | "user.updated"
  | "user.deleted"
  | "user.activated"
  | "user.deactivated"
  | "lead.status_changed"
  | "lead.deleted"
  | "lead.exported"
  | "settings.updated"
  | "system.cache_cleared"

export async function getClientIp(): Promise<string | null> {
  const h = await headers()
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null
}

type ActivityEntry = {
  admin?: CurrentAdmin | null
  username?: string
  action: ActivityAction
  entityType?: string
  entityId?: string | null
  description: string
  metadata?: Record<string, unknown>
}

/** Best-effort audit log write — never throws, so logging can't break the action being logged. */
export async function logActivity(entry: ActivityEntry) {
  await logActivities([entry])
}

/** Several entries in one insert (bulk actions log one row per affected item). Never throws. */
export async function logActivities(entries: ActivityEntry[]) {
  if (!cmsAdminDb || !entries.length) return
  try {
    const ip = await getClientIp()
    const { error } = await cmsAdminDb.from("activity_logs").insert(
      entries.map((entry) => ({
        user_id: entry.admin ? actorId(entry.admin) : null,
        username: entry.admin?.username ?? entry.username ?? null,
        action: entry.action,
        entity_type: entry.entityType ?? null,
        entity_id: entry.entityId ?? null,
        description: entry.description,
        metadata: entry.metadata ?? null,
        ip_address: ip,
      }))
    )
    if (error) console.warn("[activity] insert failed", error.message)
  } catch (error) {
    console.warn("[activity] insert failed", error)
  }
}

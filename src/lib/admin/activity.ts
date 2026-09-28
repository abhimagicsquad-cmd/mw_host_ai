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
  | "settings.updated"
  | "system.import"
  | "system.cache_cleared"

export async function getClientIp(): Promise<string | null> {
  const h = await headers()
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null
}

/** Best-effort audit log write — never throws, so logging can't break the action being logged. */
export async function logActivity(entry: {
  admin?: CurrentAdmin | null
  username?: string
  action: ActivityAction
  entityType?: string
  entityId?: string | null
  description: string
  metadata?: Record<string, unknown>
}) {
  if (!cmsAdminDb) return
  try {
    const { error } = await cmsAdminDb.from("activity_logs").insert({
      user_id: entry.admin ? actorId(entry.admin) : null,
      username: entry.admin?.username ?? entry.username ?? null,
      action: entry.action,
      entity_type: entry.entityType ?? null,
      entity_id: entry.entityId ?? null,
      description: entry.description,
      metadata: entry.metadata ?? null,
      ip_address: await getClientIp(),
    })
    if (error) console.warn("[activity] insert failed", error.message)
  } catch (error) {
    console.warn("[activity] insert failed", error)
  }
}

"use server"

import { z } from "zod"

import { logActivity } from "@/lib/admin/activity"
import { actorId, authorizeAction } from "@/lib/admin/auth"
import { cmsAdminDb } from "@/lib/cms/db"
import type { ActionState, GeneralSettings, WebsiteSettings } from "@/lib/cms/types"

import { refreshWebsite, toActionError } from "./utils"

function db() {
  if (!cmsAdminDb) throw new Error("The CMS database is not configured.")
  return cmsAdminDb
}

const text = (max = 500) => z.string().trim().max(max).optional().transform((v) => v || undefined)

const generalSchema = z.object({
  siteName: text(100),
  tagline: text(200),
  description: text(500),
  contactPhone: text(50),
  contactPhoneHref: text(60),
  contactEmail: text(200),
  contactAddress: text(500),
  salesHours: text(100),
  accountingHours: text(100),
  supportHours: text(100),
})

const ctaSchema = z.object({ label: z.string().trim().max(60), href: z.string().trim().max(500) }).optional()

const websiteSchema = z.object({
  headerCta: ctaSchema,
  globalCta: ctaSchema,
  socialLinks: z.array(z.object({ platform: z.string().trim().max(40), url: z.string().trim().max(500) })).max(12),
  defaultMetaTitle: text(120),
  defaultMetaDescription: text(320),
})

async function saveSettings(key: "general" | "website", value: GeneralSettings | WebsiteSettings, admin: Awaited<ReturnType<typeof authorizeAction>>) {
  const { error } = await db()
    .from("settings")
    .upsert({ key, value, updated_by: actorId(admin), updated_at: new Date().toISOString() }, { onConflict: "key" })
  if (error) throw error
  await logActivity({ admin, action: "settings.updated", entityType: "settings", entityId: key, description: `Updated ${key} settings` })
  refreshWebsite()
}

export async function saveGeneralSettingsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await authorizeAction("settings.manage")
    const parsed = generalSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return { error: parsed.error.issues[0]?.message }
    await saveSettings("general", parsed.data, admin)
    return { ok: true, message: "General settings saved — live now." }
  } catch (error) {
    return toActionError(error)
  }
}

export async function saveWebsiteSettingsAction(payload: string): Promise<ActionState> {
  try {
    const admin = await authorizeAction("settings.manage")
    const parsed = websiteSchema.safeParse(JSON.parse(payload))
    if (!parsed.success) return { error: parsed.error.issues[0]?.message }
    const value: WebsiteSettings = {
      ...parsed.data,
      headerCta: parsed.data.headerCta?.label ? parsed.data.headerCta : undefined,
      globalCta: parsed.data.globalCta?.label ? parsed.data.globalCta : undefined,
      socialLinks: parsed.data.socialLinks.filter((link) => link.platform && link.url),
    }
    await saveSettings("website", value, admin)
    return { ok: true, message: "Website settings saved — live now." }
  } catch (error) {
    return toActionError(error)
  }
}

export async function clearWebsiteCacheAction(): Promise<ActionState> {
  try {
    const admin = await authorizeAction("system.cache")
    refreshWebsite()
    await logActivity({ admin, action: "system.cache_cleared", entityType: "system", description: "Cleared the website content cache" })
    return { ok: true, message: "Website cache cleared — every page will re-read the CMS on its next visit." }
  } catch (error) {
    return toActionError(error)
  }
}


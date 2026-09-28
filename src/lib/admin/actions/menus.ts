"use server"

import { z } from "zod"

import { logActivity } from "@/lib/admin/activity"
import { actorId, authorizeAction } from "@/lib/admin/auth"
import { cmsAdminDb } from "@/lib/cms/db"
import type { ActionState, MenuLocation } from "@/lib/cms/types"

import { refreshWebsite, toActionError } from "./utils"

const href = z.string().trim().min(1, "Every link needs a URL").max(500)
const label = z.string().trim().min(1, "Every link needs a label").max(100)

const linkSchema = z.object({ label, href, description: z.string().max(300).optional(), icon: z.string().optional(), external: z.boolean().optional() })
const columnSchema = z.object({ heading: z.string().trim().max(100).optional(), links: z.array(linkSchema) })

const headerSchema = z.array(
  z.object({
    label,
    href: z.string().trim().max(500).optional(),
    external: z.boolean().optional(),
    columns: z.array(columnSchema).optional(),
    featured: z
      .object({ title: z.string().trim(), description: z.string().optional(), href: z.string().trim(), icon: z.string().optional() })
      .optional(),
  })
)

const footerSchema = z.array(columnSchema)

/** Drops empty optional fields so the stored JSON matches the website's nav shape exactly. */
function prune<T>(value: T): T {
  if (Array.isArray(value)) return value.map(prune) as T
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {}
    for (const [key, v] of Object.entries(value)) {
      if (v === "" || v === undefined || v === null || v === false) continue
      if (key === "featured" && typeof v === "object" && !(v as { title?: string }).title) continue
      if (Array.isArray(v) && v.length === 0 && key !== "links") continue
      out[key] = prune(v)
    }
    return out as T
  }
  return value
}

export async function saveMenuAction(location: MenuLocation, payload: string): Promise<ActionState> {
  try {
    const admin = await authorizeAction("menus.manage")
    if (!cmsAdminDb) throw new Error("The CMS database is not configured.")

    const schema = location === "header" ? headerSchema : footerSchema
    const parsed = schema.safeParse(JSON.parse(payload))
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid menu" }

    const { error } = await cmsAdminDb
      .from("menus")
      .upsert({ location, items: prune(parsed.data), updated_by: actorId(admin), updated_at: new Date().toISOString() }, { onConflict: "location" })
    if (error) throw error

    await logActivity({ admin, action: "menu.updated", entityType: "menu", entityId: location, description: `Updated the ${location} menu` })
    refreshWebsite()
    return { ok: true, message: `${location === "header" ? "Header" : "Footer"} menu saved — live now.` }
  } catch (error) {
    return toActionError(error)
  }
}

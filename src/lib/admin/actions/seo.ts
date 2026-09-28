"use server"

import { z } from "zod"

import { logActivity } from "@/lib/admin/activity"
import { actorId, authorizeAction } from "@/lib/admin/auth"
import { cmsAdminDb } from "@/lib/cms/db"
import { normalizePath } from "@/lib/cms/paths"
import type { ActionState } from "@/lib/cms/types"

import { refreshWebsite, toActionError } from "./utils"

const optionalText = (max: number) => z.string().trim().max(max).optional().transform((v) => v || null)
const optionalUrl = z
  .string()
  .trim()
  .max(1000)
  .optional()
  .transform((v) => v || null)
  .refine((v) => !v || /^(https?:\/\/|\/)/.test(v), "Must be an absolute URL (https://…) or a site path (/…)")

const seoSchema = z.object({
  path: z.string().trim().min(1, "Path is required"),
  meta_title: optionalText(120),
  meta_description: optionalText(320),
  canonical_url: optionalUrl,
  no_index: z.string().optional().transform((v) => v === "on"),
  og_title: optionalText(120),
  og_description: optionalText(320),
  og_image: optionalUrl,
  twitter_card: z.enum(["", "summary", "summary_large_image"]).optional().transform((v) => v || null),
  twitter_title: optionalText(120),
  twitter_description: optionalText(320),
  twitter_image: optionalUrl,
  schema_json: z.string().optional(),
})

export async function saveSeoAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await authorizeAction("seo.manage")
    if (!cmsAdminDb) throw new Error("The CMS database is not configured.")

    const parsed = seoSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      return { error: issue?.message, fieldErrors: { [String(issue?.path[0])]: issue?.message ?? "" } }
    }
    const { schema_json: rawSchema, ...fields } = parsed.data
    const path = normalizePath(fields.path)

    let schemaJson: unknown = null
    if (rawSchema?.trim()) {
      try {
        schemaJson = JSON.parse(rawSchema)
      } catch {
        return { error: "Schema must be valid JSON.", fieldErrors: { schema_json: "Invalid JSON" } }
      }
      if (typeof schemaJson !== "object" || schemaJson === null) {
        return { error: "Schema must be a JSON object or array.", fieldErrors: { schema_json: "Must be an object or array" } }
      }
    }

    const { data: page } = await cmsAdminDb.from("pages").select("id").eq("path", path).maybeSingle()

    const { error } = await cmsAdminDb.from("seo").upsert(
      {
        ...fields,
        path,
        page_id: page?.id ?? null,
        schema_json: schemaJson,
        updated_by: actorId(admin),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "path" }
    )
    if (error) throw error

    await logActivity({ admin, action: "seo.updated", entityType: "seo", entityId: path, description: `Updated SEO for ${path}` })
    refreshWebsite()
    return { ok: true, message: "SEO saved — live on the website now." }
  } catch (error) {
    return toActionError(error)
  }
}

export async function deleteSeoAction(path: string): Promise<ActionState> {
  try {
    const admin = await authorizeAction("seo.manage")
    if (!cmsAdminDb) throw new Error("The CMS database is not configured.")
    const { error } = await cmsAdminDb.from("seo").delete().eq("path", path)
    if (error) throw error
    await logActivity({ admin, action: "seo.updated", entityType: "seo", entityId: path, description: `Reset SEO for ${path} to page defaults` })
    refreshWebsite()
    return { ok: true, message: "SEO override removed." }
  } catch (error) {
    return toActionError(error)
  }
}

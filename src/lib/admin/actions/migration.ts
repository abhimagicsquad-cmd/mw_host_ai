"use server"

import { z } from "zod"

import { logActivity } from "@/lib/admin/activity"
import { actorId, authorizeAction } from "@/lib/admin/auth"
import { cmsAdminDb } from "@/lib/cms/db"
import { buildMigrationPlan, plannedSections } from "@/lib/cms/migration"
import { PRICING_COLLECTION_KEY } from "@/lib/cms/templates"
import type { ActionState } from "@/lib/cms/types"

import { refreshWebsite, toActionError } from "./utils"

function db() {
  if (!cmsAdminDb) throw new Error("The CMS database is not configured.")
  return cmsAdminDb
}

export type ImportReport = ActionState & { created?: string[]; skipped?: string[]; warnings?: string[]; pricing?: "created" | "skipped" }

/**
 * Copies every page the website shows today into the CMS as DRAFTS. Drafts are invisible to
 * visitors, so this changes nothing on the live site; each page goes live only when
 * published. Existing CMS pages and the pricing collection are never overwritten, so it is
 * safe to run again (e.g. after adding content to Sanity).
 */
export async function importAllContentAction(): Promise<ImportReport> {
  try {
    const admin = await authorizeAction("system.import")
    const plan = await buildMigrationPlan()

    const { data: existingRows, error: existingError } = await db().from("pages").select("path")
    if (existingError) throw existingError
    const existing = new Set((existingRows ?? []).map((row) => row.path as string))

    const created: string[] = []
    const skipped: string[] = []
    for (const page of plan.pages) {
      if (existing.has(page.path)) {
        skipped.push(page.path)
        continue
      }
      const { data: row, error } = await db()
        .from("pages")
        .insert({
          title: page.title,
          path: page.path,
          page_type: page.pageType,
          status: "draft",
          created_by: actorId(admin),
          updated_by: actorId(admin),
        })
        .select("id")
        .single()
      if (error) throw new Error(`${page.path}: ${error.message}`)

      const sections = plannedSections(page).map((section) => ({ ...section, page_id: row.id }))
      if (sections.length) {
        const { error: sectionsError } = await db().from("page_sections").insert(sections)
        if (sectionsError) throw new Error(`${page.path} sections: ${sectionsError.message}`)
      }
      // SEO is deliberately not imported. Every Sanity SEO value on the site today equals the
      // route's built-in default, so published CMS pages keep identical metadata without it —
      // and an SEO row can't reach the live site while its page is still a draft.
      created.push(page.path)
    }

    const { data: pricingRow } = await db().from("settings").select("key").eq("key", PRICING_COLLECTION_KEY).maybeSingle()
    let pricing: ImportReport["pricing"] = "skipped"
    if (!pricingRow) {
      const { error } = await db()
        .from("settings")
        .insert({ key: PRICING_COLLECTION_KEY, value: { published: false, plans: plan.pricing.plans }, updated_by: actorId(admin) })
      if (error) throw error
      pricing = "created"
    }

    await logActivity({
      admin,
      action: "system.import",
      entityType: "system",
      description: `Imported existing website content as drafts (${created.length} pages created, ${skipped.length} already in CMS)`,
      metadata: { created, skipped, pricing, warnings: plan.warnings },
    })
    return {
      ok: true,
      message: `${created.length} pages imported as drafts${skipped.length ? `, ${skipped.length} already existed` : ""}. Nothing is live until you publish.`,
      created,
      skipped,
      warnings: plan.warnings,
      pricing,
    }
  } catch (error) {
    return toActionError(error)
  }
}

const idsSchema = z.array(z.uuid()).min(1).max(500)

/** Publishes several draft pages at once (used after the migration has been reviewed). */
export async function publishPagesAction(pageIds: string[]): Promise<ActionState> {
  try {
    const admin = await authorizeAction("pages.publish")
    const parsed = idsSchema.safeParse(pageIds)
    if (!parsed.success) return { error: "Select at least one page." }
    const now = new Date().toISOString()
    const { data, error } = await db()
      .from("pages")
      .update({ status: "published", published_at: now, updated_by: actorId(admin), updated_at: now })
      .in("id", parsed.data)
      .eq("status", "draft")
      .select("path")
    if (error) throw error
    await logActivity({
      admin,
      action: "page.published",
      entityType: "page",
      description: `Published ${data?.length ?? 0} migrated pages`,
      metadata: { paths: data?.map((row) => row.path) },
    })
    refreshWebsite()
    return { ok: true, message: `${data?.length ?? 0} pages published — they are live now.` }
  } catch (error) {
    return toActionError(error)
  }
}

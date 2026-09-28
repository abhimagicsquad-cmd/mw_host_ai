"use server"

import { redirect } from "next/navigation"
import { z } from "zod"

import { logActivity } from "@/lib/admin/activity"
import { actorId, authorizeAction } from "@/lib/admin/auth"
import { cmsAdminDb } from "@/lib/cms/db"
import { normalizePath, validatePagePath } from "@/lib/cms/paths"
import { isSectionType, sectionSchemaMap } from "@/lib/cms/section-schemas"
import { templateForPath, templates, templateSectionType } from "@/lib/cms/templates"
import type { ActionState, PageRow, PageSectionRow, PageStatus, PageType } from "@/lib/cms/types"

import { refreshWebsite, toActionError } from "./utils"

const PAGE_TYPES = ["home", "service", "product", "category", "static", "landing", "blog"] as const

const pageDetailsSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  path: z.string().trim().min(1, "URL is required"),
  page_type: z.enum(PAGE_TYPES),
  excerpt: z.string().trim().max(500).optional(),
  featured_image: z.string().trim().max(1000).optional(),
})

function db() {
  if (!cmsAdminDb) throw new Error("The CMS database is not configured.")
  return cmsAdminDb
}

function parseDetails(formData: FormData) {
  const parsed = pageDetailsSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return { error: { error: issue?.message, fieldErrors: { [String(issue?.path[0])]: issue?.message ?? "" } } as ActionState }
  }
  const path = normalizePath(parsed.data.path)
  const pathError = validatePagePath(path, parsed.data.page_type)
  if (pathError) return { error: { error: pathError, fieldErrors: { path: pathError } } as ActionState }
  // Template URLs dictate their page type (e.g. /legal/* is always a static template page).
  const template = templateForPath(path)
  const page_type = template ? templates[template].pageType : parsed.data.page_type
  return { template, data: { ...parsed.data, page_type, path, excerpt: parsed.data.excerpt || null, featured_image: parsed.data.featured_image || null } }
}

export async function createPageAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let pageId: string
  try {
    const admin = await authorizeAction("pages.edit")
    const result = parseDetails(formData)
    if (result.error) return result.error

    const starter = formData.get("starter")
    const { data, error } = await db()
      .from("pages")
      .insert({ ...result.data, status: "draft", created_by: actorId(admin), updated_by: actorId(admin) })
      .select("id, title, path")
      .single()
    if (error) throw error
    pageId = data.id

    const starterSections = result.template
      ? [{ type: templateSectionType(result.template), data: structuredClone(templates[result.template].defaults) }]
      : starter === "landing"
          ? [
              { type: "pageHeroBlock", data: { ...sectionSchemaMap.pageHeroBlock.defaults, title: data.title } },
              { type: "featureGridBlock", data: sectionSchemaMap.featureGridBlock.defaults },
              { type: "faqBlock", data: sectionSchemaMap.faqBlock.defaults },
              { type: "ctaBannerBlock", data: sectionSchemaMap.ctaBannerBlock.defaults },
            ]
          : starter === "basic"
            ? [
                { type: "pageHeroBlock", data: { ...sectionSchemaMap.pageHeroBlock.defaults, title: data.title } },
                { type: "richTextBlock", data: { content: "" } },
              ]
            : []
    if (starterSections.length) {
      await db()
        .from("page_sections")
        .insert(starterSections.map((section, position) => ({ ...section, page_id: data.id, position })))
    }

    await logActivity({ admin, action: "page.created", entityType: "page", entityId: data.id, description: `Created page “${data.title}” (${data.path})` })
  } catch (error) {
    return toActionError(error)
  }
  redirect(`/admin/pages/${pageId}?created=1`)
}

export async function updatePageDetailsAction(pageId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await authorizeAction("pages.edit")
    const result = parseDetails(formData)
    if (result.error) return result.error

    // A template page's content only fits the route family it was made for.
    const { data: current } = await db().from("pages").select("path").eq("id", pageId).single()
    if (current && templateForPath(current.path) !== result.template) {
      const message = templateForPath(current.path)
        ? `This ${templates[templateForPath(current.path)!].label.toLowerCase()} must keep a URL of the same kind.`
        : "Page-builder pages can't move to a URL that uses a fixed template."
      return { error: message, fieldErrors: { path: message } }
    }

    const { data, error } = await db()
      .from("pages")
      .update({ ...result.data, updated_by: actorId(admin), updated_at: new Date().toISOString() })
      .eq("id", pageId)
      .select("title, path")
      .single()
    if (error) throw error

    // Keep the linked SEO row's path in sync with the page URL.
    await db().from("seo").update({ path: data.path }).eq("page_id", pageId)

    await logActivity({ admin, action: "page.updated", entityType: "page", entityId: pageId, description: `Updated details of “${data.title}”` })
    refreshWebsite()
    return { ok: true, message: "Page details saved." }
  } catch (error) {
    return toActionError(error)
  }
}

const sectionsPayloadSchema = z.array(
  z.object({
    id: z.uuid(),
    type: z.string().refine(isSectionType, "Unknown section type"),
    data: z.record(z.string(), z.unknown()),
    is_visible: z.boolean(),
  })
)

/** Saves the full ordered list of sections for a page (upsert present, delete removed). */
export async function saveSectionsAction(pageId: string, payload: string): Promise<ActionState> {
  try {
    const admin = await authorizeAction("pages.edit")
    const parsed = sectionsPayloadSchema.safeParse(JSON.parse(payload))
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid sections" }

    const now = new Date().toISOString()
    const rows = parsed.data.map((section, position) => ({ ...section, page_id: pageId, position, updated_at: now }))
    const keepIds = rows.map((row) => row.id)

    if (rows.length) {
      const { error } = await db().from("page_sections").upsert(rows, { onConflict: "id" })
      if (error) throw error
    }
    let deleteQuery = db().from("page_sections").delete().eq("page_id", pageId)
    if (keepIds.length) deleteQuery = deleteQuery.not("id", "in", `(${keepIds.join(",")})`)
    const { error: deleteError } = await deleteQuery
    if (deleteError) throw deleteError

    const { data: page } = await db()
      .from("pages")
      .update({ updated_by: actorId(admin), updated_at: now })
      .eq("id", pageId)
      .select("title")
      .single()

    await logActivity({
      admin,
      action: "content.updated",
      entityType: "page",
      entityId: pageId,
      description: `Edited content of “${page?.title ?? pageId}” (${rows.length} sections)`,
    })
    refreshWebsite()
    return { ok: true, message: "Content saved." }
  } catch (error) {
    return toActionError(error)
  }
}

export async function setPageStatusAction(pageId: string, status: PageStatus): Promise<ActionState> {
  try {
    const admin = await authorizeAction("pages.publish")
    const { data: current } = await db().from("pages").select("published_at").eq("id", pageId).single()
    const { data, error } = await db()
      .from("pages")
      .update({
        status,
        published_at: status === "published" ? (current?.published_at ?? new Date().toISOString()) : current?.published_at,
        updated_by: actorId(admin),
        updated_at: new Date().toISOString(),
      })
      .eq("id", pageId)
      .select("title, path")
      .single()
    if (error) throw error

    await logActivity({
      admin,
      action: status === "published" ? "page.published" : "page.unpublished",
      entityType: "page",
      entityId: pageId,
      description: `${status === "published" ? "Published" : "Unpublished"} “${data.title}” (${data.path})`,
    })
    refreshWebsite()
    return { ok: true, message: status === "published" ? "Page is live." : "Page moved to drafts." }
  } catch (error) {
    return toActionError(error)
  }
}

export async function deletePageAction(pageId: string): Promise<ActionState> {
  try {
    const admin = await authorizeAction("pages.delete")
    const { data, error } = await db().from("pages").delete().eq("id", pageId).select("title, path").single()
    if (error) throw error
    await logActivity({ admin, action: "page.deleted", entityType: "page", entityId: pageId, description: `Deleted page “${data.title}” (${data.path})` })
    refreshWebsite()
    return { ok: true, message: "Page deleted." }
  } catch (error) {
    return toActionError(error)
  }
}

export async function duplicatePageAction(pageId: string): Promise<ActionState> {
  let newId: string
  try {
    const admin = await authorizeAction("pages.edit")
    const { data: source, error } = await db().from("pages").select("*, sections:page_sections(*)").eq("id", pageId).single()
    if (error) throw error
    const page = source as PageRow & { sections: PageSectionRow[] }

    // Find a free "-copy", "-copy-2", ... path. Home can't be duplicated onto "/".
    const base = page.path === "/" ? "/home-copy" : `${page.path}-copy`
    let path = base
    for (let i = 2; i < 50; i++) {
      const { count } = await db().from("pages").select("id", { count: "exact", head: true }).eq("path", path)
      if (!count) break
      path = `${base}-${i}`
    }
    const pageType: PageType = page.page_type === "home" ? "landing" : page.page_type
    const pathError = validatePagePath(path, pageType)
    if (pathError) return { error: `Can't duplicate: ${pathError}` }
    if (templateForPath(path) !== templateForPath(page.path)) {
      return { error: "This page has a single fixed URL, so it can't be duplicated." }
    }

    const { data: copy, error: insertError } = await db()
      .from("pages")
      .insert({
        title: `${page.title} (Copy)`,
        path,
        page_type: pageType,
        status: "draft",
        excerpt: page.excerpt,
        featured_image: page.featured_image,
        created_by: actorId(admin),
        updated_by: actorId(admin),
      })
      .select("id")
      .single()
    if (insertError) throw insertError
    newId = copy.id

    if (page.sections?.length) {
      const { error: sectionsError } = await db()
        .from("page_sections")
        .insert(page.sections.map(({ type, position, data, is_visible }) => ({ page_id: copy.id, type, position, data, is_visible })))
      if (sectionsError) throw sectionsError
    }

    await logActivity({ admin, action: "page.duplicated", entityType: "page", entityId: copy.id, description: `Duplicated “${page.title}” to ${path}` })
  } catch (error) {
    return toActionError(error)
  }
  redirect(`/admin/pages/${newId}?duplicated=1`)
}

/**
 * Saves the content of a structured template page (its single `template:<key>` section).
 * The template is derived from the page URL, so content always matches the route rendering it.
 */
export async function saveTemplateAction(pageId: string, payload: string): Promise<ActionState> {
  try {
    const admin = await authorizeAction("pages.edit")
    const { data: page, error: pageError } = await db().from("pages").select("title, path").eq("id", pageId).single()
    if (pageError) throw pageError
    const template = templateForPath(page.path)
    if (!template) return { error: "This page is not a template page." }

    const data = JSON.parse(payload) as unknown
    if (!data || typeof data !== "object" || Array.isArray(data)) return { error: "Invalid content." }

    const type = templateSectionType(template)
    const now = new Date().toISOString()
    const { data: existing } = await db().from("page_sections").select("id").eq("page_id", pageId).eq("type", type).maybeSingle()
    const { error } = existing
      ? await db().from("page_sections").update({ data, updated_at: now }).eq("id", existing.id)
      : await db().from("page_sections").insert({ page_id: pageId, type, position: 0, data })
    if (error) throw error

    await db().from("pages").update({ updated_by: actorId(admin), updated_at: now }).eq("id", pageId)
    await logActivity({ admin, action: "content.updated", entityType: "page", entityId: pageId, description: `Edited content of “${page.title}” (${templates[template].label})` })
    refreshWebsite()
    return { ok: true, message: "Content saved." }
  } catch (error) {
    return toActionError(error)
  }
}

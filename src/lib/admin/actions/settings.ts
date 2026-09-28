"use server"

import { z } from "zod"

import { logActivity } from "@/lib/admin/activity"
import { actorId, authorizeAction } from "@/lib/admin/auth"
import { cmsAdminDb } from "@/lib/cms/db"
import { portableTextToMarkdown } from "@/lib/cms/rich-text"
import type { ActionState, GeneralSettings, WebsiteSettings } from "@/lib/cms/types"
import { urlForImage } from "@/sanity/lib/image"
import {
  getSanityAboutPage,
  getSanityContactPage,
  getSanityHomePage,
  getSanityNavigation,
  getSanityServicesPage,
  getSanitySiteSettings,
} from "@/sanity/lib/queries"
import type { PageBuilderBlock, PageDocument, TestimonialData } from "@/sanity/types"

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
    const admin = await authorizeAction("system.import")
    refreshWebsite()
    await logActivity({ admin, action: "system.cache_cleared", entityType: "system", description: "Cleared the website content cache" })
    return { ok: true, message: "Website cache cleared — every page will re-read the CMS on its next visit." }
  } catch (error) {
    return toActionError(error)
  }
}

/** Sanity block → CMS section data (drops Sanity-only keys, converts rich text + images). */
function blockToSectionData(block: PageBuilderBlock): Record<string, unknown> {
  const { _type, _key, ...data } = block as PageBuilderBlock & Record<string, unknown>
  void _key
  if (_type === "richTextBlock") data.content = portableTextToMarkdown(data.content)
  if (_type === "testimonialsBlock" && Array.isArray(data.testimonials)) {
    data.testimonials = (data.testimonials as TestimonialData[]).map(({ avatar, ...t }) => ({
      ...t,
      avatarUrl: t.avatarUrl ?? urlForImage(avatar)?.width(192).height(192).url(),
    }))
  }
  return JSON.parse(JSON.stringify(data)) as Record<string, unknown>
}

const IMPORTS: { path: string; title: string; page_type: "home" | "static" | "service"; load: () => Promise<PageDocument | null> }[] = [
  { path: "/", title: "Home", page_type: "home", load: getSanityHomePage },
  { path: "/about-us", title: "About Us", page_type: "static", load: getSanityAboutPage },
  { path: "/contact-us", title: "Contact Us", page_type: "static", load: getSanityContactPage },
  { path: "/hosting", title: "Web Hosting", page_type: "service", load: () => getSanityServicesPage("hosting") },
  { path: "/domain", title: "Domains", page_type: "service", load: () => getSanityServicesPage("domain") },
  { path: "/email-hosting", title: "Email Hosting", page_type: "service", load: () => getSanityServicesPage("email-hosting") },
]

/**
 * One-click migration off Sanity: copies page-builder pages, their SEO, navigation and site
 * settings into the CMS. Never overwrites anything that already exists in the CMS, so it's
 * safe to re-run. Pages import as drafts unless `publish` is checked — the website keeps
 * serving the Sanity version until an imported page is published.
 */
export async function importFromSanityAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await authorizeAction("system.import")
    const publish = formData.get("publish") === "on"
    const report: string[] = []

    for (const item of IMPORTS) {
      const doc = await item.load()
      if (!doc?.pageBuilder?.length) continue
      const { data: existing } = await db().from("pages").select("id").eq("path", item.path).maybeSingle()
      if (existing) {
        report.push(`${item.path}: skipped (already in CMS)`)
        continue
      }
      const { data: page, error } = await db()
        .from("pages")
        .insert({
          title: item.title,
          path: item.path,
          page_type: item.page_type,
          status: publish ? "published" : "draft",
          published_at: publish ? new Date().toISOString() : null,
          created_by: actorId(admin),
          updated_by: actorId(admin),
        })
        .select("id")
        .single()
      if (error) throw error

      const { error: sectionsError } = await db()
        .from("page_sections")
        .insert(doc.pageBuilder.map((block, position) => ({ page_id: page.id, type: block._type, position, data: blockToSectionData(block) })))
      if (sectionsError) throw sectionsError

      if (doc.seo?.metaTitle || doc.seo?.metaDescription) {
        await db()
          .from("seo")
          .upsert(
            { path: item.path, page_id: page.id, meta_title: doc.seo.metaTitle ?? null, meta_description: doc.seo.metaDescription ?? null },
            { onConflict: "path", ignoreDuplicates: true }
          )
      }
      report.push(`${item.path}: imported ${doc.pageBuilder.length} sections`)
    }

    const navigation = await getSanityNavigation()
    const { data: menus } = await db().from("menus").select("location, items")
    const menuItems = Object.fromEntries((menus ?? []).map((m) => [m.location, m.items]))
    for (const [location, items] of [
      ["header", navigation?.mainMenu],
      ["footer", navigation?.footerColumns],
    ] as const) {
      const current = menuItems[location]
      if (items?.length && !(Array.isArray(current) && current.length)) {
        await db().from("menus").upsert({ location, items: JSON.parse(JSON.stringify(items)), updated_by: actorId(admin) }, { onConflict: "location" })
        report.push(`${location} menu: imported ${items.length} items`)
      }
    }

    const sanitySettings = await getSanitySiteSettings()
    if (sanitySettings) {
      const { data: rows } = await db().from("settings").select("key, value")
      const current = Object.fromEntries((rows ?? []).map((r) => [r.key, (r.value ?? {}) as Record<string, unknown>]))
      const general: GeneralSettings = {
        siteName: sanitySettings.siteName,
        tagline: sanitySettings.tagline,
        description: sanitySettings.description,
        contactPhone: sanitySettings.contactPhone,
        contactPhoneHref: sanitySettings.contactPhoneHref,
        contactEmail: sanitySettings.contactEmail,
        contactAddress: sanitySettings.contactAddress,
        salesHours: sanitySettings.salesHours,
        accountingHours: sanitySettings.accountingHours,
        supportHours: sanitySettings.supportHours,
      }
      const website: WebsiteSettings = {
        headerCta: sanitySettings.headerCta,
        globalCta: sanitySettings.globalCta,
        socialLinks: sanitySettings.socialLinks,
        defaultMetaTitle: sanitySettings.seoDefaults?.metaTitle,
        defaultMetaDescription: sanitySettings.seoDefaults?.metaDescription,
      }
      // Existing CMS values win; Sanity only fills the gaps.
      const mergedGeneral = JSON.parse(JSON.stringify({ ...general, ...current.general }))
      const mergedWebsite = JSON.parse(JSON.stringify({ ...website, ...current.website }))
      await db().from("settings").upsert(
        [
          { key: "general", value: mergedGeneral, updated_by: actorId(admin) },
          { key: "website", value: mergedWebsite, updated_by: actorId(admin) },
        ],
        { onConflict: "key" }
      )
      report.push("site settings: merged")
    }

    await logActivity({ admin, action: "system.import", entityType: "system", description: "Imported content from Sanity", metadata: { report, publish } })
    refreshWebsite()
    return { ok: true, message: report.length ? report.join(" · ") : "Nothing to import — Sanity has no page-builder content." }
  } catch (error) {
    return toActionError(error)
  }
}

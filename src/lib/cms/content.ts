import "server-only"

import { draftMode } from "next/headers"
import { cache } from "react"

import type { BlogPost } from "@/constants/blog-data"
import type { NavColumnData, NavItemData, PageBuilderBlock, PageDocument, PricingPlanData } from "@/types/cms-content"

import { cmsAdminDb, cmsPublicDb } from "./db"
import { PRICING_COLLECTION_KEY, TEMPLATE_SECTION_PREFIX, templateForPath, templateSectionType, type TemplateKey } from "./templates"
import type { GeneralSettings, PageRow, PageSectionRow, SeoRow, WebsiteSettings } from "./types"

/**
 * Website-facing CMS reads. Every function returns null/[] when Supabase isn't configured,
 * the migration hasn't been run, or nothing is published — callers then fall back to
 * the built-in defaults (src/constants and the routes), so the site never breaks because of the CMS.
 *
 * Preview: when an admin turns on draft mode (/admin/preview), page reads skip the cache
 * and return the latest version of each page — draft or published — so migrated content
 * can be checked on the real templates before anything goes live.
 */

type CmsPage = PageRow & { sections: PageSectionRow[] }

export async function isCmsPreview(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled
  } catch {
    // Outside a request (generateStaticParams, sitemap at build time).
    return false
  }
}

async function pageClient() {
  const preview = await isCmsPreview()
  return { preview, db: preview ? cmsAdminDb : cmsPublicDb }
}

function cleanCta(value: unknown) {
  if (!value || typeof value !== "object") return undefined
  const cta = value as { label?: string; href?: string; external?: boolean }
  if (!cta.label?.trim() || !cta.href?.trim()) return undefined
  return { label: cta.label, href: cta.href, external: Boolean(cta.external) }
}

const CTA_FIELDS = ["primaryCta", "secondaryCta", "cta"]
const ARRAY_FIELDS = ["bullets", "stats", "plans", "highlights", "services", "items", "testimonials", "faqs", "breadcrumbs"]

export function isTemplateSection(section: Pick<PageSectionRow, "type">) {
  return section.type.startsWith(TEMPLATE_SECTION_PREFIX)
}

/** Normalizes stored section JSON into the exact block shape PageBuilder renders. */
export function toPageBuilderBlock(section: Pick<PageSectionRow, "id" | "type" | "data">): PageBuilderBlock {
  const data: Record<string, unknown> = { ...section.data }

  for (const field of CTA_FIELDS) if (field in data) data[field] = cleanCta(data[field])
  for (const field of ARRAY_FIELDS) if (field in data && !Array.isArray(data[field])) data[field] = []

  if (section.type === "richTextBlock") {
    data.content = typeof data.content === "string" ? data.content : ""
  }
  if (section.type === "featureGridBlock" && data.columns) data.columns = Number(data.columns)
  if (section.type === "pricingBlock" && Array.isArray(data.plans)) {
    data.plans = (data.plans as Record<string, unknown>[]).map((plan) => ({ ...plan, cta: cleanCta(plan.cta) }))
  }
  if (section.type === "statsBlock" || section.type === "heroBlock") data.stats = data.stats ?? []

  return { ...data, _type: section.type, _key: section.id } as unknown as PageBuilderBlock
}

/** The page at `path` visible to this request: published, or the latest draft in preview. */
export const getPublishedCmsPage = cache(async (path: string): Promise<CmsPage | null> => {
  const { preview, db } = await pageClient()
  if (!db) return null
  let query = db.from("pages").select("*, sections:page_sections(*)").eq("path", path)
  if (!preview) query = query.eq("status", "published")
  const { data, error } = await query.maybeSingle()
  if (error || !data) return null

  const page = data as CmsPage
  page.sections = (page.sections ?? []).filter((s) => s.is_visible).sort((a, b) => a.position - b.position)
  return page
})

/** CMS page-builder page as a `PageDocument`, or null if it has no builder sections. */
export async function getCmsPageDocument(path: string): Promise<PageDocument | null> {
  const page = await getPublishedCmsPage(path)
  const blocks = page?.sections.filter((section) => !isTemplateSection(section)) ?? []
  if (!page || !blocks.length) return null
  return {
    // Titles/descriptions stay the route defaults here; admin SEO is layered on by applySeoOverrides.
    seo: { metaTitle: undefined, metaDescription: page.excerpt || undefined },
    pageBuilder: blocks.map(toPageBuilderBlock),
  }
}

/** Content of a structured template page at `path`, if one is visible. */
export async function getCmsTemplate<T>(key: TemplateKey, path: string): Promise<T | null> {
  const page = await getPublishedCmsPage(path)
  const section = page?.sections.find((s) => s.type === templateSectionType(key))
  return (section?.data as T | undefined) ?? null
}

/** Every visible template page of `key` (published; plus drafts in preview), with its data. */
export const getCmsTemplatePages = cache(async (key: TemplateKey): Promise<{ path: string; updated_at: string; created_at: string; data: Record<string, unknown> }[]> => {
  const { preview, db } = await pageClient()
  if (!db) return []
  let query = db
    .from("page_sections")
    .select("data, is_visible, page:pages!inner(path, status, updated_at, created_at)")
    .eq("type", templateSectionType(key))
  if (!preview) query = query.eq("page.status", "published")
  const { data, error } = await query
  if (error || !data) return []
  return (data as unknown as { data: Record<string, unknown>; is_visible: boolean; page: { path: string; updated_at: string; created_at: string } }[])
    .filter((row) => row.is_visible && templateForPath(row.page.path) === key)
    .sort((a, b) => a.page.created_at.localeCompare(b.page.created_at))
    .map((row) => ({ path: row.page.path, updated_at: row.page.updated_at, created_at: row.page.created_at, data: row.data }))
})

/**
 * Per-URL SEO from the admin. SEO that belongs to a CMS page (page_id set) goes live together
 * with that page — it is ignored while the page is a draft, except in preview — so importing
 * or editing a draft can never change the live site's metadata.
 */
export const getSeoOverride = cache(async (path: string): Promise<SeoRow | null> => {
  const { preview, db } = await pageClient()
  if (!db) return null
  const { data, error } = await db.from("seo").select("*, page:pages(status)").eq("path", path).maybeSingle()
  if (error || !data) return null
  const { page, ...seo } = data as SeoRow & { page: { status: string } | null }
  if (seo.page_id && page?.status !== "published" && !preview) return null
  return seo
})

const getSettingsRows = cache(async () => {
  if (!cmsPublicDb) return {} as Record<string, Record<string, unknown>>
  // Custom Code version history and preview drafts are dashboard-only (and can be large).
  const { data, error } = await cmsPublicDb.from("settings").select("key, value").not("key", "like", "custom_code_%")
  if (error || !data) return {}
  return Object.fromEntries(data.map((row) => [row.key as string, (row.value ?? {}) as Record<string, unknown>]))
})

export async function getCmsGeneralSettings(): Promise<GeneralSettings> {
  return ((await getSettingsRows()).general ?? {}) as GeneralSettings
}

export async function getCmsWebsiteSettings(): Promise<WebsiteSettings> {
  return ((await getSettingsRows()).website ?? {}) as WebsiteSettings
}

/** Live Custom Code Manager sections (`settings.custom_code`), from the same cached settings read. */
export async function getCmsCustomCodeValue(): Promise<unknown> {
  return (await getSettingsRows()).custom_code ?? null
}

/** Raw Hosting Assistant settings (`settings.chatbot`), from the same cached settings read. */
export async function getCmsAssistantSettingsValue(): Promise<unknown> {
  return (await getSettingsRows()).chatbot ?? null
}

export type PricingCollection = { published?: boolean; plans?: PricingPlanData[] }

/** Shared pricing plans from Content → Pricing Plans, once published (or in preview). */
export const getCmsPricingPlans = cache(async (): Promise<PricingPlanData[] | null> => {
  const { preview, db } = await pageClient()
  if (!db) return null
  const { data, error } = await db.from("settings").select("value").eq("key", PRICING_COLLECTION_KEY).maybeSingle()
  if (error || !data) return null
  const collection = data.value as PricingCollection
  if (!collection?.plans?.length || (!collection.published && !preview)) return null
  return collection.plans
})

const getMenus = cache(async () => {
  if (!cmsPublicDb) return {} as Record<string, unknown>
  const { data, error } = await cmsPublicDb.from("menus").select("location, items")
  if (error || !data) return {}
  return Object.fromEntries(data.map((row) => [row.location, row.items]))
})

export async function getCmsHeaderMenu(): Promise<NavItemData[] | null> {
  const items = (await getMenus()).header
  return Array.isArray(items) && items.length ? (items as NavItemData[]) : null
}

export async function getCmsFooterMenu(): Promise<NavColumnData[] | null> {
  const items = (await getMenus()).footer
  return Array.isArray(items) && items.length ? (items as NavColumnData[]) : null
}

export const getPublishedCmsPaths = cache(async (): Promise<{ path: string; updated_at: string; page_type: string }[]> => {
  if (!cmsPublicDb) return []
  const { data, error } = await cmsPublicDb.from("pages").select("path, updated_at, page_type").eq("status", "published")
  if (error || !data) return []
  return data
})

/** Route paths an editor marked "noindex" under SEO — kept out of the sitemap. */
export const getNoIndexSeoPaths = cache(async (): Promise<string[]> => {
  if (!cmsPublicDb) return []
  const { data, error } = await cmsPublicDb.from("seo").select("path").eq("no_index", true)
  if (error || !data) return []
  return data.map((row) => row.path as string)
})

type BlogPostTemplate = Omit<BlogPost, "slug">

/** CMS blog posts in the same shape as the built-in posts, so they render with the same template. */
export async function getCmsBlogPosts(): Promise<BlogPost[]> {
  const pages = await getCmsTemplatePages("blogPost")
  return pages.map(({ path, data }) => {
    const post = data as Partial<BlogPostTemplate>
    return {
      slug: path.replace(/^\/blog\//, ""),
      title: post.title ?? "",
      excerpt: post.excerpt ?? "",
      categorySlug: post.categorySlug || "uncategorized",
      readTime: post.readTime || "5 min read",
      publishedLabel: post.publishedLabel ?? "",
      featured: post.featured,
      author: { name: post.author?.name || "MagicWorks Host Team", role: post.author?.role ?? "" },
      sections: (post.sections ?? []).map((section) => ({ heading: section.heading, body: (section.body ?? []).filter(Boolean) })),
    }
  })
}

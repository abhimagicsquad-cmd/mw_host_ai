import "server-only"

import { cache } from "react"

import type { BlogPostData, NavColumnData, NavItemData, PageBuilderBlock, PageDocument } from "@/sanity/types"

import { cmsPublicDb } from "./db"
import { markdownToPortableText } from "./rich-text"
import type { GeneralSettings, PageRow, PageSectionRow, SeoRow, WebsiteSettings } from "./types"

/**
 * Website-facing CMS reads. Every function returns null/[] when Supabase isn't configured,
 * the migration hasn't been run, or nothing is published — callers then fall back to
 * Sanity and finally to the hardcoded defaults, so the site never breaks because of the CMS.
 */

type CmsPage = PageRow & { sections: PageSectionRow[] }

function cleanCta(value: unknown) {
  if (!value || typeof value !== "object") return undefined
  const cta = value as { label?: string; href?: string; external?: boolean }
  if (!cta.label?.trim() || !cta.href?.trim()) return undefined
  return { label: cta.label, href: cta.href, external: Boolean(cta.external) }
}

const CTA_FIELDS = ["primaryCta", "secondaryCta", "cta"]
const ARRAY_FIELDS = ["bullets", "stats", "plans", "highlights", "services", "items", "testimonials", "faqs", "breadcrumbs"]

/** Normalizes stored section JSON into the exact block shape PageBuilder renders. */
export function toPageBuilderBlock(section: Pick<PageSectionRow, "id" | "type" | "data">): PageBuilderBlock {
  const data: Record<string, unknown> = { ...section.data }

  for (const field of CTA_FIELDS) if (field in data) data[field] = cleanCta(data[field])
  for (const field of ARRAY_FIELDS) if (field in data && !Array.isArray(data[field])) data[field] = []

  if (section.type === "richTextBlock") {
    data.content = typeof data.content === "string" ? markdownToPortableText(data.content) : (data.content ?? [])
  }
  if (section.type === "featureGridBlock" && data.columns) data.columns = Number(data.columns)
  if (section.type === "pricingBlock" && Array.isArray(data.plans)) {
    data.plans = (data.plans as Record<string, unknown>[]).map((plan) => ({ ...plan, cta: cleanCta(plan.cta) }))
  }
  if (section.type === "statsBlock" || section.type === "heroBlock") data.stats = data.stats ?? []

  return { ...data, _type: section.type, _key: section.id } as unknown as PageBuilderBlock
}

export const getPublishedCmsPage = cache(async (path: string): Promise<CmsPage | null> => {
  if (!cmsPublicDb) return null
  const { data, error } = await cmsPublicDb
    .from("pages")
    .select("*, sections:page_sections(*)")
    .eq("path", path)
    .eq("status", "published")
    .maybeSingle()
  if (error || !data) return null

  const page = data as CmsPage
  page.sections = (page.sections ?? []).filter((s) => s.is_visible).sort((a, b) => a.position - b.position)
  return page
})

/** CMS page in the Sanity `PageDocument` shape, or null if it has no visible sections. */
export async function getCmsPageDocument(path: string): Promise<PageDocument | null> {
  const page = await getPublishedCmsPage(path)
  if (!page?.sections.length) return null
  const seo = await getSeoOverride(path)
  return {
    // No page-title fallback: coded routes keep their own default titles unless SEO is set.
    seo: { metaTitle: seo?.meta_title || undefined, metaDescription: seo?.meta_description || page.excerpt || undefined },
    pageBuilder: page.sections.map(toPageBuilderBlock),
  }
}

export const getSeoOverride = cache(async (path: string): Promise<SeoRow | null> => {
  if (!cmsPublicDb) return null
  const { data, error } = await cmsPublicDb.from("seo").select("*").eq("path", path).maybeSingle()
  if (error) return null
  return (data as SeoRow | null) ?? null
})

const getSettingsRows = cache(async () => {
  if (!cmsPublicDb) return {} as Record<string, Record<string, unknown>>
  const { data, error } = await cmsPublicDb.from("settings").select("key, value")
  if (error || !data) return {}
  return Object.fromEntries(data.map((row) => [row.key as string, (row.value ?? {}) as Record<string, unknown>]))
})

export async function getCmsGeneralSettings(): Promise<GeneralSettings> {
  return ((await getSettingsRows()).general ?? {}) as GeneralSettings
}

export async function getCmsWebsiteSettings(): Promise<WebsiteSettings> {
  return ((await getSettingsRows()).website ?? {}) as WebsiteSettings
}

const getMenus = cache(async () => {
  if (!cmsPublicDb) return {} as Record<string, unknown>
  const { data, error } = await cmsPublicDb.from("menus").select("location, items")
  if (error || !data) return {}
  return Object.fromEntries(data.map((row) => [row.location as string, row.items]))
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

/** Published CMS blog posts (page_type "blog", path "/blog/<slug>") in the Sanity blog shape. */
export const getCmsBlogPosts = cache(async (): Promise<BlogPostData[]> => {
  if (!cmsPublicDb) return []
  const { data, error } = await cmsPublicDb
    .from("pages")
    .select("*, sections:page_sections(*)")
    .eq("page_type", "blog")
    .eq("status", "published")
    .like("path", "/blog/%")
    .order("published_at", { ascending: false })
  if (error || !data) return []

  return (data as CmsPage[]).map((page) => {
    const markdown = (page.sections ?? [])
      .filter((s) => s.is_visible && s.type === "richTextBlock")
      .sort((a, b) => a.position - b.position)
      .map((s) => [s.data.title ? `## ${s.data.title}` : "", String(s.data.content ?? "")].filter(Boolean).join("\n\n"))
      .join("\n\n")
    const words = markdown.split(/\s+/).filter(Boolean).length

    return {
      title: page.title,
      slug: page.path.replace(/^\/blog\//, ""),
      excerpt: page.excerpt ?? "",
      publishedAt: page.published_at ?? page.updated_at,
      readTime: `${Math.max(1, Math.round(words / 200))} min read`,
      author: { name: "MagicWorks Host Team" },
      body: markdownToPortableText(markdown),
    }
  })
})

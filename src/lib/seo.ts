import type { Metadata } from "next"

import { siteConfig } from "@/constants/site-config"
import { getSeoOverride } from "@/lib/cms/content"

type BuildMetadataOptions = {
  /** Short page title, e.g. "About Us" — the root layout's title template appends " | MagicWorks Host". */
  title: string
  description: string
  /** Site-relative path, e.g. "/hosting/vps-hosting". Defaults to "/". */
  path?: string
  /** Set true on pages that shouldn't be indexed (thank-you pages, etc.). */
  noIndex?: boolean
  /** "article" for blog posts; every other page type stays the default "website". */
  ogType?: "website" | "article"
  /** ISO 8601 timestamps — only meaningful when ogType is "article". */
  publishedTime?: string
  modifiedTime?: string
}

/**
 * Single source of truth for per-page metadata — title, description, canonical,
 * Open Graph, and Twitter Card, all derived from the same inputs so pages can't
 * drift out of sync with each other. `title` is short; the root layout's title
 * template handles appending the site name to the actual <title> tag, while
 * Open Graph/Twitter (which don't get that template) get the full composed title.
 */
export function buildMetadata({
  title,
  description,
  path = "/",
  noIndex = false,
  ogType = "website",
  publishedTime,
  modifiedTime,
}: BuildMetadataOptions): Metadata {
  const url = path === "/" ? siteConfig.url : `${siteConfig.url}${path}`
  const fullTitle = `${title} | ${siteConfig.name}`

  const openGraph: Metadata["openGraph"] =
    ogType === "article"
      ? {
          title: fullTitle,
          description,
          url,
          siteName: siteConfig.name,
          type: "article",
          locale: "en_IN",
          publishedTime,
          modifiedTime,
        }
      : {
          title: fullTitle,
          description,
          url,
          siteName: siteConfig.name,
          type: "website",
          locale: "en_IN",
        }

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  }
}

/**
 * Layers the per-path SEO saved in the admin (/admin/seo) over a page's computed metadata.
 * The path is read from `alternates.canonical`, which `buildMetadata` always sets, so any
 * page can opt in by wrapping its metadata. Empty admin fields leave the page's own values.
 */
export async function applySeoOverrides(metadata: Metadata): Promise<Metadata> {
  const canonical = metadata.alternates?.canonical
  const path = typeof canonical === "string" ? canonical : "/"
  const seo = await getSeoOverride(path)
  if (!seo) return metadata

  const title = seo.meta_title?.trim()
  const description = seo.meta_description?.trim()
  const ogTitle = seo.og_title?.trim() || title
  const ogDescription = seo.og_description?.trim() || description
  const ogImage = seo.og_image?.trim()
  const twitterImage = seo.twitter_image?.trim() || ogImage

  return {
    ...metadata,
    ...(title ? { title: { absolute: title } } : {}),
    ...(description ? { description } : {}),
    alternates: { ...metadata.alternates, canonical: seo.canonical_url?.trim() || path },
    openGraph: {
      ...metadata.openGraph,
      ...(ogTitle ? { title: ogTitle } : {}),
      ...(ogDescription ? { description: ogDescription } : {}),
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      ...metadata.twitter,
      ...(seo.twitter_card ? { card: seo.twitter_card } : {}),
      ...(seo.twitter_title?.trim() || ogTitle ? { title: seo.twitter_title?.trim() || ogTitle } : {}),
      ...(seo.twitter_description?.trim() || ogDescription ? { description: seo.twitter_description?.trim() || ogDescription } : {}),
      ...(twitterImage ? { images: [twitterImage] } : {}),
    },
    ...(seo.no_index ? { robots: { index: false, follow: false } } : {}),
  }
}

/** `buildMetadata` + admin SEO overrides. Use from `generateMetadata`. */
export async function buildPageMetadata(options: BuildMetadataOptions): Promise<Metadata> {
  return applySeoOverrides(buildMetadata(options))
}

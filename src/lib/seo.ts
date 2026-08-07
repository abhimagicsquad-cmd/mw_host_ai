import type { Metadata } from "next"

import { siteConfig } from "@/constants/site-config"

type BuildMetadataOptions = {
  /** Short page title, e.g. "About Us" — the root layout's title template appends " | MagicWorks Host". */
  title: string
  description: string
  /** Site-relative path, e.g. "/hosting/vps-hosting". Defaults to "/". */
  path?: string
  /** Set true on pages that shouldn't be indexed (thank-you pages, etc.). */
  noIndex?: boolean
}

/**
 * Single source of truth for per-page metadata — title, description, canonical,
 * Open Graph, and Twitter Card, all derived from the same inputs so pages can't
 * drift out of sync with each other. `title` is short; the root layout's title
 * template handles appending the site name to the actual <title> tag, while
 * Open Graph/Twitter (which don't get that template) get the full composed title.
 */
export function buildMetadata({ title, description, path = "/", noIndex = false }: BuildMetadataOptions): Metadata {
  const url = path === "/" ? siteConfig.url : `${siteConfig.url}${path}`
  const fullTitle = `${title} | ${siteConfig.name}`

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      type: "website",
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  }
}

import type { MetadataRoute } from "next"
import { publicPath } from "@/lib/public-paths"

import { blogCategories, blogPosts, inWordpressCategory, wordpressCategories } from "@/constants/blog-data"
import { dedicatedPages } from "@/constants/dedicated-pages-data"
import { domainPages } from "@/constants/domain-pages-data"
import { emailPages } from "@/constants/email-pages-data"
import { hostingPages } from "@/constants/hosting-pages-data"
import { kbCategories } from "@/constants/knowledge-base-data"
import { legalSlugs } from "@/constants/legal-content"
import { siteConfig } from "@/constants/site-config"
import { sslPages } from "@/constants/ssl-pages-data"
import { getNoIndexSeoPaths, getPublishedCmsPaths } from "@/lib/cms/content"

/** Built-in routes rendered with noindex (search results, form confirmations) — never listed. */
const NOINDEX_ROUTES = ["/search", "/thank-you"]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const url = (path: string) => `${siteConfig.url}${publicPath(path)}`

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/about-us"), changeFrequency: "monthly", priority: 0.6 },
    { url: url("/contact-us"), changeFrequency: "monthly", priority: 0.6 },
    { url: url("/support"), changeFrequency: "monthly", priority: 0.5 },
    { url: url("/knowledge-base"), changeFrequency: "weekly", priority: 0.6 },
    { url: url("/blog"), changeFrequency: "weekly", priority: 0.6 },
    { url: url("/hosting"), changeFrequency: "monthly", priority: 0.8 },
    { url: url("/domain"), changeFrequency: "monthly", priority: 0.7 },
    { url: url("/domain/search"), changeFrequency: "monthly", priority: 0.6 },
    { url: url("/email-hosting"), changeFrequency: "monthly", priority: 0.6 },
    { url: url("/vps-hosting"), changeFrequency: "monthly", priority: 0.8 },
    { url: url("/ssl"), changeFrequency: "monthly", priority: 0.7 },
    { url: url("/compare-hosting-plans"), changeFrequency: "monthly", priority: 0.7 },
    { url: url("/become-our-affiliate"), changeFrequency: "monthly", priority: 0.4 },
    { url: url("/sitemap-page"), changeFrequency: "yearly", priority: 0.2 },
    // Free tools (the WordPress calculator URLs).
    { url: url("/tools/bandwidth-calculator"), changeFrequency: "yearly", priority: 0.4 },
    { url: url("/tools/data-unit-calculator"), changeFrequency: "yearly", priority: 0.4 },
    { url: url("/tools/transfer-time-calculator"), changeFrequency: "yearly", priority: 0.4 },
  ]

  const hostingRoutes = hostingPages.map((page) => ({
    url: url(`/hosting/${page.slug}`),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  const domainRoutes = domainPages.map((page) => ({
    url: url(`/domain/${page.slug}`),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  const dedicatedRoutes = dedicatedPages.map((page) => ({
    url: url(`/dedicated-hosting/${page.slug}`),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  const emailRoutes = emailPages.map((page) => ({
    url: url(`/email-hosting/${page.slug}`),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  const legalRoutes = legalSlugs.map((slug) => ({
    url: url(`/legal/${slug}`),
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }))

  const blogRoutes = blogPosts.map((post) => ({
    url: url(`/blog/${post.slug}`),
    changeFrequency: "yearly" as const,
    priority: 0.5,
    lastModified: post.modifiedAt ? new Date(post.modifiedAt) : post.publishedAt ? new Date(post.publishedAt) : now,
  }))

  // Blog topics plus the WordPress category archives (same /category/<slug>/ URLs as before).
  const categorySlugs = new Set([
    ...blogCategories.filter((category) => blogPosts.some((post) => post.categorySlug === category.slug)).map((category) => category.slug),
    ...wordpressCategories.filter((category) => blogPosts.some((post) => inWordpressCategory(post, category.slug))).map((category) => category.slug),
  ])
  const blogCategoryRoutes = [...categorySlugs].map((slug) => ({ url: url(`/blog/category/${slug}`), changeFrequency: "weekly" as const, priority: 0.4 }))

  const sslRoutes = sslPages.map((page) => ({ url: url(`/ssl/${page.slug}`), changeFrequency: "monthly" as const, priority: 0.6 }))

  const kbCategoryRoutes = kbCategories.map((category) => ({
    url: url(`/knowledge-base/category/${category.slug}`),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }))

  const builtIn = [
    ...staticRoutes,
    ...hostingRoutes,
    ...domainRoutes,
    ...dedicatedRoutes,
    ...emailRoutes,
    ...legalRoutes,
    ...blogRoutes,
    ...blogCategoryRoutes,
    ...sslRoutes,
    ...kbCategoryRoutes,
  ]

  // Pages created in the admin CMS (built-in URLs they override are already listed above).
  // noindex pages (built-in ones like /thank-you, and any an editor marked noindex under SEO)
  // are left out: a sitemap should only list URLs meant to be indexed.
  const noIndex = new Set([...NOINDEX_ROUTES, ...(await getNoIndexSeoPaths())].map((path) => url(path)))
  const known = new Set(builtIn.map((entry) => entry.url))
  const cmsRoutes = (await getPublishedCmsPaths())
    .map((page) => ({
      url: page.path === "/" ? url("/") : url(page.path),
      changeFrequency: "monthly" as const,
      priority: page.page_type === "blog" ? 0.5 : 0.6,
      lastModified: new Date(page.updated_at),
    }))
    .filter((entry) => !known.has(entry.url))

  return [...builtIn, ...cmsRoutes].filter((entry) => !noIndex.has(entry.url))
}

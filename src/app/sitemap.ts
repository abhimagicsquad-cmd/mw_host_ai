import type { MetadataRoute } from "next"

import { blogCategories, blogPosts } from "@/constants/blog-data"
import { dedicatedPages } from "@/constants/dedicated-pages-data"
import { domainPages } from "@/constants/domain-pages-data"
import { emailPages } from "@/constants/email-pages-data"
import { hostingPages } from "@/constants/hosting-pages-data"
import { kbCategories } from "@/constants/knowledge-base-data"
import { legalSlugs } from "@/constants/legal-content"
import { siteConfig } from "@/constants/site-config"
import { sslPages } from "@/constants/ssl-pages-data"
import { getPublishedCmsPaths } from "@/lib/cms/content"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const url = (path: string) => `${siteConfig.url}${path}`

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

  const blogCategoryRoutes = blogCategories
    .filter((category) => blogPosts.some((post) => post.categorySlug === category.slug))
    .map((category) => ({ url: url(`/blog/category/${category.slug}`), changeFrequency: "weekly" as const, priority: 0.4 }))

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
  const known = new Set(builtIn.map((entry) => entry.url))
  const cmsRoutes = (await getPublishedCmsPaths())
    .map((page) => ({
      url: page.path === "/" ? url("/") : url(page.path),
      changeFrequency: "monthly" as const,
      priority: page.page_type === "blog" ? 0.5 : 0.6,
      lastModified: new Date(page.updated_at),
    }))
    .filter((entry) => !known.has(entry.url))

  return [...builtIn, ...cmsRoutes]
}

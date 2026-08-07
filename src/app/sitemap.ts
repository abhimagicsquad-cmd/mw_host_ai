import type { MetadataRoute } from "next"

import { blogPosts } from "@/constants/blog-data"
import { dedicatedPages } from "@/constants/dedicated-pages-data"
import { domainPages } from "@/constants/domain-pages-data"
import { emailPages } from "@/constants/email-pages-data"
import { hostingPages } from "@/constants/hosting-pages-data"
import { kbCategories } from "@/constants/knowledge-base-data"
import { legalSlugs } from "@/constants/legal-content"
import { siteConfig } from "@/constants/site-config"

export default function sitemap(): MetadataRoute.Sitemap {
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
    lastModified: now,
  }))

  const kbCategoryRoutes = kbCategories.map((category) => ({
    url: url(`/knowledge-base/category/${category.slug}`),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }))

  return [
    ...staticRoutes,
    ...hostingRoutes,
    ...domainRoutes,
    ...dedicatedRoutes,
    ...emailRoutes,
    ...legalRoutes,
    ...blogRoutes,
    ...kbCategoryRoutes,
  ]
}

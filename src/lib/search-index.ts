import { blogPosts } from "@/constants/blog-data"
import { dedicatedPages } from "@/constants/dedicated-pages-data"
import { domainPages } from "@/constants/domain-pages-data"
import { emailPages } from "@/constants/email-pages-data"
import { hostingPages } from "@/constants/hosting-pages-data"
import { kbArticles } from "@/constants/knowledge-base-data"

export type SearchResult = {
  title: string
  description: string
  href: string
  group: string
}

/**
 * A single static index built from the same content constants every page already renders
 * from — no separate content source to keep in sync. Backs both the /search page and the
 * WebSite SearchAction structured data declared in <OrganizationJsonLd />.
 */
function buildSearchIndex(): SearchResult[] {
  return [
    ...hostingPages.map((page) => ({ title: page.title, description: page.description, href: `/hosting/${page.slug}`, group: "Hosting" })),
    {
      title: "VPS Hosting",
      description: "Dedicated resources, without dedicated-server pricing — full root access on NVMe-backed virtual servers.",
      href: "/vps-hosting",
      group: "Hosting",
    },
    ...dedicatedPages.map((page) => ({ title: page.title, description: page.description, href: `/dedicated-hosting/${page.slug}`, group: "Dedicated Servers" })),
    ...domainPages.map((page) => ({ title: page.title, description: page.description, href: `/domain/${page.slug}`, group: "Domains" })),
    ...emailPages.map((page) => ({ title: page.title, description: page.description, href: `/email-hosting/${page.slug}`, group: "Email Hosting" })),
    {
      title: "SSL Certificates",
      description: "Domain Validated, Business Validated, Wildcard, and Extended Validated SSL certificates.",
      href: "/ssl",
      group: "SSL",
    },
    ...blogPosts.map((post) => ({ title: post.title, description: post.excerpt, href: `/blog/${post.slug}`, group: "Blog" })),
    ...kbArticles.map((article) => ({ title: article.title, description: article.excerpt, href: `/knowledge-base/category/${article.categorySlug}`, group: "Knowledge Base" })),
  ]
}

export const searchIndex = buildSearchIndex()

export function searchSite(query: string): SearchResult[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  return searchIndex.filter(
    (result) => result.title.toLowerCase().includes(normalized) || result.description.toLowerCase().includes(normalized)
  )
}

import { blogPosts } from "@/constants/blog-data"
import { dedicatedPages } from "@/constants/dedicated-pages-data"
import { domainPages } from "@/constants/domain-pages-data"
import { emailPages } from "@/constants/email-pages-data"
import { hostingPages } from "@/constants/hosting-pages-data"
import { kbArticles } from "@/constants/knowledge-base-data"
import { legalDocuments } from "@/constants/legal-content"
import { serviceAnswers } from "@/constants/service-answers"
import { sslPages } from "@/constants/ssl-pages-data"

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
/** `keywords` holds extra match-only text (the page's core question) that isn't displayed. */
function buildSearchIndex(): (SearchResult & { keywords: string })[] {
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
    ...sslPages.map((page) => ({ title: page.title, description: page.description, href: `/ssl/${page.slug}`, group: "SSL" })),
    { title: "Domain name search", description: "Check if a domain name is available and register it.", href: "/domain/search", group: "Domains" },
    { title: "Compare hosting plans", description: "Side-by-side comparison of every shared hosting plan's storage, bandwidth and features.", href: "/compare-hosting-plans", group: "Hosting" },
    { title: "Support", description: "24/7 phone, ticket and live help from the MagicWorks Host support team.", href: "/support", group: "Help" },
    { title: "Contact us", description: "Call, email or visit MagicWorks Host in Pune.", href: "/contact-us", group: "Help" },
    { title: "Affiliate programme", description: "Earn commission by referring customers to MagicWorks Host.", href: "/become-our-affiliate", group: "Company" },
    ...blogPosts.map((post) => ({ title: post.title, description: post.excerpt, href: `/blog/${post.slug}`, group: "Blog" })),
    ...kbArticles.map((article) => ({ title: article.title, description: article.excerpt, href: `/knowledge-base/category/${article.categorySlug}`, group: "Knowledge Base" })),
    ...Object.values(legalDocuments).map((doc) => ({ title: doc.title, description: `${doc.title} for MagicWorks Host services.`, href: `/legal/${doc.slug}`, group: "Policies" })),
  ].map((result) => ({ ...result, keywords: serviceAnswers[result.href]?.question ?? "" }))
}

export const searchIndex = buildSearchIndex()

const STOP_WORDS = new Set(["a", "an", "the", "and", "or", "for", "to", "of", "in", "on", "my", "i", "is", "how", "what", "do", "with"])

function tokenize(text: string) {
  return text.toLowerCase().split(/[^a-z0-9.]+/).filter((token) => token.length > 1 && !STOP_WORDS.has(token))
}

/**
 * Ranked keyword search: every query word must appear (as a word prefix) in the title,
 * description or the page's core question; title hits and exact-phrase hits rank first.
 */
export function searchSite(query: string): SearchResult[] {
  const phrase = query.trim().toLowerCase()
  const tokens = tokenize(phrase)
  if (tokens.length === 0) return []

  return searchIndex
    .map((result) => {
      const title = tokenize(result.title)
      const body = tokenize(`${result.description} ${result.keywords}`)
      let score = 0
      for (const token of tokens) {
        if (title.some((word) => word.startsWith(token))) score += 3
        else if (body.some((word) => word.startsWith(token))) score += 1
        else return null
      }
      if (result.title.toLowerCase().includes(phrase)) score += 5
      return { result, score }
    })
    .filter((match): match is { result: (typeof searchIndex)[number]; score: number } => match !== null)
    .sort((a, b) => b.score - a.score)
    .map(({ result }): SearchResult => ({ title: result.title, description: result.description, href: result.href, group: result.group }))
}

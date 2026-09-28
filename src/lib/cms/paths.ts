import type { PageType } from "./types"

/** Built-in routes whose content comes from the page builder when a published CMS page exists. */
export const CMS_INTEGRATED_PATHS: Record<string, string> = {
  "/": "Home page",
  "/about-us": "About Us",
  "/contact-us": "Contact Us (sections appear above the contact forms, which always stay)",
  "/hosting": "Hosting hub",
  "/domain": "Domain hub",
  "/email-hosting": "Email hosting hub",
}

/**
 * Paths owned by coded routes that don't render CMS sections. A CMS page here would never
 * be visible, so creation is blocked (their SEO can still be managed under SEO).
 */
const RESERVED_PREFIXES = [
  "/admin",
  "/api",
  "/studio",
  "/_next",
  "/order",
  "/become-our-affiliate",
  "/compare-hosting-plans",
  "/dedicated-hosting",
  "/knowledge-base",
  "/legal",
  "/promo",
  "/search",
  "/sitemap-page",
  "/ssl",
  "/support",
  "/thank-you",
  "/tools",
  "/vps-hosting",
  "/domain/",
  "/email-hosting/",
  "/hosting/",
]

/** "About Us / Team " -> "/about-us/team". Home is "/". */
export function normalizePath(input: string): string {
  const cleaned = input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/[^/]+/, "")
    .replace(/[?#].*$/, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9/_-]/g, "")
    .replace(/\/{2,}/g, "/")
    .replace(/-{2,}/g, "-")
    .replace(/\/+$/, "")
  return cleaned.startsWith("/") ? cleaned || "/" : `/${cleaned}`
}

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
}

/** Returns an error message if `path` can't be used for a CMS page of `pageType`, else null. */
export function validatePagePath(path: string, pageType: PageType): string | null {
  if (!/^\/[a-z0-9/_-]*$/.test(path)) return "URL may only contain lowercase letters, numbers, dashes and slashes."
  if (path.length > 200) return "URL is too long."
  if (pageType === "blog") {
    return /^\/blog\/[a-z0-9_-]+$/.test(path) ? null : "Blog post URLs must look like /blog/your-post-slug."
  }
  if (path === "/blog" || path.startsWith("/blog/")) return "/blog URLs are reserved for blog posts (choose page type “Blog post”)."
  if (pageType === "home" && path !== "/") return "The home page must use the URL “/”."
  if (path in CMS_INTEGRATED_PATHS) return null
  const reserved = RESERVED_PREFIXES.find((prefix) =>
    prefix.endsWith("/") ? path.startsWith(prefix) : path === prefix || path.startsWith(`${prefix}/`)
  )
  if (reserved) return `“${path}” is served by a built-in page. Manage its SEO under SEO instead, or choose another URL.`
  return null
}

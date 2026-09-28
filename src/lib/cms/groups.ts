/**
 * How pages are grouped in the admin's Content menu. Groups are derived from the URL, so a
 * page always lands in the right place without editors choosing a category.
 */
export type ContentGroup = "home" | "company" | "services" | "legal" | "knowledge-base" | "blog" | "promotions" | "custom"

export const CONTENT_GROUPS: Record<ContentGroup, { title: string; description: string }> = {
  home: { title: "Home page", description: "The website's front page." },
  company: { title: "Company pages", description: "About, contact, support, affiliate, plan comparison and thank-you pages." },
  services: { title: "Services & products", description: "Hosting, domain, email, dedicated server, SSL and VPS pages, plus their hub pages." },
  legal: { title: "Legal pages", description: "Privacy policy, terms of service, SLA and other policies." },
  "knowledge-base": { title: "Knowledge base", description: "Help-centre home with its categories and articles." },
  blog: { title: "Blog", description: "The blog home and every article." },
  promotions: { title: "Promotions", description: "Time-limited campaign pages under /promo." },
  custom: { title: "Custom pages", description: "Free-form pages built from sections at their own URL." },
}

const COMPANY_PATHS = new Set(["/about-us", "/contact-us", "/support", "/become-our-affiliate", "/compare-hosting-plans", "/thank-you"])
const SERVICE_HUBS = new Set(["/hosting", "/domain", "/email-hosting", "/ssl", "/vps-hosting"])

export function contentGroupForPath(path: string): ContentGroup {
  if (path === "/") return "home"
  if (COMPANY_PATHS.has(path)) return "company"
  if (SERVICE_HUBS.has(path) || /^\/(hosting|domain|email-hosting|dedicated-hosting|ssl)\//.test(path)) return "services"
  if (path.startsWith("/legal/")) return "legal"
  if (path === "/knowledge-base") return "knowledge-base"
  if (path === "/blog" || path.startsWith("/blog/")) return "blog"
  if (path.startsWith("/promo/")) return "promotions"
  return "custom"
}

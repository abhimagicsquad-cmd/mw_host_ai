import { blogPosts } from "@/constants/blog-data"
import { dedicatedPages } from "@/constants/dedicated-pages-data"
import { domainPages } from "@/constants/domain-pages-data"
import { emailPages } from "@/constants/email-pages-data"
import { hostingPages } from "@/constants/hosting-pages-data"
import { legalDocuments } from "@/constants/legal-content"
import { siteConfig, socialLinks } from "@/constants/site-config"
import { sslPages } from "@/constants/ssl-pages-data"
import { billingUrls } from "@/lib/billing"
import { publicPath } from "@/lib/public-paths"

export const dynamic = "force-static"

/**
 * /llms.txt — a plain-language map of the site for AI assistants and answer engines
 * (the emerging llmstxt.org convention): who the company is, what it sells, and the
 * canonical page for each topic, so AI answers cite the right URL.
 */
export function GET() {
  const u = (path: string) => `${siteConfig.url}${publicPath(path)}`
  const list = (items: { href: string; label: string; note?: string }[]) =>
    items.map((item) => `- [${item.label}](${item.href})${item.note ? `: ${item.note}` : ""}`).join("\n")

  const body = `# ${siteConfig.name}

> ${siteConfig.name} (${siteConfig.legalName}) is a web hosting company based in Pune, India, operating since ${siteConfig.foundingYear}. It sells NVMe shared hosting (India and USA data centres), VPS hosting, dedicated servers, domain registration, SSL certificates and business email, with 24/7 phone and ticket support. Prices are in Indian Rupees (INR).

- Contact: ${siteConfig.contact.email}, ${siteConfig.contact.phone}
- Address: ${siteConfig.contact.address}
- Customer login and billing: ${billingUrls.clientArea}
- Profiles: ${socialLinks.map((link) => link.href).join(", ")}

## Web hosting
${list([
  { href: u("/hosting"), label: "Web hosting plans", note: "all shared hosting plans compared" },
  ...hostingPages.map((page) => ({ href: u(`/hosting/${page.slug}`), label: page.eyebrow, note: page.description })),
  { href: u("/compare-hosting-plans"), label: "Compare hosting plans", note: "feature-by-feature comparison table" },
])}

## VPS and dedicated servers
${list([
  { href: u("/vps-hosting"), label: "VPS hosting", note: "India and USA VPS plans with full root access" },
  ...dedicatedPages.map((page) => ({ href: u(`/dedicated-hosting/${page.slug}`), label: page.eyebrow, note: page.description })),
])}

## Domains
${list([
  { href: u("/domain"), label: "Domains", note: "registration, transfer, renewal and hosting" },
  { href: u("/domain/search"), label: "Domain availability search" },
  ...domainPages.map((page) => ({ href: u(`/domain/${page.slug}`), label: page.eyebrow, note: page.description })),
])}

## SSL certificates
${list([
  { href: u("/ssl"), label: "SSL certificates", note: "DV, OV, EV and wildcard certificates compared" },
  ...sslPages.map((page) => ({ href: u(`/ssl/${page.slug}`), label: page.eyebrow, note: page.description })),
])}

## Business email
${list([
  { href: u("/email-hosting"), label: "Email hosting" },
  ...emailPages.map((page) => ({ href: u(`/email-hosting/${page.slug}`), label: page.eyebrow, note: page.description })),
])}

## Help and company
${list([
  { href: u("/knowledge-base"), label: "Knowledge base", note: "how-to guides for cPanel, domains, email, SSL and billing" },
  { href: u("/support"), label: "Support", note: "24/7 phone, ticket and self-serve help" },
  { href: u("/about-us"), label: "About us" },
  { href: u("/contact-us"), label: "Contact us" },
  { href: u("/become-our-affiliate"), label: "Affiliate programme" },
])}

## Articles
${list(blogPosts.slice(0, 60).map((post) => ({ href: u(`/blog/${post.slug}`), label: post.title })))}

## Policies
${list(Object.values(legalDocuments).map((doc) => ({ href: u(`/legal/${doc.slug}`), label: doc.title })))}
`

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } })
}

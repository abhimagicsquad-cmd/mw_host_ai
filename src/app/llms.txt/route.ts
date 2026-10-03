import { blogPosts } from "@/constants/blog-data"
import { dedicatedPages } from "@/constants/dedicated-pages-data"
import { domainPages, tldPricing, tldTransferPricing } from "@/constants/domain-pages-data"
import { emailPages } from "@/constants/email-pages-data"
import { hostingPages } from "@/constants/hosting-pages-data"
import { dedicatedPlans, sharedHostingPlans, sslPlans, vpsPlans } from "@/constants/pricing-plans"
import { legalDocuments } from "@/constants/legal-content"
import { siteConfig, socialLinks } from "@/constants/site-config"
import { sslPages } from "@/constants/ssl-pages-data"
import { billingUrls } from "@/lib/billing"
import { getPricingPlansByService } from "@/lib/cms/queries"
import { publicPath } from "@/lib/public-paths"

export const dynamic = "force-static"

/**
 * /llms.txt — a plain-language map of the site for AI assistants and answer engines
 * (the emerging llmstxt.org convention): who the company is, what it sells, and the
 * canonical page for each topic, so AI answers cite the right URL.
 */
type PricedPlan = { name: string; price: string }

const priceValue = (price: string) => Number(price.replace(/[^d.]/g, "")) || Number.POSITIVE_INFINITY

/** The cheapest plan's price as displayed (e.g. "₹145"). */
const fromPrice = (plans: PricedPlan[]) => plans.reduce((min, plan) => (priceValue(plan.price) < priceValue(min.price) ? plan : min), plans[0]).price

/** The dashboard's published India plans for a service, or the built-in plans when there are none. */
async function plansFor(service: string, fallback: PricedPlan[]): Promise<PricedPlan[]> {
  const plans = await getPricingPlansByService(service, "india")
  return plans.length ? plans : fallback
}

export async function GET() {
  const u = (path: string) => `${siteConfig.url}${publicPath(path)}`
  // Same price source as the pages (dashboard Pricing Plans first), so AI answers quote current prices.
  const [shared, vps, dedicated, ssl] = await Promise.all([
    plansFor("shared-hosting", sharedHostingPlans),
    plansFor("vps-hosting", vpsPlans),
    plansFor("dedicated-server", dedicatedPlans),
    plansFor("ssl", sslPlans),
  ])
  const list = (items: { href: string; label: string; note?: string }[]) =>
    items.map((item) => `- [${item.label}](${item.href})${item.note ? `: ${item.note}` : ""}`).join("\n")

  const body = `# ${siteConfig.name}

> ${siteConfig.name} (${siteConfig.legalName}) is a web hosting company based in Pune, India, operating since ${siteConfig.foundingYear}. It sells NVMe shared hosting (India and USA data centres), VPS hosting, dedicated servers, domain registration, SSL certificates and business email, with 24/7 phone and ticket support. Prices are in Indian Rupees (INR).

- Contact: ${siteConfig.contact.email}, ${siteConfig.contact.phone}
- Address: ${siteConfig.contact.address}
- Customer login and billing: ${billingUrls.clientArea}
- Profiles: ${socialLinks.map((link) => link.href).join(", ")}

## Prices at a glance (INR)
- Shared NVMe hosting: from ${fromPrice(shared)}/month on a 3-year term (${shared.map((plan) => `${plan.name} ${plan.price}`).join(", ")}); 1-, 2- and 3-year terms available
- VPS (India): from ${fromPrice(vps)}/month; dedicated servers (India): from ${fromPrice(dedicated)}/month
- SSL certificates: from ${fromPrice(ssl)}/year
- Domain registration per year: ${tldPricing.map((tld) => `${tld.tld} ${tld.price}`).join(", ")}
- Domain transfer (adds 1 year): ${tldTransferPricing.map((tld) => `${tld.tld} ${tld.price}`).join(", ")}

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

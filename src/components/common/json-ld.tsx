import { siteConfig, socialLinks } from "@/constants/site-config"
import { publicPath } from "@/lib/public-paths"
import type { BreadcrumbItem, FAQItem } from "@/types/content"

const ORG_ID = `${siteConfig.url}/#organization`
const WEBSITE_ID = `${siteConfig.url}/#website`
const LOGO_URL = `${siteConfig.url}/images/mwh-mark.png`
const SHARE_IMAGE_URL = `${siteConfig.url}/opengraph-image`

function JsonLd({ data }: { data: object }) {
  // Escape "<" so no string in the data can close the <script> element.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
}

const postalAddress = { "@type": "PostalAddress", ...siteConfig.contact.postalAddress }

/**
 * Organization + LocalBusiness + WebSite graph for the homepage. The entity data (legal name,
 * founding year, address, contact points, official social profiles via sameAs) is what search
 * and AI answer engines use to identify the company and connect it to its profiles.
 */
export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": ORG_ID,
            name: siteConfig.name,
            legalName: siteConfig.legalName,
            alternateName: "MagicWorksHost",
            url: siteConfig.url,
            logo: { "@type": "ImageObject", url: LOGO_URL, width: 512, height: 512 },
            image: SHARE_IMAGE_URL,
            description: siteConfig.description,
            foundingDate: String(siteConfig.foundingYear),
            email: siteConfig.contact.email,
            telephone: siteConfig.contact.phone,
            address: postalAddress,
            areaServed: { "@type": "Country", name: "India" },
            sameAs: socialLinks.map((link) => link.href),
            contactPoint: [
              { "@type": "ContactPoint", contactType: "sales", telephone: siteConfig.contact.phone, email: siteConfig.contact.email, areaServed: "IN", availableLanguage: ["en"] },
              { "@type": "ContactPoint", contactType: "technical support", telephone: siteConfig.contact.phone, areaServed: "IN", availableLanguage: ["en"], hoursAvailable: { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "00:00", closes: "23:59" } },
            ],
            knowsAbout: ["Web hosting", "NVMe hosting", "WordPress hosting", "VPS hosting", "Dedicated servers", "Domain registration", "SSL certificates", "Business email hosting"],
          },
          {
            "@type": "LocalBusiness",
            "@id": `${siteConfig.url}/#localbusiness`,
            name: siteConfig.name,
            parentOrganization: { "@id": ORG_ID },
            url: siteConfig.url,
            image: LOGO_URL,
            telephone: siteConfig.contact.phone,
            email: siteConfig.contact.email,
            address: postalAddress,
            openingHoursSpecification: [
              { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "09:30", closes: "18:30" },
            ],
          },
          {
            "@type": "WebSite",
            "@id": WEBSITE_ID,
            name: siteConfig.name,
            url: siteConfig.url,
            inLanguage: "en-IN",
            publisher: { "@id": ORG_ID },
            potentialAction: {
              "@type": "SearchAction",
              target: `${siteConfig.url}/search/?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          },
        ],
      }}
    />
  )
}

/** FAQPage structured data — pass the same items rendered by <FAQAccordion />. Answers must be plain text (JSON-LD can't carry ReactNode markup). */
export function FaqJsonLd({ items }: { items: FAQItem[] }) {
  const textItems = items.filter((item): item is FAQItem & { answer: string } => typeof item.answer === "string")

  if (textItems.length === 0) return null

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: textItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }}
    />
  )
}

/** HowTo structured data for a numbered "how to get started" list rendered on the page. */
export function HowToJsonLd({ name, steps }: { name: string; steps: { name: string; text: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "HowTo",
        name,
        step: steps.map((step, index) => ({ "@type": "HowToStep", position: index + 1, name: step.name, text: step.text })),
      }}
    />
  )
}

type BlogPostingJsonLdProps = {
  title: string
  description: string
  slug: string
  authorName: string
  datePublished?: string | null
  dateModified?: string | null
  wordCount?: number
  section?: string
}

/** BlogPosting structured data for a single blog post page. */
export function BlogPostingJsonLd({ title, description, slug, authorName, datePublished, dateModified, wordCount, section }: BlogPostingJsonLdProps) {
  const url = `${siteConfig.url}${publicPath(`/blog/${slug}`)}`
  const isTeam = /magicworks host/i.test(authorName)
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: title,
        description,
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        image: [SHARE_IMAGE_URL],
        ...(datePublished ? { datePublished } : {}),
        ...(dateModified || datePublished ? { dateModified: dateModified ?? datePublished } : {}),
        ...(wordCount ? { wordCount } : {}),
        ...(section ? { articleSection: section } : {}),
        inLanguage: "en-IN",
        // Team posts are authored by the Organization itself — same @id, so the same name
        // (a different name on the same @id reads as two conflicting entities).
        author: isTeam ? { "@type": "Organization", "@id": ORG_ID, name: siteConfig.name, url: siteConfig.url } : { "@type": "Person", name: authorName, worksFor: { "@id": ORG_ID } },
        publisher: {
          "@type": "Organization",
          "@id": ORG_ID,
          name: siteConfig.name,
          logo: { "@type": "ImageObject", url: LOGO_URL, width: 512, height: 512 },
        },
      }}
    />
  )
}

function parsePriceNumber(price: string) {
  const numeric = Number(price.replace(/[^\d.]/g, ""))
  return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined
}

type ProductJsonLdProps = {
  /** The service's plain name ("WordPress Hosting") — what people and AI engines search for. */
  name: string
  /** The page's marketing headline, kept as the product's slogan. */
  slogan?: string
  description: string
  path: string
  plans: { name: string; price: string }[]
}

/**
 * Product + Service structured data for a pricing page: offers (a single Offer for one plan,
 * or an AggregateOffer across a tier grid), and a Service entity provided by the Organization
 * so the service connects to the company in knowledge graphs.
 */
export function ProductJsonLd({ name, slogan, description, path, plans }: ProductJsonLdProps) {
  const prices = plans.map((plan) => parsePriceNumber(plan.price)).filter((value): value is number => typeof value === "number")
  if (prices.length === 0) return null

  const url = `${siteConfig.url}${publicPath(path)}`
  const common = { priceCurrency: "INR", url, availability: "https://schema.org/InStock", seller: { "@id": ORG_ID } }
  const offers =
    prices.length === 1
      ? { "@type": "Offer", price: prices[0], ...common }
      : { "@type": "AggregateOffer", lowPrice: Math.min(...prices), highPrice: Math.max(...prices), offerCount: prices.length, ...common }

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Product",
            "@id": `${url}#product`,
            name,
            ...(slogan && slogan !== name ? { slogan } : {}),
            description,
            url,
            image: SHARE_IMAGE_URL,
            brand: { "@type": "Brand", name: siteConfig.name },
            offers,
          },
          {
            "@type": "Service",
            "@id": `${url}#service`,
            name,
            serviceType: name,
            description,
            url,
            provider: { "@id": ORG_ID },
            brand: { "@type": "Brand", name: siteConfig.name },
            offers,
          },
        ],
      }}
    />
  )
}

/**
 * BreadcrumbList structured data — pass the same items rendered by <Breadcrumbs />. Middle
 * crumbs without a link (e.g. a "Legal" label with no index page) are left out, since every
 * crumb except the current page must have a URL.
 */
export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const linked = items.filter((item, index) => item.href || index === items.length - 1)
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: linked.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.label,
          ...(item.href ? { item: `${siteConfig.url}${publicPath(item.href)}` } : {}),
        })),
      }}
    />
  )
}

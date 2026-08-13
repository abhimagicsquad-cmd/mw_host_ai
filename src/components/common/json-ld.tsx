import { siteConfig } from "@/constants/site-config"
import type { BreadcrumbItem, FAQItem } from "@/types/content"

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}

/** Organization + WebSite structured data for the homepage. */
export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            name: siteConfig.name,
            url: siteConfig.url,
            logo: `${siteConfig.url}/images/logo-magicworkshost-best-web-hosting-300.png`,
            telephone: siteConfig.contact.phone,
            email: siteConfig.contact.email,
            address: {
              "@type": "PostalAddress",
              streetAddress: siteConfig.contact.address,
            },
          },
          {
            "@type": "WebSite",
            name: siteConfig.name,
            url: siteConfig.url,
            potentialAction: {
              "@type": "SearchAction",
              target: `${siteConfig.url}/search?q={search_term_string}`,
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

type BlogPostingJsonLdProps = {
  title: string
  description: string
  slug: string
  authorName: string
}

/** BlogPosting structured data for a single blog post page. */
export function BlogPostingJsonLd({ title, description, slug, authorName }: BlogPostingJsonLdProps) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: title,
        description,
        url: `${siteConfig.url}/blog/${slug}`,
        author: {
          "@type": "Organization",
          name: authorName,
        },
        publisher: {
          "@type": "Organization",
          name: siteConfig.name,
          logo: {
            "@type": "ImageObject",
            url: `${siteConfig.url}/images/logo-magicworkshost-best-web-hosting-300.png`,
          },
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
  name: string
  description: string
  path: string
  plans: { name: string; price: string }[]
}

/** Product structured data for a pricing page — a single Offer for one plan, or an AggregateOffer across a tier grid. */
export function ProductJsonLd({ name, description, path, plans }: ProductJsonLdProps) {
  const prices = plans.map((plan) => parsePriceNumber(plan.price)).filter((value): value is number => typeof value === "number")
  if (prices.length === 0) return null

  const url = `${siteConfig.url}${path}`
  const offers =
    prices.length === 1
      ? { "@type": "Offer", priceCurrency: "INR", price: prices[0], url, availability: "https://schema.org/InStock" }
      : {
          "@type": "AggregateOffer",
          priceCurrency: "INR",
          lowPrice: Math.min(...prices),
          highPrice: Math.max(...prices),
          offerCount: prices.length,
          url,
        }

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description,
        url,
        offers,
      }}
    />
  )
}

/** BreadcrumbList structured data — pass the same items rendered by <Breadcrumbs />. */
export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.label,
          ...(item.href ? { item: `${siteConfig.url}${item.href}` } : {}),
        })),
      }}
    />
  )
}

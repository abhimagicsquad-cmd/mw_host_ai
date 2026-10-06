import type { Metadata } from "next"
import Link from "@/components/common/site-link"
import { ArrowRight } from "lucide-react"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { ItemListJsonLd } from "@/components/common/json-ld"
import { DeferredQuoteForm } from "@/components/forms/deferred-quote-form"
import { SectionContainer } from "@/components/layout/section-container"
import { CTASection } from "@/components/sections/cta-section"
import { FAQSection } from "@/components/sections/faq-section"
import { PageHero } from "@/components/sections/page-hero"
import { QuoteFormSection } from "@/components/sections/quote-form-section"
import { RelatedLinksSection } from "@/components/sections/related-links-section"
import { getGuide, guideHref } from "@/constants/kb-guides"
import { serviceLandingPath, serviceLandings } from "@/constants/service-landing-data"
import { serviceLinkFor } from "@/constants/service-links"
import { buildPageMetadata } from "@/lib/seo"

export function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Website Services – Development, Migration & Security",
    description:
      "Website development, maintenance, migration and security from MagicWorks Host — the same team that runs your hosting, domains and email. Request a quote.",
    path: "/services",
  })
}

const businessServices = serviceLandings.filter((service) => service.cluster === "business")

const GUIDES = ["website-migration-checklist", "common-website-security-threats", "how-website-backups-work", "how-to-speed-up-wordpress"]

/** Hub of the business-services cluster: links every website service and the guides behind them. */
export default function WebsiteServicesPage() {
  const guides = GUIDES.map(getGuide)
    .filter((guide) => guide !== undefined)
    .map((guide) => ({ label: guide.title, href: guideHref(guide.slug), description: guide.excerpt }))
  const hosting = ["/services/cloud-hosting", "/services/reseller-hosting", "/hosting/wordpress-hosting", "/dedicated-hosting/managed-dedicated-server"]
    .map(serviceLinkFor)
    .filter((link) => link !== undefined)

  return (
    <>
      <ItemListJsonLd name="Website services" items={businessServices.map((service) => ({ name: service.name, path: serviceLandingPath(service.slug) }))} />

      <PageHero
        title="Website services"
        description="Help with the website itself — building it, keeping it updated, moving it and keeping it secure — from the team that already runs your hosting, domains and email."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Website Services" }]}
        cta={{ label: "Request a quote", href: "#quote" }}
        ctaSource="services-hub"
      />

      <SectionContainer width="wide">
        <ul className="grid gap-5 sm:grid-cols-2">
          {businessServices.map((service) => (
            <li key={service.slug}>
              <Link
                href={serviceLandingPath(service.slug)}
                className="group flex h-full flex-col gap-3 rounded-2xl border border-border-alt bg-background p-6 transition-shadow hover:shadow-md"
              >
                <h2 className="text-xl font-semibold text-brand-navy group-hover:text-brand-orange">{service.name}</h2>
                <p className="text-sm leading-relaxed text-body-text">{service.answer.answer}</p>
                <span className="mt-auto flex items-center gap-1 text-sm font-medium text-brand-orange">
                  About {service.name.toLowerCase()}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </SectionContainer>

      <div id="quote">
        <QuoteFormSection
          eyebrow="Get started"
          title="Tell us what your website needs"
          description="Pick the service in the form and describe your site — our team will follow up with a scope and price."
        >
          <DeferredQuoteForm source="services-hub" />
        </QuoteFormSection>
      </div>

      <RelatedLinksSection servicesTitle="Hosting for your website" services={hosting} guides={guides} background="none" />

      <FAQSection
        eyebrow="FAQs"
        title="Website services questions, answered"
        background="alt"
        items={[
          {
            question: "Do I need to host with MagicWorks Host to use these services?",
            answer: "Tell us where your website is hosted in the quote form. Moving it to our hosting is also an option — website migration is free on annual hosting plans.",
          },
          {
            question: "How are website services priced?",
            answer: "Development, maintenance and security work is quoted to your website and requirements. Migration is free on annual hosting plans.",
          },
          {
            question: "How do I get started?",
            answer: "Fill in the quote form on this page or call our team. We'll ask a few questions about your site and send you a proposal.",
          },
        ]}
      />

      <CTASection
        title="Talk to the team behind your hosting"
        description="Our team in Pune answers by phone and ticket, 24/7."
        primaryCta={{ label: "Request a quote", href: "#quote" }}
        secondaryCta={{ label: "Talk to an expert", href: LEAD_CTA_HREF }}
        background="navy"
      />
    </>
  )
}

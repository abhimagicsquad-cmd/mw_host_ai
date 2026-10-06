import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { ProductJsonLd, ServiceJsonLd } from "@/components/common/json-ld"
import { DeferredQuoteForm } from "@/components/forms/deferred-quote-form"
import { AnswerBlock } from "@/components/sections/answer-block"
import { CTASection } from "@/components/sections/cta-section"
import { FAQSection } from "@/components/sections/faq-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { HeroSection } from "@/components/sections/hero-section"
import { HeroVisual } from "@/components/sections/hero-visual"
import { PricingSection } from "@/components/sections/pricing-section"
import { QuoteFormSection } from "@/components/sections/quote-form-section"
import { RelatedLinksSection } from "@/components/sections/related-links-section"
import { getGuide, guideHref } from "@/constants/kb-guides"
import { vpsPlans, vpsPlansUSA } from "@/constants/pricing-plans"
import { getServiceLanding, serviceLandingPath, serviceLandings } from "@/constants/service-landing-data"
import { serviceLinkFor } from "@/constants/service-links"
import { siteConfig } from "@/constants/site-config"
import { getPricingPlansByService } from "@/lib/cms/queries"
import { buildPageMetadata } from "@/lib/seo"

type ServicePageProps = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return serviceLandings.map((service) => ({ slug: service.slug }))
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const service = getServiceLanding((await params).slug)
  if (!service) return {}
  return buildPageMetadata({ title: service.metaTitle, description: service.metaDescription, path: serviceLandingPath(service.slug) })
}

/** The cloud VPS tiers — the same plans (dashboard first, built-in fallback) as /vps-hosting. */
async function cloudPlans() {
  const cmsPlans = await getPricingPlansByService("vps-hosting")
  const india = cmsPlans.filter((plan) => plan.region !== "usa")
  const usa = cmsPlans.filter((plan) => plan.region === "usa")
  return { india: india.length ? india : vpsPlans, usa: usa.length ? usa : vpsPlansUSA }
}

export default async function ServiceLandingPage({ params }: ServicePageProps) {
  const service = getServiceLanding((await params).slug)
  if (!service) notFound()

  const path = serviceLandingPath(service.slug)
  const plans = service.pricing === "vps" ? await cloudPlans() : null
  const parent =
    service.cluster === "hosting" ? { label: "Hosting", href: "/hosting" } : { label: "Website Services", href: "/services" }
  const related = service.related.map(serviceLinkFor).filter((link) => link !== undefined)
  const guides = service.guides
    .map(getGuide)
    .filter((guide) => guide !== undefined)
    .map((guide) => ({ label: guide.title, href: guideHref(guide.slug), description: guide.excerpt }))

  return (
    <>
      {plans ? (
        <ProductJsonLd name={service.name} slogan={service.title} description={service.description} path={path} plans={[...plans.india, ...plans.usa]} />
      ) : (
        <ServiceJsonLd name={service.name} description={service.description} path={path} category={service.cluster === "hosting" ? "Web hosting" : "Website services"} />
      )}

      <HeroSection
        eyebrow={service.name}
        title={service.title}
        description={service.description}
        bullets={service.bullets}
        primaryCta={plans ? { label: "View plans", href: "#pricing" } : { label: "Request a quote", href: "#quote" }}
        secondaryCta={{ label: "Talk to an expert", href: LEAD_CTA_HREF }}
        stats={[
          { label: "Support", value: "24/7" },
          { label: "In business since", value: String(siteConfig.foundingYear) },
          { label: "Servers", value: "India & USA" },
        ]}
        media={<HeroVisual variant={service.heroVisual} />}
        breadcrumbs={[{ label: "Home", href: "/" }, parent, { label: service.name }]}
      />

      <AnswerBlock question={service.answer.question} answer={service.answer.answer} facts={service.answer.facts} steps={service.steps} label={service.name} />

      <FeaturesSection
        eyebrow={service.includes.eyebrow}
        title={service.includes.title}
        description={service.includes.description}
        columns={3}
        background="alt"
        features={service.includes.items}
      />

      {plans ? (
        <div id="pricing">
          <PricingSection
            eyebrow="Pricing"
            title="Cloud VPS plans"
            description="Choose the data-centre region closest to your users."
            tabs={[
              { value: "india", label: "India", plans: plans.india },
              { value: "usa", label: "USA", plans: plans.usa },
            ]}
          />
        </div>
      ) : null}

      <div id="quote">
        <QuoteFormSection eyebrow={plans ? "Not sure which tier?" : "Get started"} title={service.quote.title} description={service.quote.description}>
          <DeferredQuoteForm source={`service:${service.slug}`} defaultService={service.quoteService} />
        </QuoteFormSection>
      </div>

      <RelatedLinksSection services={related} guides={guides} background="none" />

      <FAQSection eyebrow="FAQs" title={`${service.name} questions, answered`} items={service.faqs} background="alt" />

      <CTASection
        title={plans ? "Ready to move to the cloud?" : `Talk to us about ${service.name.toLowerCase()}`}
        description="Our team in Pune answers by phone and ticket, 24/7."
        primaryCta={plans ? { label: "View plans", href: "#pricing" } : { label: "Request a quote", href: "#quote" }}
        secondaryCta={{ label: "Talk to an expert", href: LEAD_CTA_HREF }}
        background="navy"
      />
    </>
  )
}

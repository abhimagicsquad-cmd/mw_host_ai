import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { ProductJsonLd } from "@/components/common/json-ld"
import { AnswerSection } from "@/components/sections/answer-section"
import { CTASection } from "@/components/sections/cta-section"
import { FAQSection } from "@/components/sections/faq-section"
import { TestimonialsSection } from "@/components/sections/testimonials-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { HeroSection } from "@/components/sections/hero-section"
import { HeroVisual } from "@/components/sections/hero-visual"
import { PricingSection } from "@/components/sections/pricing-section"
import { TldPricingStrip } from "@/components/sections/tld-pricing-strip"
import { SectionContainer } from "@/components/layout/section-container"
import { DomainSearchWidget } from "@/components/tools/domain-search-widget"
import { domainIncludedFeatures, domainPages, domainTransferNotes, getDomainPage, tldPricing, tldTransferPricing } from "@/constants/domain-pages-data"
import { sharedHostingPlans } from "@/constants/pricing-plans"
import { testimonials } from "@/constants/testimonials"
import { billingUrls } from "@/lib/billing"
import { resolveIcon } from "@/lib/icon-map"
import { buildPageMetadata } from "@/lib/seo"
import { getAllServicePageSlugs, getPricingPlansByService, getServicePage } from "@/lib/cms/queries"

type DomainSlugPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const cmsSlugs = await getAllServicePageSlugs("domain")
  const slugs = new Set([...domainPages.map((page) => page.slug), ...cmsSlugs])
  return [...slugs].map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: DomainSlugPageProps): Promise<Metadata> {
  const { slug } = await params
  const cms = await getServicePage("domain", slug)
  const page = getDomainPage(slug)

  if (!cms && !page) return {}

  return buildPageMetadata({
    title: cms?.seo?.metaTitle ?? cms?.heroTitle ?? page?.title ?? "",
    description: cms?.seo?.metaDescription ?? cms?.heroDescription ?? page?.description ?? "",
    path: `/domain/${slug}`,
  })
}

export default async function DomainSlugPage({ params }: DomainSlugPageProps) {
  const { slug } = await params
  const cms = await getServicePage("domain", slug)
  const fallback = getDomainPage(slug)

  if (!cms && !fallback) notFound()

  const eyebrow = cms?.eyebrow ?? fallback!.eyebrow
  const title = cms?.heroTitle ?? fallback!.title
  const description = cms?.heroDescription ?? fallback!.description
  const bullets = cms?.bullets ?? fallback!.bullets
  const faqs = cms?.faqs ?? fallback!.faqs
  const copy = cms?.copy
  const features = cms?.features?.length
    ? cms.features.map((f) => ({ title: f.title, description: f.description ?? "", icon: resolveIcon(f.icon) }))
    : domainIncludedFeatures

  // Page flows, as on WordPress: the transfer page orders transfers (at transfer prices), the renew
  // page sends customers to the client area, and every other domain page searches + registers.
  const isTransfer = slug === "transfer-your-domain-name"
  const isRenew = slug === "renew"
  const searchCta = { label: isTransfer ? "Transfer your domain" : "Search domains", href: "#domain-search" }
  const renewCta = { label: "Log in to renew", href: billingUrls.clientArea, external: true }
  const prices = isTransfer ? tldTransferPricing : tldPricing
  const cmsPlans = isRenew ? [] : await getPricingPlansByService("shared-hosting", "india")
  const plans = isRenew ? [] : cmsPlans.length ? cmsPlans : sharedHostingPlans

  return (
    <>
      {/* Offers for the TLD prices shown on the page (registration, or transfer on the transfer page). */}
      <ProductJsonLd
        name={title}
        description={description}
        path={`/domain/${slug}`}
        plans={prices.map((tld) => ({ name: `${tld.tld} domain${isTransfer ? " transfer" : ""}`, price: tld.price }))}
      />

      <HeroSection
        eyebrow={eyebrow}
        title={title}
        description={description}
        bullets={bullets}
        primaryCta={copy?.primaryCta ?? (isRenew ? renewCta : searchCta)}
        secondaryCta={copy?.secondaryCta ?? (isRenew ? { label: "Search domains", href: "#domain-search" } : { label: "Talk to an expert", href: LEAD_CTA_HREF })}
        stats={
          copy?.heroStats?.length
            ? copy.heroStats.map(({ label, value }) => ({ label, value }))
            : [
                { label: isTransfer ? ".com transfer" : ".com from", value: prices[0].price },
                { label: "Propagation", value: "< 24 hrs" },
                { label: "WHOIS privacy", value: "Free" },
              ]
        }
        media={<HeroVisual variant="domain" />}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Domains", href: "/domain" }, { label: eyebrow }]}
      />

      <AnswerSection path={`/domain/${slug}`} kind="domain" label={eyebrow} />

      <SectionContainer width="narrow" id="domain-search" className="scroll-mt-24">
        <DomainSearchWidget mode={isTransfer ? "transfer" : "register"} />
        {isRenew ? (
          <p className="mt-5 text-center text-sm text-body-text">
            Already registered with us?{" "}
            <a href={billingUrls.clientArea} className="font-medium text-brand-orange hover:underline">
              Log in to your client area
            </a>{" "}
            and renew from My Domains — or turn on auto-renewal so it never lapses.
          </p>
        ) : null}
      </SectionContainer>

      <TldPricingStrip items={prices} />

      {isTransfer ? (
        <FeaturesSection eyebrow="Before you transfer" title="Transfer of domain notes" columns={3} features={domainTransferNotes} />
      ) : null}

      <FeaturesSection
        eyebrow={copy?.featuresEyebrow || "Included"}
        title={copy?.featuresTitle || "What you get with every domain"}
        columns={3}
        features={features}
      />

      {plans.length ? (
        <div id="pricing">
          <PricingSection
            eyebrow="Hosting for your domain"
            title="Select from Magic Host packages"
            description="Powerful, lightning-fast NVMe web hosting — pick a plan and billing period."
            plans={plans}
            background="alt"
          />
        </div>
      ) : null}

      <TestimonialsSection title="Don't just take it from us" description="See what our customers say about us." testimonials={testimonials} />

      <FAQSection eyebrow={copy?.faqEyebrow || "FAQs"} title={copy?.faqTitle || `${eyebrow} questions, answered`} items={faqs} />

      <CTASection
        title={copy?.ctaTitle || "Ready to get your domain sorted?"}
        description={copy?.ctaDescription || "Our team can register, host, or transfer it for you today."}
        primaryCta={copy?.ctaPrimary ?? (isRenew ? renewCta : searchCta)}
        secondaryCta={copy?.ctaSecondary}
        background="navy"
      />
    </>
  )
}

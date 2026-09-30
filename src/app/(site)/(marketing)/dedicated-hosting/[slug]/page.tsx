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
import { dedicatedPages, dedicatedTrustFeatures, getDedicatedPage } from "@/constants/dedicated-pages-data"
import { dedicatedPlans, dedicatedPlansUSA } from "@/constants/pricing-plans"
import { testimonials } from "@/constants/testimonials"
import { resolveIcon } from "@/lib/icon-map"
import { buildPageMetadata } from "@/lib/seo"
import { getAllServicePageSlugs, getPricingPlansByService, getServicePage } from "@/lib/cms/queries"

type DedicatedSlugPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const cmsSlugs = await getAllServicePageSlugs("dedicated")
  const slugs = new Set([...dedicatedPages.map((page) => page.slug), ...cmsSlugs])
  return [...slugs].map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: DedicatedSlugPageProps): Promise<Metadata> {
  const { slug } = await params
  const cms = await getServicePage("dedicated", slug)
  const page = getDedicatedPage(slug)

  if (!cms && !page) return {}

  return buildPageMetadata({
    title: cms?.seo?.metaTitle ?? cms?.heroTitle ?? page?.title ?? "",
    description: cms?.seo?.metaDescription ?? cms?.heroDescription ?? page?.description ?? "",
    path: `/dedicated-hosting/${slug}`,
  })
}

export default async function DedicatedSlugPage({ params }: DedicatedSlugPageProps) {
  const { slug } = await params
  const cms = await getServicePage("dedicated", slug)
  const fallback = getDedicatedPage(slug)

  if (!cms && !fallback) notFound()

  const eyebrow = cms?.eyebrow ?? fallback!.eyebrow
  const title = cms?.heroTitle ?? fallback!.title
  const description = cms?.heroDescription ?? fallback!.description
  const bullets = cms?.bullets ?? fallback!.bullets
  const managed = cms?.managed ?? fallback!.managed
  const faqs = cms?.faqs ?? fallback!.faqs
  const copy = cms?.copy
  const features = cms?.features?.length
    ? cms.features.map((f) => ({ title: f.title, description: f.description ?? "", icon: resolveIcon(f.icon) }))
    : dedicatedTrustFeatures
  const cmsPlans = await getPricingPlansByService("dedicated-server")
  // Region-less dashboard plans are the India tiers; the USA tab keeps the built-in USA plans
  // (the same USA products the WordPress site sells) until USA plans are added to the CMS.
  const cmsIndia = cmsPlans.filter((plan) => plan.region !== "usa")
  const cmsUsa = cmsPlans.filter((plan) => plan.region === "usa")
  const indiaPlans = cmsIndia.length ? cmsIndia : dedicatedPlans
  const usaPlans = cmsUsa.length ? cmsUsa : dedicatedPlansUSA
  const withService = (plans: typeof dedicatedPlans) =>
    plans.map((plan) => ({ ...plan, service: managed ? "managed-dedicated-server" : "dedicated-server" }))

  return (
    <>
      <ProductJsonLd name={title} description={description} path={`/dedicated-hosting/${slug}`} plans={[...indiaPlans, ...usaPlans]} />

      <HeroSection
        eyebrow={eyebrow}
        title={title}
        description={description}
        bullets={bullets}
        primaryCta={copy?.primaryCta ?? { label: "View pricing", href: "#pricing" }}
        secondaryCta={copy?.secondaryCta ?? { label: "Talk to an expert", href: LEAD_CTA_HREF }}
        stats={
          copy?.heroStats?.length
            ? copy.heroStats.map(({ label, value }) => ({ label, value }))
            : [
                { label: "Provisioning", value: managed ? "< 48 hrs" : "< 24 hrs" },
                { label: "Support", value: "24/7" },
                { label: "Dedicated IPs", value: "5" },
              ]
        }
        media={<HeroVisual variant="server" />}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: eyebrow }]}
      />

      <AnswerSection path={`/dedicated-hosting/${slug}`} kind="server" label={eyebrow} />

      <FeaturesSection
        eyebrow={copy?.featuresEyebrow || (managed ? "Fully managed" : "Full control")}
        title={copy?.featuresTitle || (managed ? "What our team handles for you" : "What you get with full root access")}
        columns={3}
        background="alt"
        features={features}
      />

      <div id="pricing">
        <PricingSection
          eyebrow={copy?.pricingEyebrow || "Pricing"}
          title={copy?.pricingTitle || "Dedicated server tiers"}
          description={copy?.pricingDescription || "Choose the data-center region closest to your users."}
          tabs={[
            { value: "india", label: "India", plans: withService(indiaPlans) },
            { value: "usa", label: "USA", plans: withService(usaPlans) },
          ]}
        />
      </div>

      <TestimonialsSection title="Don't just take it from us" description="See what our customers say about us." testimonials={testimonials} />

      <FAQSection eyebrow={copy?.faqEyebrow || "FAQs"} title={copy?.faqTitle || `${eyebrow} questions, answered`} items={faqs} />

      <CTASection
        title={copy?.ctaTitle || "Ready to move to dedicated hardware?"}
        description={copy?.ctaDescription || "Our team will help you pick the right tier for your workload."}
        primaryCta={copy?.ctaPrimary ?? { label: "Talk to sales", href: LEAD_CTA_HREF }}
        secondaryCta={copy?.ctaSecondary}
        background="navy"
      />
    </>
  )
}

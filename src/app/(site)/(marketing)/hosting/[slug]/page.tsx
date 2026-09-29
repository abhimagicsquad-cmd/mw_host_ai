import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { AnswerSection } from "@/components/sections/answer-section"
import { CTASection } from "@/components/sections/cta-section"
import { FAQSection } from "@/components/sections/faq-section"
import { ProductJsonLd } from "@/components/common/json-ld"
import { FeaturesSection } from "@/components/sections/features-section"
import { HeroSection } from "@/components/sections/hero-section"
import { HeroVisual } from "@/components/sections/hero-visual"
import { PricingSection } from "@/components/sections/pricing-section"
import { getHostingPage, hostingPages } from "@/constants/hosting-pages-data"
import { sharedHostingPlans, usaSharedHostingPlans } from "@/constants/pricing-plans"
import { siteConfig } from "@/constants/site-config"
import { resolveIcon } from "@/lib/icon-map"
import { buildPageMetadata } from "@/lib/seo"
import { getAllServicePageSlugs, getPricingPlansByService, getServicePage } from "@/sanity/lib/queries"

type HostingSlugPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const cmsSlugs = await getAllServicePageSlugs("hosting")
  const slugs = new Set([...hostingPages.map((page) => page.slug), ...cmsSlugs])
  return [...slugs].map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: HostingSlugPageProps): Promise<Metadata> {
  const { slug } = await params
  const cms = await getServicePage("hosting", slug)
  const page = getHostingPage(slug)

  if (!cms && !page) return {}

  return buildPageMetadata({
    title: cms?.seo?.metaTitle ?? cms?.heroTitle ?? page?.title ?? "",
    description: cms?.seo?.metaDescription ?? cms?.heroDescription ?? page?.description ?? "",
    path: `/hosting/${slug}`,
  })
}

export default async function HostingSlugPage({ params }: HostingSlugPageProps) {
  const { slug } = await params
  const cms = await getServicePage("hosting", slug)
  const fallback = getHostingPage(slug)

  if (!cms && !fallback) notFound()

  const eyebrow = cms?.eyebrow ?? fallback!.eyebrow
  const title = cms?.heroTitle ?? fallback!.title
  const description = cms?.heroDescription ?? fallback!.description
  const bullets = cms?.bullets ?? fallback!.bullets
  const features = cms?.features?.map((f) => ({ title: f.title, description: f.description ?? "", icon: resolveIcon(f.icon) })) ?? fallback!.features
  const faqs = cms?.faqs ?? fallback!.faqs
  const copy = cms?.copy
  const cmsPlans = await getPricingPlansByService("shared-hosting")
  const indiaPlans = cmsPlans.filter((plan) => plan.region !== "usa")
  const usaPlans = cmsPlans.filter((plan) => plan.region === "usa")
  const plans =
    slug === "usa-web-hosting" ? (usaPlans.length ? usaPlans : usaSharedHostingPlans) : indiaPlans.length ? indiaPlans : sharedHostingPlans

  return (
    <>
      <ProductJsonLd name={title} description={description} path={`/hosting/${slug}`} plans={plans} />

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
                { label: "Avg. load time", value: "0.7s" },
                { label: "Uptime SLA", value: "99.9%" },
                { label: "Support", value: "24/7" },
              ]
        }
        media={<HeroVisual variant="dashboard" />}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Hosting", href: "/hosting" }, { label: eyebrow }]}
      />

      <AnswerSection path={`/hosting/${slug}`} kind="hosting" label={eyebrow} />

      <FeaturesSection
        eyebrow={copy?.featuresEyebrow || "Why this hosting"}
        title={copy?.featuresTitle || `What makes ${eyebrow.toLowerCase()} different`}
        columns={3}
        background="alt"
        features={features}
      />

      <div id="pricing">
        <PricingSection
          eyebrow={copy?.pricingEyebrow || "Pricing"}
          title={copy?.pricingTitle || "Select your plan"}
          description={copy?.pricingDescription || "Every plan includes free SSL, cPanel, and JetBackup — no hidden setup fees."}
          plans={plans}
        />
      </div>

      <FAQSection eyebrow={copy?.faqEyebrow || "FAQs"} title={copy?.faqTitle || `${eyebrow} questions, answered`} items={faqs} />

      <CTASection
        title={copy?.ctaTitle || `Ready to move your site to ${siteConfig.name}?`}
        description={copy?.ctaDescription || "Free migration assistance included on every annual plan."}
        primaryCta={copy?.ctaPrimary ?? { label: "View plans", href: "#pricing" }}
        secondaryCta={copy?.ctaSecondary ?? { label: "Talk to sales", href: LEAD_CTA_HREF }}
        background="navy"
      />
    </>
  )
}

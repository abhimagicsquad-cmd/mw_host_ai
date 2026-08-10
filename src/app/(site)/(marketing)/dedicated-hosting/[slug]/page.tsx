import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { CTASection } from "@/components/sections/cta-section"
import { FAQSection } from "@/components/sections/faq-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { HeroSection } from "@/components/sections/hero-section"
import { PricingSection } from "@/components/sections/pricing-section"
import { dedicatedPages, dedicatedTrustFeatures, getDedicatedPage } from "@/constants/dedicated-pages-data"
import { dedicatedPlans } from "@/constants/pricing-plans"
import { buildMetadata } from "@/lib/seo"
import { getAllServicePageSlugs, getServicePage } from "@/sanity/lib/queries"

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

  return buildMetadata({
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

  return (
    <>
      <HeroSection
        eyebrow={eyebrow}
        title={title}
        description={description}
        bullets={bullets}
        primaryCta={{ label: "View pricing", href: "#pricing" }}
        secondaryCta={{ label: "Talk to an expert", href: LEAD_CTA_HREF }}
        stats={[
          { label: "Provisioning", value: managed ? "< 48 hrs" : "< 24 hrs" },
          { label: "Support", value: "24/7" },
          { label: "Dedicated IPs", value: "5" },
        ]}
      />

      <FeaturesSection
        eyebrow={managed ? "Fully managed" : "Full control"}
        title={managed ? "What our team handles for you" : "What you get with full root access"}
        columns={3}
        background="alt"
        features={dedicatedTrustFeatures}
      />

      <div id="pricing">
        <PricingSection
          eyebrow="Pricing"
          title="Dedicated server tiers"
          description="India data center pricing — ask our team about USA-based tiers."
          plans={dedicatedPlans.map((plan) => ({
            ...plan,
            service: managed ? "managed-dedicated-server" : "dedicated-server",
          }))}
        />
      </div>

      <FAQSection eyebrow="FAQs" title={`${eyebrow} questions, answered`} items={faqs} />

      <CTASection
        title="Ready to move to dedicated hardware?"
        description="Our team will help you pick the right tier for your workload."
        primaryCta={{ label: "Talk to sales", href: LEAD_CTA_HREF }}
        background="navy"
      />
    </>
  )
}

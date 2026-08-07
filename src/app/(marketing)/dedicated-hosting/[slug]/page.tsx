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

type DedicatedSlugPageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return dedicatedPages.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: DedicatedSlugPageProps): Promise<Metadata> {
  const { slug } = await params
  const page = getDedicatedPage(slug)

  if (!page) return {}

  return buildMetadata({
    title: page.title,
    description: page.description,
    path: `/dedicated-hosting/${page.slug}`,
  })
}

export default async function DedicatedSlugPage({ params }: DedicatedSlugPageProps) {
  const { slug } = await params
  const page = getDedicatedPage(slug)

  if (!page) notFound()

  return (
    <>
      <HeroSection
        eyebrow={page.eyebrow}
        title={page.title}
        description={page.description}
        bullets={page.bullets}
        primaryCta={{ label: "View pricing", href: "#pricing" }}
        secondaryCta={{ label: "Talk to an expert", href: LEAD_CTA_HREF }}
        stats={[
          { label: "Provisioning", value: page.managed ? "< 48 hrs" : "< 24 hrs" },
          { label: "Support", value: "24/7" },
          { label: "Dedicated IPs", value: "5" },
        ]}
      />

      <FeaturesSection
        eyebrow={page.managed ? "Fully managed" : "Full control"}
        title={page.managed ? "What our team handles for you" : "What you get with full root access"}
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
            service: page.managed ? "managed-dedicated-server" : "dedicated-server",
          }))}
        />
      </div>

      <FAQSection eyebrow="FAQs" title={`${page.eyebrow} questions, answered`} items={page.faqs} />

      <CTASection
        title="Ready to move to dedicated hardware?"
        description="Our team will help you pick the right tier for your workload."
        primaryCta={{ label: "Talk to sales", href: LEAD_CTA_HREF }}
        background="navy"
      />
    </>
  )
}

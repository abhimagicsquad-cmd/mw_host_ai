import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { CTASection } from "@/components/sections/cta-section"
import { FAQSection } from "@/components/sections/faq-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { HeroSection } from "@/components/sections/hero-section"
import { PricingSection } from "@/components/sections/pricing-section"
import { getHostingPage, hostingPages } from "@/constants/hosting-pages-data"
import { sharedHostingPlans } from "@/constants/pricing-plans"
import { siteConfig } from "@/constants/site-config"
import { buildMetadata } from "@/lib/seo"

type HostingSlugPageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return hostingPages.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: HostingSlugPageProps): Promise<Metadata> {
  const { slug } = await params
  const page = getHostingPage(slug)

  if (!page) return {}

  return buildMetadata({
    title: page.title,
    description: page.description,
    path: `/hosting/${page.slug}`,
  })
}

export default async function HostingSlugPage({ params }: HostingSlugPageProps) {
  const { slug } = await params
  const page = getHostingPage(slug)

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
      />

      <FeaturesSection
        eyebrow="Why this hosting"
        title={`What makes ${page.eyebrow.toLowerCase()} different`}
        columns={3}
        background="alt"
        features={page.features}
      />

      <div id="pricing">
        <PricingSection
          eyebrow="Pricing"
          title="Select your plan"
          description="Every plan includes free SSL, cPanel, and JetBackup — no hidden setup fees."
          plans={sharedHostingPlans}
        />
      </div>

      <FAQSection eyebrow="FAQs" title={`${page.eyebrow} questions, answered`} items={page.faqs} />

      <CTASection
        title={`Ready to move your site to ${siteConfig.name}?`}
        description="Free migration assistance included on every annual plan."
        primaryCta={{ label: "View plans", href: "#pricing" }}
        secondaryCta={{ label: "Talk to sales", href: LEAD_CTA_HREF }}
        background="navy"
      />
    </>
  )
}

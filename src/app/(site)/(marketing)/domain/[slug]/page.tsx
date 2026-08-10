import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { CTASection } from "@/components/sections/cta-section"
import { FAQSection } from "@/components/sections/faq-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { HeroSection } from "@/components/sections/hero-section"
import { TldPricingStrip } from "@/components/sections/tld-pricing-strip"
import { domainIncludedFeatures, domainPages, getDomainPage, tldPricing } from "@/constants/domain-pages-data"
import { buildMetadata } from "@/lib/seo"

type DomainSlugPageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return domainPages.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: DomainSlugPageProps): Promise<Metadata> {
  const { slug } = await params
  const page = getDomainPage(slug)

  if (!page) return {}

  return buildMetadata({
    title: page.title,
    description: page.description,
    path: `/domain/${page.slug}`,
  })
}

export default async function DomainSlugPage({ params }: DomainSlugPageProps) {
  const { slug } = await params
  const page = getDomainPage(slug)

  if (!page) notFound()

  return (
    <>
      <HeroSection
        eyebrow={page.eyebrow}
        title={page.title}
        description={page.description}
        bullets={page.bullets}
        primaryCta={{ label: "Get started", href: LEAD_CTA_HREF }}
        secondaryCta={{ label: "Talk to an expert", href: LEAD_CTA_HREF }}
      />

      <TldPricingStrip items={tldPricing} />

      <FeaturesSection
        eyebrow="Included"
        title="What you get with every domain"
        columns={3}
        features={domainIncludedFeatures}
      />

      <FAQSection eyebrow="FAQs" title={`${page.eyebrow} questions, answered`} items={page.faqs} />

      <CTASection
        title="Ready to get your domain sorted?"
        description="Our team can register, host, or transfer it for you today."
        primaryCta={{ label: "Get started", href: LEAD_CTA_HREF }}
        background="navy"
      />
    </>
  )
}

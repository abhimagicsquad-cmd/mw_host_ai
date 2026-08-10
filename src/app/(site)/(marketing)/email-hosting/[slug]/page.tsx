import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { CTASection } from "@/components/sections/cta-section"
import { FAQSection } from "@/components/sections/faq-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { HeroSection } from "@/components/sections/hero-section"
import { PricingCard } from "@/components/sections/pricing-card"
import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/layout/section-heading"
import { emailIncludedFeatures, emailPages, getEmailPage } from "@/constants/email-pages-data"
import { buildMetadata } from "@/lib/seo"

type EmailSlugPageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return emailPages.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: EmailSlugPageProps): Promise<Metadata> {
  const { slug } = await params
  const page = getEmailPage(slug)

  if (!page) return {}

  return buildMetadata({
    title: page.title,
    description: page.description,
    path: `/email-hosting/${page.slug}`,
  })
}

export default async function EmailSlugPage({ params }: EmailSlugPageProps) {
  const { slug } = await params
  const page = getEmailPage(slug)

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

      <SectionContainer width="narrow">
        <SectionHeading eyebrow="Pricing" title="Simple, per-mailbox pricing" />
        <div className="mx-auto mt-10 max-w-sm">
          <PricingCard plan={page.plan} />
        </div>
      </SectionContainer>

      <FeaturesSection eyebrow="Included" title="What every mailbox gets" columns={4} background="alt" features={emailIncludedFeatures} />

      <FAQSection eyebrow="FAQs" title={`${page.eyebrow} questions, answered`} items={page.faqs} />

      <CTASection
        title="Ready to set up professional email?"
        description="Tell us how many mailboxes you need and we'll get you set up."
        primaryCta={{ label: "Get started", href: LEAD_CTA_HREF }}
        background="navy"
      />
    </>
  )
}

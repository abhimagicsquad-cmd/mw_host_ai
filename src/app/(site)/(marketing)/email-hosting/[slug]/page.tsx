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
import { getAllServicePageSlugs, getServicePage } from "@/sanity/lib/queries"
import type { PricingPlan } from "@/types/content"

type EmailSlugPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const cmsSlugs = await getAllServicePageSlugs("email")
  const slugs = new Set([...emailPages.map((page) => page.slug), ...cmsSlugs])
  return [...slugs].map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: EmailSlugPageProps): Promise<Metadata> {
  const { slug } = await params
  const cms = await getServicePage("email", slug)
  const page = getEmailPage(slug)

  if (!cms && !page) return {}

  return buildMetadata({
    title: cms?.seo?.metaTitle ?? cms?.heroTitle ?? page?.title ?? "",
    description: cms?.seo?.metaDescription ?? cms?.heroDescription ?? page?.description ?? "",
    path: `/email-hosting/${slug}`,
  })
}

export default async function EmailSlugPage({ params }: EmailSlugPageProps) {
  const { slug } = await params
  const cms = await getServicePage("email", slug)
  const fallback = getEmailPage(slug)

  if (!cms && !fallback) notFound()

  const eyebrow = cms?.eyebrow ?? fallback!.eyebrow
  const title = cms?.heroTitle ?? fallback!.title
  const description = cms?.heroDescription ?? fallback!.description
  const bullets = cms?.bullets ?? fallback!.bullets
  const faqs = cms?.faqs ?? fallback!.faqs
  const plan: PricingPlan = cms?.plan
    ? { ...cms.plan, features: cms.plan.features ?? [], cta: cms.plan.cta ?? { label: "Get started", href: "#lead" } }
    : fallback!.plan

  return (
    <>
      <HeroSection
        eyebrow={eyebrow}
        title={title}
        description={description}
        bullets={bullets}
        primaryCta={{ label: "Get started", href: LEAD_CTA_HREF }}
        secondaryCta={{ label: "Talk to an expert", href: LEAD_CTA_HREF }}
      />

      <SectionContainer width="narrow">
        <SectionHeading eyebrow="Pricing" title="Simple, per-mailbox pricing" />
        <div className="mx-auto mt-10 max-w-sm">
          <PricingCard plan={plan} />
        </div>
      </SectionContainer>

      <FeaturesSection eyebrow="Included" title="What every mailbox gets" columns={4} background="alt" features={emailIncludedFeatures} />

      <FAQSection eyebrow="FAQs" title={`${eyebrow} questions, answered`} items={faqs} />

      <CTASection
        title="Ready to set up professional email?"
        description="Tell us how many mailboxes you need and we'll get you set up."
        primaryCta={{ label: "Get started", href: LEAD_CTA_HREF }}
        background="navy"
      />
    </>
  )
}

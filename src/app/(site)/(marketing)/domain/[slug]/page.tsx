import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { CTASection } from "@/components/sections/cta-section"
import { FAQSection } from "@/components/sections/faq-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { HeroSection } from "@/components/sections/hero-section"
import { HeroVisual } from "@/components/sections/hero-visual"
import { TldPricingStrip } from "@/components/sections/tld-pricing-strip"
import { domainIncludedFeatures, domainPages, getDomainPage, tldPricing } from "@/constants/domain-pages-data"
import { buildMetadata } from "@/lib/seo"
import { getAllServicePageSlugs, getServicePage } from "@/sanity/lib/queries"

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

  return buildMetadata({
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

  return (
    <>
      <HeroSection
        eyebrow={eyebrow}
        title={title}
        description={description}
        bullets={bullets}
        primaryCta={{ label: "Get started", href: LEAD_CTA_HREF }}
        secondaryCta={{ label: "Talk to an expert", href: LEAD_CTA_HREF }}
        stats={[
          { label: ".com from", value: "₹1,099" },
          { label: "Propagation", value: "< 24 hrs" },
          { label: "WHOIS privacy", value: "Free" },
        ]}
        media={<HeroVisual variant="domain" />}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Domains", href: "/domain" }, { label: eyebrow }]}
      />

      <TldPricingStrip items={tldPricing} />

      <FeaturesSection
        eyebrow="Included"
        title="What you get with every domain"
        columns={3}
        features={domainIncludedFeatures}
      />

      <FAQSection eyebrow="FAQs" title={`${eyebrow} questions, answered`} items={faqs} />

      <CTASection
        title="Ready to get your domain sorted?"
        description="Our team can register, host, or transfer it for you today."
        primaryCta={{ label: "Get started", href: LEAD_CTA_HREF }}
        background="navy"
      />
    </>
  )
}

import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { AnswerSection } from "@/components/sections/answer-section"
import { CTASection } from "@/components/sections/cta-section"
import { FAQSection } from "@/components/sections/faq-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { HeroSection } from "@/components/sections/hero-section"
import { HeroVisual } from "@/components/sections/hero-visual"
import { TldPricingStrip } from "@/components/sections/tld-pricing-strip"
import { domainIncludedFeatures, domainPages, getDomainPage, tldPricing } from "@/constants/domain-pages-data"
import { resolveIcon } from "@/lib/icon-map"
import { buildPageMetadata } from "@/lib/seo"
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

  return (
    <>
      <HeroSection
        eyebrow={eyebrow}
        title={title}
        description={description}
        bullets={bullets}
        primaryCta={copy?.primaryCta ?? { label: "Get started", href: LEAD_CTA_HREF }}
        secondaryCta={copy?.secondaryCta ?? { label: "Talk to an expert", href: LEAD_CTA_HREF }}
        stats={
          copy?.heroStats?.length
            ? copy.heroStats.map(({ label, value }) => ({ label, value }))
            : [
                { label: ".com from", value: "₹1,099" },
                { label: "Propagation", value: "< 24 hrs" },
                { label: "WHOIS privacy", value: "Free" },
              ]
        }
        media={<HeroVisual variant="domain" />}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Domains", href: "/domain" }, { label: eyebrow }]}
      />

      <AnswerSection path={`/domain/${slug}`} kind="domain" label={eyebrow} />

      <TldPricingStrip items={tldPricing} />

      <FeaturesSection
        eyebrow={copy?.featuresEyebrow || "Included"}
        title={copy?.featuresTitle || "What you get with every domain"}
        columns={3}
        features={features}
      />

      <FAQSection eyebrow={copy?.faqEyebrow || "FAQs"} title={copy?.faqTitle || `${eyebrow} questions, answered`} items={faqs} />

      <CTASection
        title={copy?.ctaTitle || "Ready to get your domain sorted?"}
        description={copy?.ctaDescription || "Our team can register, host, or transfer it for you today."}
        primaryCta={copy?.ctaPrimary ?? { label: "Get started", href: LEAD_CTA_HREF }}
        secondaryCta={copy?.ctaSecondary}
        background="navy"
      />
    </>
  )
}

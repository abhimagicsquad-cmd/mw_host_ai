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
import { resolveIcon } from "@/lib/icon-map"
import { buildMetadata } from "@/lib/seo"
import { getAllServicePageSlugs, getServicePage } from "@/sanity/lib/queries"

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

  return buildMetadata({
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

  return (
    <>
      <HeroSection
        eyebrow={eyebrow}
        title={title}
        description={description}
        bullets={bullets}
        primaryCta={{ label: "View pricing", href: "#pricing" }}
        secondaryCta={{ label: "Talk to an expert", href: LEAD_CTA_HREF }}
      />

      <FeaturesSection
        eyebrow="Why this hosting"
        title={`What makes ${eyebrow.toLowerCase()} different`}
        columns={3}
        background="alt"
        features={features}
      />

      <div id="pricing">
        <PricingSection
          eyebrow="Pricing"
          title="Select your plan"
          description="Every plan includes free SSL, cPanel, and JetBackup — no hidden setup fees."
          plans={sharedHostingPlans}
        />
      </div>

      <FAQSection eyebrow="FAQs" title={`${eyebrow} questions, answered`} items={faqs} />

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

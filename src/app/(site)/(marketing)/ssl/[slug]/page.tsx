import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { ProductJsonLd } from "@/components/common/json-ld"
import { CTASection } from "@/components/sections/cta-section"
import { FAQSection } from "@/components/sections/faq-section"
import { HeroSection } from "@/components/sections/hero-section"
import { HeroVisual } from "@/components/sections/hero-visual"
import { PricingCard } from "@/components/sections/pricing-card"
import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/layout/section-heading"
import { sslPlans } from "@/constants/pricing-plans"
import { getSslPage, sslPages } from "@/constants/ssl-pages-data"
import { buildMetadata } from "@/lib/seo"
import { getAllServicePageSlugs, getServicePage } from "@/sanity/lib/queries"
import type { PricingPlan } from "@/types/content"

type SslSlugPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const cmsSlugs = await getAllServicePageSlugs("ssl")
  const slugs = new Set([...sslPages.map((page) => page.slug), ...cmsSlugs])
  return [...slugs].map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: SslSlugPageProps): Promise<Metadata> {
  const { slug } = await params
  const cms = await getServicePage("ssl", slug)
  const page = getSslPage(slug)

  if (!cms && !page) return {}

  return buildMetadata({
    title: cms?.seo?.metaTitle ?? cms?.heroTitle ?? page?.title ?? "",
    description: cms?.seo?.metaDescription ?? cms?.heroDescription ?? page?.description ?? "",
    path: `/ssl/${slug}`,
  })
}

export default async function SslSlugPage({ params }: SslSlugPageProps) {
  const { slug } = await params
  const cms = await getServicePage("ssl", slug)
  const fallback = getSslPage(slug)

  // This template always needs a single resolvable plan — either from the CMS doc's own
  // `plan` field or the local fallback's `planSlug`. The SSL pillar's own CMS doc (slug
  // "ssl-certificates") intentionally has neither (it renders the full pricing grid
  // instead), so it must 404 here rather than fall through.
  if (!fallback && !cms?.plan) notFound()

  const eyebrow = cms?.eyebrow ?? fallback!.eyebrow
  const title = cms?.heroTitle ?? fallback!.title
  const description = cms?.heroDescription ?? fallback!.description
  const bullets = cms?.bullets ?? fallback!.bullets
  const faqs = cms?.faqs ?? fallback!.faqs
  const plan: PricingPlan = cms?.plan
    ? { ...cms.plan, features: cms.plan.features ?? [], cta: cms.plan.cta ?? { label: "Get started", href: "#lead" } }
    : (sslPlans.find((sslPlan) => sslPlan.slug === fallback!.planSlug) ?? sslPlans[0])

  return (
    <>
      <ProductJsonLd name={title} description={description} path={`/ssl/${slug}`} plans={[plan]} />

      <HeroSection
        eyebrow={eyebrow}
        title={title}
        description={description}
        bullets={bullets}
        primaryCta={{ label: "View pricing", href: "#pricing" }}
        secondaryCta={{ label: "Talk to an expert", href: LEAD_CTA_HREF }}
        stats={[
          { label: "Encryption", value: "256-bit" },
          { label: "Price", value: `${plan.price}${plan.priceSuffix ?? ""}` },
          { label: "Support", value: "24/7" },
        ]}
        media={<HeroVisual variant="security" />}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "SSL Certificates", href: "/ssl" }, { label: eyebrow }]}
      />

      <SectionContainer width="narrow" id="pricing">
        <SectionHeading eyebrow="Pricing" title={`${eyebrow} certificate`} />
        <div className="mx-auto mt-10 max-w-sm">
          <PricingCard plan={plan} />
        </div>
      </SectionContainer>

      <FAQSection eyebrow="FAQs" title={`${eyebrow} questions, answered`} items={faqs} />

      <CTASection
        title="Not sure this is the right certificate for you?"
        description="Tell us about your site and we'll recommend the right tier."
        primaryCta={{ label: "Ask us", href: LEAD_CTA_HREF }}
        secondaryCta={{ label: "Compare all certificates", href: "/ssl" }}
        background="navy"
      />
    </>
  )
}

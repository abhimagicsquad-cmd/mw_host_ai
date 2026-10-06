import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { ProductJsonLd } from "@/components/common/json-ld"
import { AnswerSection } from "@/components/sections/answer-section"
import { CTASection } from "@/components/sections/cta-section"
import { FAQSection } from "@/components/sections/faq-section"
import { TestimonialsSection } from "@/components/sections/testimonials-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { HeroSection } from "@/components/sections/hero-section"
import { HeroVisual } from "@/components/sections/hero-visual"
import { PricingCard } from "@/components/sections/pricing-card"
import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/layout/section-heading"
import { emailIncludedFeatures, emailPages, getEmailPage } from "@/constants/email-pages-data"
import { testimonials } from "@/constants/testimonials"
import { planPurchaseCta } from "@/lib/billing"
import { resolveIcon } from "@/lib/icon-map"
import { buildPageMetadata } from "@/lib/seo"
import { getAllServicePageSlugs, getServicePage } from "@/lib/cms/queries"
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

  return buildPageMetadata({
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
  const copy = cms?.copy
  const features = cms?.features?.length
    ? cms.features.map((f) => ({ title: f.title, description: f.description ?? "", icon: resolveIcon(f.icon) }))
    : emailIncludedFeatures
  const plan: PricingPlan = cms?.plan
    ? { ...cms.plan, features: cms.plan.features ?? [], cta: cms.plan.cta ?? { label: "Get started", href: "#lead" } }
    : fallback!.plan
  // As on WordPress, "Buy Now" goes straight to the plan's WHMCS cart.
  const buyCta = { ...planPurchaseCta(plan), label: "Buy Now" }
  const mailboxStorage = (fallback ?? emailPages.find((page) => page.plan.slug === plan.slug))?.mailboxStorage

  return (
    <>
      <ProductJsonLd name={eyebrow} slogan={title} description={description} path={`/email-hosting/${slug}`} plans={[plan]} />

      <HeroSection
        eyebrow={eyebrow}
        title={title}
        description={description}
        bullets={bullets}
        primaryCta={copy?.primaryCta ?? buyCta}
        secondaryCta={copy?.secondaryCta ?? { label: "Talk to an expert", href: LEAD_CTA_HREF }}
        stats={
          copy?.heroStats?.length
            ? copy.heroStats.map(({ label, value }) => ({ label, value }))
            : [
                { label: "Spam & malware filter", value: "Included" },
                { label: "Pricing", value: `${plan.price}${plan.priceSuffix ?? ""}` },
                { label: "Support", value: "24/7" },
              ]
        }
        media={<HeroVisual variant="mail" leadStatValue={mailboxStorage} />}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Email Hosting", href: "/email-hosting" }, { label: eyebrow }]}
      />

      <AnswerSection path={`/email-hosting/${slug}`} kind="email" label={eyebrow} />

      <SectionContainer width="narrow">
        <SectionHeading
          eyebrow={copy?.pricingEyebrow || "Pricing"}
          title={copy?.pricingTitle || "Simple, per-mailbox pricing"}
          description={copy?.pricingDescription || undefined}
        />
        <div className="mx-auto mt-10 max-w-sm">
          <PricingCard plan={plan} />
        </div>
      </SectionContainer>

      <FeaturesSection
        eyebrow={copy?.featuresEyebrow || "Included"}
        title={copy?.featuresTitle || "What every mailbox gets"}
        columns={4}
        background="alt"
        features={features}
      />

      <TestimonialsSection title="Don't just take it from us" description="See what our customers say about us." testimonials={testimonials} />

      <FAQSection eyebrow={copy?.faqEyebrow || "FAQs"} title={copy?.faqTitle || `${eyebrow} questions, answered`} items={faqs} />

      <CTASection
        title={copy?.ctaTitle || "Ready to set up professional email?"}
        description={copy?.ctaDescription || "Tell us how many mailboxes you need and we'll get you set up."}
        primaryCta={copy?.ctaPrimary ?? buyCta}
        secondaryCta={copy?.ctaSecondary}
        background="navy"
      />
    </>
  )
}

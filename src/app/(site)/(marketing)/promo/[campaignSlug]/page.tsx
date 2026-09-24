import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Check } from "lucide-react"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { BreadcrumbJsonLd } from "@/components/common/json-ld"
import { CountdownTimer } from "@/components/common/countdown-timer"
import { SectionContainer } from "@/components/layout/section-container"
import { Breadcrumbs } from "@/components/sections/breadcrumbs"
import { CTASection } from "@/components/sections/cta-section"
import { FAQSection } from "@/components/sections/faq-section"
import { PricingSection } from "@/components/sections/pricing-section"
import { getPromoPage, promoPages } from "@/constants/promo-pages-data"
import { promoSharedHostingPlans } from "@/constants/pricing-plans"
import { buildMetadata } from "@/lib/seo"

type PromoPageProps = {
  params: Promise<{ campaignSlug: string }>
}

export async function generateStaticParams() {
  return promoPages.map((page) => ({ campaignSlug: page.slug }))
}

export async function generateMetadata({ params }: PromoPageProps): Promise<Metadata> {
  const { campaignSlug } = await params
  const page = getPromoPage(campaignSlug)
  if (!page) return {}

  return buildMetadata({
    title: page.title,
    description: page.description,
    path: `/promo/${campaignSlug}`,
  })
}

export default async function PromoPage({ params }: PromoPageProps) {
  const { campaignSlug } = await params
  const page = getPromoPage(campaignSlug)

  if (!page) notFound()

  const breadcrumbs = [{ label: "Home", href: "/" }, { label: page.eyebrow }]

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />

      <SectionContainer background="navy" width="wide" padded={false} className="relative overflow-hidden py-16 sm:py-20">
        <div className="pointer-events-none absolute -top-1/2 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-brand-orange/15 blur-3xl" />
        <div className="bg-dot-pattern pointer-events-none absolute inset-0 opacity-15 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_30%,black,transparent)]" />

        <div className="relative flex flex-col items-center gap-6 text-center text-white">
          <Breadcrumbs items={breadcrumbs} tone="light" />

          <span className="rounded-full bg-brand-orange px-4 py-1.5 text-xs font-bold tracking-wide uppercase">{page.eyebrow}</span>
          <h1 className="max-w-2xl text-3xl font-bold sm:text-5xl">{page.title}</h1>
          <p className="max-w-xl text-white/70">{page.description}</p>

          <ul className="mt-2 grid gap-2.5 text-left sm:grid-cols-2">
            {page.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2 text-sm font-medium">
                <Check className="mt-0.5 size-4 shrink-0 text-brand-orange" />
                {bullet}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-col items-center gap-3">
            <p className="text-xs font-semibold tracking-wide text-white/60 uppercase">Offer ends in</p>
            <CountdownTimer targetDate={page.endsAt} />
          </div>
        </div>
      </SectionContainer>

      <div id="pricing">
        <PricingSection
          eyebrow="Pricing"
          title="Choose your discounted plan"
          description="Discount already applied — no promo code needed."
          plans={promoSharedHostingPlans}
        />
      </div>

      <FAQSection eyebrow="FAQs" title="Promo questions, answered" items={page.faqs} />

      <CTASection
        title="Questions before you check out?"
        description="Our team can help you pick the right tier for this offer."
        primaryCta={{ label: "Talk to us", href: LEAD_CTA_HREF }}
        background="alt"
      />
    </>
  )
}

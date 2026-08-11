import type { Metadata } from "next"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { CTASection } from "@/components/sections/cta-section"
import { FAQSection } from "@/components/sections/faq-section"
import { PageHero } from "@/components/sections/page-hero"
import { PlanComparisonTable } from "@/components/sections/plan-comparison-table"
import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/layout/section-heading"
import { comparisonRows } from "@/constants/compare-hosting-data"
import { sharedHostingPlans } from "@/constants/pricing-plans"
import { buildMetadata } from "@/lib/seo"
import { getComparisonPage, getPricingPlansByService } from "@/sanity/lib/queries"

const fallbackFaqs = [
  { question: "Which plan should I start with?", answer: "Most new sites do well on Starter or Basic Plus NVMe — Basic Plus is our most popular tier for a reason." },
  { question: "Can I upgrade later without downtime?", answer: "Yes, upgrades are instant and prorated directly from your control panel, with no site downtime." },
  { question: "What if my site outgrows shared hosting entirely?", answer: "We'll proactively recommend VPS or a dedicated server rather than let a shared account struggle under load." },
]

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getComparisonPage()
  if (!cms?.seo?.metaTitle) {
    return buildMetadata({
      title: "Compare Hosting Plans",
      description: "A side-by-side feature comparison of every MagicWorks Host NVMe shared hosting tier — storage, bandwidth, email, and more.",
      path: "/compare-hosting-plans",
    })
  }
  return buildMetadata({
    title: cms.seo.metaTitle,
    description: cms.seo.metaDescription ?? "",
    path: "/compare-hosting-plans",
  })
}

export default async function CompareHostingPlansPage() {
  const cms = await getComparisonPage()

  const heroTitle = cms?.heroTitle ?? "Compare every hosting tier, side by side"
  const heroDescription = cms?.heroDescription ?? "The exact specs behind each plan, so you can pick with confidence instead of guessing."
  const rows = cms?.rows ?? comparisonRows
  const faqs = cms?.faqs ?? fallbackFaqs
  const cmsPlans = await getPricingPlansByService("shared-hosting")
  const plans = cmsPlans.length ? cmsPlans : sharedHostingPlans

  return (
    <>
      <PageHero
        title={heroTitle}
        description={heroDescription}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Compare Hosting Plans" }]}
      />

      <SectionContainer width="wide">
        <SectionHeading eyebrow="Comparison" title="Feature-by-feature breakdown" />
        <div className="mt-10">
          <PlanComparisonTable plans={plans} rows={rows} />
        </div>
      </SectionContainer>

      <FAQSection eyebrow="FAQs" title="Choosing a plan" items={faqs} />

      <CTASection
        title="Still not sure which plan fits?"
        description="Tell us about your site and traffic — we'll recommend a tier directly."
        primaryCta={{ label: "Get a recommendation", href: LEAD_CTA_HREF }}
        background="navy"
      />
    </>
  )
}

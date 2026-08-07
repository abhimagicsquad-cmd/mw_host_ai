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
import { siteConfig } from "@/constants/site-config"

export const metadata: Metadata = {
  title: `Compare Hosting Plans | ${siteConfig.name}`,
  description: "A side-by-side feature comparison of every MagicWorks Host NVMe shared hosting tier — storage, bandwidth, email, and more.",
}

export default function CompareHostingPlansPage() {
  return (
    <>
      <PageHero
        title="Compare every hosting tier, side by side"
        description="The exact specs behind each plan, so you can pick with confidence instead of guessing."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Compare Hosting Plans" }]}
      />

      <SectionContainer width="wide">
        <SectionHeading eyebrow="Comparison" title="Feature-by-feature breakdown" />
        <div className="mt-10">
          <PlanComparisonTable plans={sharedHostingPlans} rows={comparisonRows} />
        </div>
      </SectionContainer>

      <FAQSection
        eyebrow="FAQs"
        title="Choosing a plan"
        items={[
          { question: "Which plan should I start with?", answer: "Most new sites do well on Starter or Basic Plus NVMe — Basic Plus is our most popular tier for a reason." },
          { question: "Can I upgrade later without downtime?", answer: "Yes, upgrades are instant and prorated directly from your control panel, with no site downtime." },
          { question: "What if my site outgrows shared hosting entirely?", answer: "We'll proactively recommend VPS or a dedicated server rather than let a shared account struggle under load." },
        ]}
      />

      <CTASection
        title="Still not sure which plan fits?"
        description="Tell us about your site and traffic — we'll recommend a tier directly."
        primaryCta={{ label: "Get a recommendation", href: LEAD_CTA_HREF }}
        background="navy"
      />
    </>
  )
}

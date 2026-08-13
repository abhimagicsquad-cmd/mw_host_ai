import type { Metadata } from "next"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { SectionContainer } from "@/components/layout/section-container"
import { CTASection } from "@/components/sections/cta-section"
import { PageHero } from "@/components/sections/page-hero"
import { BandwidthCalculator } from "@/components/tools/bandwidth-calculator"
import { buildMetadata } from "@/lib/seo"

export const metadata: Metadata = buildMetadata({
  title: "Bandwidth Calculator",
  description: "Estimate the monthly bandwidth your website needs based on page size, visitors, and pages per visit.",
  path: "/tools/bandwidth-calculator",
})

export default function BandwidthCalculatorPage() {
  return (
    <>
      <PageHero
        title="Bandwidth Calculator"
        description="Estimate how much monthly bandwidth your website actually needs before choosing a hosting plan."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Tools", href: "/tools/bandwidth-calculator" }, { label: "Bandwidth Calculator" }]}
      />

      <SectionContainer width="narrow">
        <BandwidthCalculator />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Formula: average page size × average monthly visitors × average pages per visit.
        </p>
      </SectionContainer>

      <CTASection
        title="Not sure which plan covers this much bandwidth?"
        description="Tell us your estimate and we'll recommend the right tier."
        primaryCta={{ label: "Talk to us", href: LEAD_CTA_HREF }}
        secondaryCta={{ label: "View hosting plans", href: "/hosting" }}
        background="navy"
      />
    </>
  )
}

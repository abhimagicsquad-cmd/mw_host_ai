import type { Metadata } from "next"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { SectionContainer } from "@/components/layout/section-container"
import { CTASection } from "@/components/sections/cta-section"
import { PageHero } from "@/components/sections/page-hero"
import { DataUnitCalculator } from "@/components/tools/data-unit-calculator"
import { buildMetadata } from "@/lib/seo"

export const metadata: Metadata = buildMetadata({
  title: "Data Unit Calculator",
  description: "Convert between Bytes, KB, MB, GB, and TB instantly.",
  path: "/tools/data-unit-calculator",
})

export default function DataUnitCalculatorPage() {
  return (
    <>
      <PageHero
        title="Data Unit Calculator"
        description="Convert storage or transfer sizes between Bytes, KB, MB, GB, and TB."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Tools", href: "/tools/bandwidth-calculator" }, { label: "Data Unit Calculator" }]}
      />

      <SectionContainer width="narrow">
        <DataUnitCalculator />
      </SectionContainer>

      <CTASection
        title="Sizing storage for your next hosting plan?"
        description="Every plan lists exact NVMe storage and bandwidth — compare them side by side."
        primaryCta={{ label: "Talk to us", href: LEAD_CTA_HREF }}
        secondaryCta={{ label: "Compare hosting plans", href: "/compare-hosting-plans" }}
        background="navy"
      />
    </>
  )
}

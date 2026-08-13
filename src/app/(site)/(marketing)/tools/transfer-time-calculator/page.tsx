import type { Metadata } from "next"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { SectionContainer } from "@/components/layout/section-container"
import { CTASection } from "@/components/sections/cta-section"
import { PageHero } from "@/components/sections/page-hero"
import { TransferTimeCalculator } from "@/components/tools/transfer-time-calculator"
import { buildMetadata } from "@/lib/seo"

export const metadata: Metadata = buildMetadata({
  title: "Download/Upload Time Calculator",
  description: "Estimate how long a file transfer will take at a given internet speed.",
  path: "/tools/transfer-time-calculator",
})

export default function TransferTimeCalculatorPage() {
  return (
    <>
      <PageHero
        title="Download/Upload Time Calculator"
        description="Estimate how long a file will take to transfer at a given connection speed."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Tools", href: "/tools/bandwidth-calculator" }, { label: "Transfer Time Calculator" }]}
      />

      <SectionContainer width="narrow">
        <TransferTimeCalculator />
      </SectionContainer>

      <CTASection
        title="Need faster transfer speeds for large files?"
        description="Our NVMe-backed plans and VPS tiers are built for consistent throughput."
        primaryCta={{ label: "Talk to us", href: LEAD_CTA_HREF }}
        secondaryCta={{ label: "View VPS plans", href: "/vps-hosting" }}
        background="navy"
      />
    </>
  )
}

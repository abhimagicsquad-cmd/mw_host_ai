import type { Metadata } from "next"

import { SectionContainer } from "@/components/layout/section-container"
import { FeaturesSection } from "@/components/sections/features-section"
import { PageHero } from "@/components/sections/page-hero"
import { DomainSearchWidget } from "@/components/tools/domain-search-widget"
import { domainIncludedFeatures } from "@/constants/domain-pages-data"
import { buildMetadata } from "@/lib/seo"

export const metadata: Metadata = buildMetadata({
  title: "Domain Search",
  description: "Check domain name availability across popular TLDs and see suggested alternatives instantly.",
  path: "/domain/search",
})

export default function DomainSearchPage() {
  return (
    <>
      <PageHero
        title="Find your domain"
        description="Type a name and check availability across .com, .in, .co.in, and .org — with instant alternatives if it's taken."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Domains", href: "/domain" }, { label: "Search" }]}
      />

      <SectionContainer width="narrow">
        <DomainSearchWidget />
      </SectionContainer>

      <FeaturesSection
        eyebrow="Included with every domain"
        title="What you get, no matter which TLD"
        columns={3}
        background="alt"
        features={domainIncludedFeatures}
      />
    </>
  )
}

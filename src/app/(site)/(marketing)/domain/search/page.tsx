import { SectionContainer } from "@/components/layout/section-container"
import { FeaturesSection } from "@/components/sections/features-section"
import { PageHero } from "@/components/sections/page-hero"
import { PricingSection } from "@/components/sections/pricing-section"
import { DomainSearchWidget } from "@/components/tools/domain-search-widget"
import { domainIncludedFeatures } from "@/constants/domain-pages-data"
import { sharedHostingPlans } from "@/constants/pricing-plans"
import { getPricingPlansByService } from "@/lib/cms/queries"
import { buildPageMetadata } from "@/lib/seo"

export const generateMetadata = () => buildPageMetadata({
  title: "Domain Search",
  description: "Check domain name availability across popular TLDs and see suggested alternatives instantly.",
  path: "/domain/search",
})

export default async function DomainSearchPage() {
  const cmsPlans = await getPricingPlansByService("shared-hosting", "india")
  const plans = cmsPlans.length ? cmsPlans : sharedHostingPlans

  return (
    <>
      <PageHero
        title="Find your domain"
        description="Type a name and check availability across .com, .in, .co.in, and .org — with instant alternatives if it's taken."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Domains", href: "/domain" }, { label: "Search" }]}
      />

      <SectionContainer width="narrow" id="domain-search" className="scroll-mt-24">
        <DomainSearchWidget />
      </SectionContainer>

      <FeaturesSection
        eyebrow="Included with every domain"
        title="What you get, no matter which TLD"
        columns={3}
        background="alt"
        features={domainIncludedFeatures}
      />

      {/* WordPress's search landing page follows the search with the hosting plans ("Boost your domain"). */}
      <div id="pricing">
        <PricingSection
          eyebrow="Boost your domain"
          title="Put your new domain to work"
          description="Pair it with fast NVMe hosting — free SSL, cPanel and JetBackup on every plan."
          plans={plans}
        />
      </div>
    </>
  )
}

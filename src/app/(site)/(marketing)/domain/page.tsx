import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { CTASection } from "@/components/sections/cta-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { PageHero } from "@/components/sections/page-hero"
import { ServiceGrid } from "@/components/sections/service-grid"
import { TldPricingStrip } from "@/components/sections/tld-pricing-strip"
import { domainHubIntro, domainIncludedFeatures, domainPageIcons, domainPages, tldPricing } from "@/constants/domain-pages-data"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Domain Names",
  description: "Register, host, or transfer your domain — .com, .in, .co.in, and .org, backed by registrar lock and auto-renewal.",
  path: "/domain",
})

export default function DomainHubPage() {
  return (
    <>
      <PageHero
        title="Your domain, handled properly"
        description="Register, host, or transfer a domain — all from the same account as your hosting."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Domain" }]}
      />

      <TldPricingStrip items={tldPricing} />

      <ServiceGrid
        eyebrow="Domain services"
        title={domainHubIntro.title}
        description={domainHubIntro.description}
        services={domainPages.map((page) => ({
          slug: page.slug,
          title: page.eyebrow,
          description: page.description,
          icon: domainPageIcons[page.slug],
          href: `/domain/${page.slug}`,
        }))}
      />

      <FeaturesSection
        eyebrow="Included with every domain"
        title="What you get, no matter which TLD"
        columns={3}
        background="alt"
        features={domainIncludedFeatures}
      />

      <CTASection
        title="Not sure which domain extension to pick?"
        description="Tell us about your business and we'll recommend the right TLD."
        primaryCta={{ label: "Ask us", href: LEAD_CTA_HREF }}
        background="navy"
      />
    </>
  )
}

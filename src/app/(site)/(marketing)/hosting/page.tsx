import type { Metadata } from "next"

import { GetQuoteForm } from "@/components/forms/get-quote-form"
import { CTASection } from "@/components/sections/cta-section"
import { PageHero } from "@/components/sections/page-hero"
import { PricingSection } from "@/components/sections/pricing-section"
import { ServiceGrid } from "@/components/sections/service-grid"
import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/layout/section-heading"
import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { PageBuilder } from "@/components/sanity/page-builder"
import { hostingHubIntro, hostingPageIcons, hostingPages } from "@/constants/hosting-pages-data"
import { sharedHostingPlans } from "@/constants/pricing-plans"
import { buildMetadata } from "@/lib/seo"
import { getServicesPage } from "@/sanity/lib/queries"

const HUB_SLUG = "hosting"

const fallbackMetadata = {
  title: "Web Hosting",
  description: "NVMe-powered shared hosting plans for every kind of website — general web hosting, SEO, WordPress, Linux, and unlimited tiers.",
}

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getServicesPage(HUB_SLUG)
  return buildMetadata({
    title: cms?.seo?.metaTitle ?? fallbackMetadata.title,
    description: cms?.seo?.metaDescription ?? fallbackMetadata.description,
    path: "/hosting",
  })
}

export default async function HostingHubPage() {
  const cms = await getServicesPage(HUB_SLUG)

  if (cms?.pageBuilder?.length) {
    return <PageBuilder blocks={cms.pageBuilder} />
  }

  return (
    <>
      <PageHero
        title="Web hosting plans for every kind of site"
        description="Same NVMe infrastructure underneath — pick the page that matches what you're building."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Hosting" }]}
      />

      <ServiceGrid
        eyebrow="Choose your hosting"
        title={hostingHubIntro.title}
        description={hostingHubIntro.description}
        services={hostingPages.map((page) => ({
          slug: page.slug,
          title: page.eyebrow,
          description: page.description,
          icon: hostingPageIcons[page.slug],
          href: `/hosting/${page.slug}`,
        }))}
      />

      <div id="pricing">
        <PricingSection
          eyebrow="Pricing"
          title="One pricing grid, every hosting page"
          description="Every hosting plan below includes free SSL, cPanel, and JetBackup."
          plans={sharedHostingPlans}
        />
      </div>

      <SectionContainer width="narrow" background="alt">
        <SectionHeading
          eyebrow="Custom requirements"
          title="Need something beyond the standard tiers?"
          description="Tell us about your project and we'll put together a tailored recommendation."
        />
        <div className="mx-auto mt-10 max-w-xl">
          <GetQuoteForm source="hosting-hub:quote" defaultService="shared-hosting" />
        </div>
      </SectionContainer>

      <CTASection
        title="Not sure which hosting page fits your project?"
        description="Tell us what you're building — we'll point you at the right plan directly."
        primaryCta={{ label: "Get a recommendation", href: LEAD_CTA_HREF }}
        background="navy"
      />
    </>
  )
}

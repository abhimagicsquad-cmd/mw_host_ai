import type { Metadata } from "next"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { CTASection } from "@/components/sections/cta-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { PageHero } from "@/components/sections/page-hero"
import { ServiceGrid } from "@/components/sections/service-grid"
import { PageBuilder } from "@/components/sanity/page-builder"
import { emailHubIntro, emailIncludedFeatures, emailPages } from "@/constants/email-pages-data"
import { buildMetadata } from "@/lib/seo"
import { getServicesPage } from "@/sanity/lib/queries"

const HUB_SLUG = "email-hosting"

const fallbackMetadata = {
  title: "Email Hosting",
  description: "Professional business email hosting on your own domain — Business and Enterprise tiers, billed per mailbox.",
}

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getServicesPage(HUB_SLUG)
  return buildMetadata({
    title: cms?.seo?.metaTitle ?? fallbackMetadata.title,
    description: cms?.seo?.metaDescription ?? fallbackMetadata.description,
    path: "/email-hosting",
  })
}

export default async function EmailHostingHubPage() {
  const cms = await getServicesPage(HUB_SLUG)

  if (cms?.pageBuilder?.length) {
    return <PageBuilder blocks={cms.pageBuilder} />
  }

  return (
    <>
      <PageHero
        title="Email that matches your domain, not a free-mail address"
        description="Business-grade email hosting, billed simply per mailbox."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Email Hosting" }]}
      />

      <ServiceGrid
        eyebrow="Plans"
        title={emailHubIntro.title}
        description={emailHubIntro.description}
        services={emailPages.map((page) => ({
          slug: page.slug,
          title: page.eyebrow,
          description: page.description,
          href: `/email-hosting/${page.slug}`,
          price: page.plan.price,
          priceSuffix: page.plan.priceSuffix,
          featured: page.plan.featured,
        }))}
      />

      <FeaturesSection
        eyebrow="Included"
        title="What every mailbox gets"
        columns={4}
        background="alt"
        features={emailIncludedFeatures}
      />

      <CTASection
        title="Not sure which email tier fits your team?"
        description="Tell us how many mailboxes you need — we'll recommend a plan."
        primaryCta={{ label: "Ask us", href: LEAD_CTA_HREF }}
        background="navy"
      />
    </>
  )
}

import { Eye, Gauge, HeadphonesIcon, HeartHandshake, ShieldCheck, Target, Users, Zap } from "lucide-react"

import { CTASection } from "@/components/sections/cta-section"
import { ContentSection } from "@/components/sections/content-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { PageHero } from "@/components/sections/page-hero"
import { StatsSection } from "@/components/sections/stats-section"
import { WhyChooseUs } from "@/components/sections/why-choose-us"
import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { PageBuilder } from "@/components/sanity/page-builder"
import { buildMetadata } from "@/lib/seo"
import { getAboutPage } from "@/sanity/lib/queries"

export async function generateMetadata() {
  const cms = await getAboutPage()
  return buildMetadata({
    title: cms?.seo?.metaTitle ?? "About Us",
    description:
      cms?.seo?.metaDescription ??
      "MagicWorks Host is a division of MagicWorks IT Solutions, hosting businesses across India since 2012 with NVMe-powered infrastructure and 24/7 support.",
    path: "/about-us",
  })
}

export default async function AboutUsPage() {
  const cms = await getAboutPage()

  if (cms?.pageBuilder?.length) {
    return <PageBuilder blocks={cms.pageBuilder} />
  }

  return (
    <>
      <PageHero
        title="Hosting infrastructure built by people who actually use it"
        description="MagicWorks Host is a division of MagicWorks IT Solutions — we've been keeping Indian businesses online since 2012, one NVMe server at a time."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About Us" }]}
      />

      <ContentSection eyebrow="Our story" title="From a small Pune office to 12,000+ hosted businesses">
        <p>
          MagicWorks Host started inside MagicWorks IT Solutions with a simple observation: most hosting providers
          made customers choose between speed, support, and price. We didn&apos;t think that trade-off should exist.
        </p>
        <p>
          Since 2012, we&apos;ve grown from a handful of shared-hosting customers in Bavdhan, Pune, to a full hosting
          stack — shared, VPS, dedicated servers, domains, SSL, and business email — all built on NVMe storage and
          backed by a support team that answers the phone.
        </p>
        <p>
          We&apos;re still a focused, independent team. That means decisions about infrastructure and support don&apos;t
          go through layers of a call center script — they go through people who know what a slow TTFB actually
          costs a small business.
        </p>
      </ContentSection>

      <FeaturesSection
        eyebrow="What drives us"
        title="Mission and vision"
        columns={2}
        background="alt"
        features={[
          {
            title: "Our mission",
            description:
              "Make enterprise-grade hosting infrastructure — NVMe storage, real support, transparent pricing — accessible to every business in India, not just the ones with enterprise budgets.",
            icon: Target,
          },
          {
            title: "Our vision",
            description:
              "To be the hosting provider Indian businesses recommend to each other, because the service held up when it mattered, not because of a discount code.",
            icon: Eye,
          },
        ]}
      />

      <WhyChooseUs
        eyebrow="How we work"
        title="Our approach to hosting"
        description="Four principles that shape every infrastructure and support decision we make."
        background="none"
        reasons={[
          {
            title: "Performance-first",
            description: "NVMe storage is standard on every plan, not an add-on you pay extra to unlock.",
            icon: Zap,
          },
          {
            title: "Real hosting expertise",
            description: "Our support team runs cPanel, WHM, and Linux servers daily — not a script-reading queue.",
            icon: Gauge,
          },
          {
            title: "Customer-focused support",
            description: "24/7 phone and ticket support, with a 30-day money-back guarantee on every plan.",
            icon: HeartHandshake,
          },
          {
            title: "Security by default",
            description: "Free SSL, daily JetBackup snapshots, and hardened server configurations out of the box.",
            icon: ShieldCheck,
          },
          {
            title: "Straightforward pricing",
            description: "The price you see is the price you pay — no surprise renewal hikes buried in fine print.",
            icon: Users,
          },
          {
            title: "Always reachable",
            description: "Sales and support run seven days a week, because websites don't only break on weekdays.",
            icon: HeadphonesIcon,
          },
        ]}
      />

      <StatsSection
        eyebrow="MagicWorks Host by the numbers"
        title="A decade of infrastructure, not a pitch deck"
        stats={[
          { label: "Years in operation", value: "13+" },
          { label: "Businesses hosted", value: "12,000+" },
          { label: "Uptime commitment", value: "99.9%" },
          { label: "Support availability", value: "24/7" },
        ]}
      />

      <CTASection
        title="Want to talk to the team before you switch?"
        description="Share a few details and we'll walk you through the right plan for your website — no pressure, no script."
        primaryCta={{ label: "Talk to us", href: LEAD_CTA_HREF }}
        secondaryCta={{ label: "View pricing", href: "/#pricing" }}
        background="navy"
      />
    </>
  )
}

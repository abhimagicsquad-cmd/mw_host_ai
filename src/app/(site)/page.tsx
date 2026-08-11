import type { Metadata } from "next"
import { HeadphonesIcon, Lock, Server, ShieldCheck, TrendingUp, Zap } from "lucide-react"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { OrganizationJsonLd } from "@/components/common/json-ld"
import { LeadCTAButton } from "@/components/common/lead-cta-button"
import { AboutCredibilitySection } from "@/components/sections/about-credibility-section"
import { BannerSection } from "@/components/sections/banner-section"
import { CTASection } from "@/components/sections/cta-section"
import { FAQSection } from "@/components/sections/faq-section"
import { HeroSection } from "@/components/sections/hero-section"
import { HeroVisual } from "@/components/sections/hero-visual"
import { PricingSection } from "@/components/sections/pricing-section"
import { ServiceGrid } from "@/components/sections/service-grid"
import { StatsSection } from "@/components/sections/stats-section"
import { TestimonialsSection } from "@/components/sections/testimonials-section"
import { TrustHighlights } from "@/components/sections/trust-highlights"
import { PageBuilder } from "@/components/sanity/page-builder"
import { sharedHostingPlans } from "@/constants/pricing-plans"
import { trustHighlights } from "@/constants/trust-highlights-data"
import { buildMetadata } from "@/lib/seo"
import { getHomePage, getPricingPlansByService } from "@/sanity/lib/queries"

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getHomePage()
  if (!cms?.seo?.metaTitle) return {}
  return buildMetadata({
    title: cms.seo.metaTitle,
    description: cms.seo.metaDescription ?? "",
    path: "/",
  })
}

export default async function HomePage() {
  const cms = await getHomePage()

  if (cms?.pageBuilder?.length) {
    return (
      <>
        <OrganizationJsonLd />
        <PageBuilder blocks={cms.pageBuilder} />
      </>
    )
  }

  const cmsPlans = await getPricingPlansByService("shared-hosting")
  const plans = cmsPlans.length ? cmsPlans : sharedHostingPlans

  return (
    <>
      <OrganizationJsonLd />

      <BannerSection
        message="Save up to 30% on annual NVMe hosting plans — limited time."
        cta={{ label: "View pricing", href: "#pricing" }}
        dismissible
      />

      <HeroSection
        eyebrow="NVMe Web Hosting"
        title={
          <>
            Hosting that performs{" "}
            <span className="text-gradient-brand">10X faster</span>
          </>
        }
        description="Most budget hosts sell you slow HDD storage, a support queue measured in days, and a renewal price that quietly triples. We built the opposite: NVMe storage on every plan, a real SLA, and a team that answers the phone."
        bullets={[
          "NVMe storage standard, not a paid upgrade",
          "24/7 support that picks up the phone",
          "Transparent renewal pricing, no bait-and-switch",
          "Free migration on every annual plan",
        ]}
        primaryCta={{ label: "Choose your plan", href: "#pricing" }}
        secondaryCta={{ label: "Talk to an expert", href: LEAD_CTA_HREF }}
        stats={[
          { label: "Uptime SLA", value: "99.9%" },
          { label: "Businesses hosted", value: "12,000+" },
          { label: "Avg. load time", value: "0.7s" },
        ]}
        media={<HeroVisual />}
      />

      <StatsSection
        eyebrow="Why speed matters"
        title="Slow sites lose visitors — fast ones win them"
        description="Switching to NVMe-backed infrastructure changes what happens the moment someone lands on your site."
        stats={[
          { label: "Faster page loads", value: "10X", icon: Zap },
          { label: "Potential traffic lift", value: "+1000%", icon: TrendingUp },
          { label: "Uptime guarantee", value: "99.9%", icon: ShieldCheck },
          { label: "Support availability", value: "24/7", icon: HeadphonesIcon },
        ]}
      />

      <div id="pricing">
        <PricingSection
          eyebrow="Pricing"
          title="Select your web hosting package"
          description="Every plan includes free SSL, cPanel, and JetBackup — no hidden setup fees."
          plans={plans}
        />
      </div>

      <TrustHighlights
        eyebrow="Why MagicWorks Host"
        title="Promises we back with an SLA, not just a landing page"
        description="Every claim below is something we'll put in writing — service credits, migration help, and backups included."
        background="alt"
        highlights={trustHighlights}
      />

      <ServiceGrid
        eyebrow="Services"
        title="Everything your website needs, under one roof"
        description="From domains to dedicated servers — one provider, one dashboard, no juggling vendors."
        services={[
          {
            slug: "vps",
            title: "VPS Hosting",
            description: "Dedicated resources with full root access, for sites that outgrow shared hosting.",
            icon: Server,
            href: "/vps-hosting",
            price: "₹4,372",
            priceSuffix: "/mo",
            featured: true,
          },
          {
            slug: "dedicated",
            title: "Dedicated Servers",
            description: "Bare-metal performance for high-traffic sites and demanding workloads.",
            icon: Server,
            href: "/dedicated-hosting/dedicated-server",
            price: "₹13,769",
            priceSuffix: "/mo",
          },
          {
            slug: "ssl",
            title: "SSL Certificates",
            description: "Secure your site, protect customer data, and boost search trust.",
            icon: Lock,
            href: "/ssl",
            price: "₹4,000",
            priceSuffix: "/yr",
          },
        ]}
        cta={
          <LeadCTAButton
            source="services"
            variant="outline"
            dialogTitle="Get a recommendation"
            dialogDescription="Tell us about your traffic and workload and we'll suggest the right tier."
          >
            Not sure which one you need? Ask us
          </LeadCTAButton>
        }
      />

      <AboutCredibilitySection
        eyebrow="About MagicWorks Host"
        title="A decade of infrastructure built to just work"
        description="MagicWorks Host is a division of MagicWorks IT Solutions, serving businesses across India since 2012 with hosting that's fast by default and supported by people who actually pick up the phone."
        bullets={[
          "Manage everything from a single cPanel dashboard",
          "24/7 phone and ticket support, every day of the year",
          "Free migration assistance when you switch to us",
        ]}
        cta={{ label: "Learn more about us", href: "/about-us" }}
        highlights={[
          { label: "Years in operation", value: "13+" },
          { label: "Businesses hosted", value: "12,000+" },
          { label: "Support availability", value: "24/7" },
          { label: "Uptime commitment", value: "99.9%" },
        ]}
      />

      <TestimonialsSection
        title="What our customers say"
        description="A few of the businesses running on MagicWorks Host infrastructure."
        testimonials={[
          {
            name: "Anita Sharma",
            title: "Founder",
            company: "Craftly Studio",
            quote: "Migration was seamless and our site has never been faster. Support responds within minutes, not days.",
            rating: 5,
          },
          {
            name: "Rohit Verma",
            title: "CTO",
            company: "Bharat Retail Co.",
            quote: "NVMe hosting cut our page load time in half. Couldn't be happier with the switch.",
            rating: 5,
          },
          {
            name: "Priya Nair",
            title: "Marketing Lead",
            company: "Nair & Co.",
            quote: "The cPanel setup is intuitive even for our non-technical team members. Zero learning curve.",
            rating: 4,
          },
        ]}
        cta={
          <LeadCTAButton source="testimonials" variant="outline">
            Join our happy customers
          </LeadCTAButton>
        }
      />

      <FAQSection
        title="Frequently asked questions"
        description="Everything you need to know before you switch."
        contactCta={false}
        items={[
          { question: "How fast can I get started?", answer: "Most accounts are provisioned within 5 minutes of payment confirmation — no waiting on manual setup." },
          { question: "Do you offer a money-back guarantee?", answer: "Yes — every plan includes a 30-day money-back guarantee, no questions asked." },
          { question: "Can I upgrade my plan later?", answer: "Absolutely. Upgrades are instant and prorated directly from your control panel." },
          { question: "Will you help me migrate my existing site?", answer: "Yes, our team handles the migration for you on every annual plan at no extra cost." },
        ]}
      />

      <CTASection
        title="Ready to move your website to MagicWorks Host?"
        description="Free migration assistance included on every annual plan."
        primaryCta={{ label: "View plans", href: "#pricing" }}
        secondaryCta={{ label: "Talk to sales", href: LEAD_CTA_HREF }}
        background="navy"
      />
    </>
  )
}

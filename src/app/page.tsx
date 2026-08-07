import {
  Database,
  Gauge,
  HeadphonesIcon,
  Lock,
  Mail,
  MousePointerClick,
  Rocket,
  Server,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
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
import { WhyChooseUs } from "@/components/sections/why-choose-us"
import { sharedHostingPlans } from "@/constants/pricing-plans"
import { siteConfig } from "@/constants/site-config"

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: `${siteConfig.url}/images/logo-magicworkshost-best-web-hosting-300.png`,
      telephone: siteConfig.contact.phone,
      email: siteConfig.contact.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: siteConfig.contact.address,
      },
    },
    {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  ],
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

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
        description="Your website deserves NVMe-powered infrastructure, not recycled excuses. Free SSL, one-click installs, and 24/7 support are included on every MagicWorks Host plan."
        bullets={[
          "10X faster page loads",
          "One-click WordPress & app installs",
          "Intuitive cPanel control panel",
          "PHP running up to 3x faster than Apache",
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
          plans={sharedHostingPlans}
        />
      </div>

      <WhyChooseUs
        eyebrow="Why MagicWorks Host"
        title="Everything you need to run your website, in one place"
        description="No plugins to babysit, no surprise fees — just the tools a growing website actually needs."
        reasons={[
          { title: "Easy to manage", description: "Full cPanel access with a clean, modern control panel UI.", icon: MousePointerClick },
          { title: "Unlimited email accounts", description: "Business-grade email included on every plan.", icon: Mail },
          { title: "150+ one-click scripts", description: "Softaculous installs for WordPress and more, in seconds.", icon: Rocket },
          { title: "NVMe on every plan", description: "The fastest storage tier available, not an upsell.", icon: Gauge },
          { title: "Unlimited MySQL databases", description: "Scale your apps and sites without extra fees.", icon: Database },
          { title: "24/7 expert support", description: "Real humans on the phone and on tickets, every day.", icon: HeadphonesIcon },
        ]}
        cta={
          <LeadCTAButton
            source="why-choose-us"
            variant="outline"
            dialogTitle="Not sure where to start?"
            dialogDescription="Tell us a bit about your site and we'll point you at the right plan."
          >
            Talk to an expert
          </LeadCTAButton>
        }
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

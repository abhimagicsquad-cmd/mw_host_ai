import type { Metadata } from "next"
import { Cpu, Gauge, HeadphonesIcon, Server, ShieldCheck, Zap } from "lucide-react"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { CTASection } from "@/components/sections/cta-section"
import { FAQSection } from "@/components/sections/faq-section"
import { HeroSection } from "@/components/sections/hero-section"
import { HeroVisual } from "@/components/sections/hero-visual"
import { PricingSection } from "@/components/sections/pricing-section"
import { StatsSection } from "@/components/sections/stats-section"
import { WhyChooseUs } from "@/components/sections/why-choose-us"
import { vpsPlans } from "@/constants/pricing-plans"
import { siteConfig } from "@/constants/site-config"

export const metadata: Metadata = {
  title: `VPS Hosting | ${siteConfig.name}`,
  description: "NVMe-backed VPS hosting with full root access — dedicated CPU and RAM without dedicated-server pricing.",
}

export default function VpsHostingPage() {
  return (
    <>
      <HeroSection
        eyebrow="VPS Hosting"
        title="Dedicated resources, without dedicated-server pricing"
        description="Full root access on NVMe-backed virtual servers — the step up for sites that have outgrown shared hosting but don't need bare metal yet."
        bullets={[
          "Guaranteed CPU and RAM — never shared",
          "Full root access, choice of OS",
          "NVMe storage on every tier",
          "Instant tier upgrades as you grow",
        ]}
        primaryCta={{ label: "View pricing", href: "#pricing" }}
        secondaryCta={{ label: "Talk to an expert", href: LEAD_CTA_HREF }}
        stats={[
          { label: "Provisioning", value: "< 1 hr" },
          { label: "Uptime SLA", value: "99.9%" },
          { label: "Support", value: "24/7" },
        ]}
        media={<HeroVisual />}
      />

      <StatsSection
        eyebrow="Why upgrade to VPS"
        title="When shared hosting starts to hold you back"
        stats={[
          { label: "Guaranteed resources", value: "100%", icon: Cpu },
          { label: "Root access", value: "Full", icon: Server },
          { label: "Faster storage", value: "NVMe", icon: Zap },
          { label: "Support", value: "24/7", icon: HeadphonesIcon },
        ]}
      />

      <div id="pricing">
        <PricingSection
          eyebrow="Pricing"
          title="VPS tiers"
          description="India data center pricing — ask our team about USA-based tiers."
          plans={vpsPlans}
        />
      </div>

      <WhyChooseUs
        eyebrow="What you get"
        title="Built for teams that need more control"
        background="alt"
        reasons={[
          { title: "Full root access", description: "Install anything, configure everything — it's your server.", icon: Server },
          { title: "Guaranteed resources", description: "CPU and RAM allocated to you, never shared with other tenants.", icon: Cpu },
          { title: "NVMe storage", description: "The fastest storage tier, standard on every VPS plan.", icon: Gauge },
          { title: "Hardened defaults", description: "Sensible security configuration out of the box.", icon: ShieldCheck },
          { title: "24/7 support", description: "Real infrastructure engineers, not a script-reading queue.", icon: HeadphonesIcon },
          { title: "Instant upgrades", description: "Move to a bigger tier without a migration project.", icon: Zap },
        ]}
      />

      <FAQSection
        eyebrow="FAQs"
        title="VPS hosting questions, answered"
        items={[
          { question: "How is VPS different from shared hosting?", answer: "VPS gives you guaranteed, dedicated CPU and RAM with full root access — shared hosting pools resources across many accounts." },
          { question: "Do I need to manage the server myself?", answer: "Yes, root access means you're responsible for server administration — ask about our managed add-on if you'd rather we handle it." },
          { question: "Can I upgrade my VPS tier later?", answer: "Yes, upgrades are handled with minimal downtime as your traffic grows." },
          { question: "What control panels are supported?", answer: "cPanel and Plesk are both available as optional add-ons." },
        ]}
      />

      <CTASection
        title="Ready to move up to VPS?"
        description="Our team will help you pick the right tier for your workload."
        primaryCta={{ label: "Talk to sales", href: LEAD_CTA_HREF }}
        background="navy"
      />
    </>
  )
}

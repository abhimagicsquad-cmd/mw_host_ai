import type { Metadata } from "next"
import { KeyRound, Lock, ScanSearch, ShieldCheck, ShoppingCart, TrendingUp } from "lucide-react"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { CTASection } from "@/components/sections/cta-section"
import { FAQSection } from "@/components/sections/faq-section"
import { HeroSection } from "@/components/sections/hero-section"
import { PricingSection } from "@/components/sections/pricing-section"
import { WhyChooseUs } from "@/components/sections/why-choose-us"
import { sslPlans } from "@/constants/pricing-plans"
import { resolveIcon } from "@/lib/icon-map"
import { buildMetadata } from "@/lib/seo"
import { getServicePage } from "@/sanity/lib/queries"
import type { FAQItem, Feature } from "@/types/content"

const SLUG = "ssl-certificates"

const defaultReasons: Feature[] = [
  { title: "Encrypts data in transit", description: "Passwords, payment details, and form submissions stay private.", icon: Lock },
  { title: "Builds customer trust", description: "The padlock icon is table stakes for visitors in 2026.", icon: ShieldCheck },
  { title: "Required for e-commerce", description: "Payment processors and card networks require HTTPS.", icon: ShoppingCart },
  { title: "A confirmed SEO signal", description: "HTTPS is a lightweight but confirmed Google ranking factor.", icon: TrendingUp },
  { title: "Verifies your identity", description: "Business and Extended Validation certs confirm who you are, not just your domain.", icon: ScanSearch },
  { title: "Simple to install", description: "Our team handles installation on any of our hosting plans.", icon: KeyRound },
]

const defaultFaqs: FAQItem[] = [
  { question: "What's the difference between the certificate tiers?", answer: "Domain Validated confirms you control the domain; Business and Extended Validated additionally verify your organization's legal identity, showing more trust signals to visitors." },
  { question: "How long does issuance take?", answer: "Domain Validated certificates issue within minutes; Business and Extended Validated can take 1-3 business days due to identity verification." },
  { question: "Does a Wildcard certificate cover subdomains?", answer: "Yes — one Wildcard certificate secures unlimited subdomains on a single root domain." },
  { question: "Will you install the certificate for me?", answer: "Yes, installation support is included free on any MagicWorks Host hosting plan." },
  { question: "Do I need SSL if I'm not selling anything online?", answer: "Yes — HTTPS is now expected by browsers and visitors regardless of whether you process payments, and it affects SEO." },
  { question: "What happens when my certificate expires?", answer: "We send renewal reminders well in advance, and renewal can be completed in a couple of clicks from your account." },
]

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getServicePage("ssl", SLUG)
  return buildMetadata({
    title: cms?.seo?.metaTitle ?? cms?.heroTitle ?? "SSL Certificates",
    description:
      cms?.seo?.metaDescription ??
      cms?.heroDescription ??
      "Domain Validated, Business Validated, Wildcard, and Extended Validated SSL certificates to secure your site and build customer trust.",
    path: "/ssl",
  })
}

export default async function SslPage() {
  const cms = await getServicePage("ssl", SLUG)

  const eyebrow = cms?.eyebrow ?? "SSL Certificates"
  const title = cms?.heroTitle ?? "HTTPS isn't optional anymore — make it easy"
  const description =
    cms?.heroDescription ??
    "From a quick Domain Validated cert to full Extended Validation for e-commerce, we'll help you pick the right level of trust for your site."
  const bullets = cms?.bullets ?? [
    "Issued in minutes to a few business days",
    "256-bit encryption on every certificate",
    "Browser padlock and HTTPS by default",
    "Free installation support",
  ]
  const reasons: Feature[] =
    cms?.features?.map((f) => ({ title: f.title, description: f.description ?? "", icon: resolveIcon(f.icon) })) ?? defaultReasons
  const faqs = cms?.faqs ?? defaultFaqs

  return (
    <>
      <HeroSection
        eyebrow={eyebrow}
        title={title}
        description={description}
        bullets={bullets}
        primaryCta={{ label: "View certificates", href: "#pricing" }}
        secondaryCta={{ label: "Talk to an expert", href: LEAD_CTA_HREF }}
      />

      <WhyChooseUs eyebrow="Why SSL matters" title="What an SSL certificate actually protects" background="alt" reasons={reasons} />

      <div id="pricing">
        <PricingSection
          eyebrow="Pricing"
          title="Choose your certificate"
          description="All tiers include 256-bit encryption — the difference is the level of identity verification."
          plans={sslPlans}
        />
      </div>

      <FAQSection eyebrow="FAQs" title="SSL questions, answered" items={faqs} />

      <CTASection
        title="Not sure which certificate you need?"
        description="Tell us about your site and we'll recommend the right tier."
        primaryCta={{ label: "Ask us", href: LEAD_CTA_HREF }}
        background="navy"
      />
    </>
  )
}

import type { Metadata } from "next"
import { KeyRound, Lock, ScanSearch, ShieldCheck, ShoppingCart, TrendingUp } from "lucide-react"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { ProductJsonLd } from "@/components/common/json-ld"
import { AnswerSection } from "@/components/sections/answer-section"
import { CTASection } from "@/components/sections/cta-section"
import { FAQSection } from "@/components/sections/faq-section"
import { TestimonialsSection } from "@/components/sections/testimonials-section"
import { HeroSection } from "@/components/sections/hero-section"
import { HeroVisual } from "@/components/sections/hero-visual"
import { PricingSection } from "@/components/sections/pricing-section"
import { ServiceGrid } from "@/components/sections/service-grid"
import { WhyChooseUs } from "@/components/sections/why-choose-us"
import { sslPlans } from "@/constants/pricing-plans"
import { sslPageIcons, sslPages } from "@/constants/ssl-pages-data"
import { testimonials } from "@/constants/testimonials"
import { resolveIcon } from "@/lib/icon-map"
import { buildPageMetadata, defaultSeoTitle } from "@/lib/seo"
import { getPricingPlansByService, getServicePage } from "@/lib/cms/queries"
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
  return buildPageMetadata({
    title: cms?.seo?.metaTitle ?? defaultSeoTitle("/ssl") ?? cms?.heroTitle ?? "SSL Certificates",
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
  const copy = cms?.copy
  const cmsPlans = await getPricingPlansByService("ssl")
  const plans = cmsPlans.length ? cmsPlans : sslPlans

  return (
    <>
      <ProductJsonLd name={eyebrow} slogan={title} description={description} path="/ssl" plans={plans} />

      <HeroSection
        eyebrow={eyebrow}
        title={title}
        description={description}
        bullets={bullets}
        primaryCta={copy?.primaryCta ?? { label: "View certificates", href: "#pricing" }}
        secondaryCta={copy?.secondaryCta ?? { label: "Talk to an expert", href: LEAD_CTA_HREF }}
        stats={
          copy?.heroStats?.length
            ? copy.heroStats.map(({ label, value }) => ({ label, value }))
            : [
                { label: "Encryption", value: "256-bit" },
                { label: "Issuance", value: "< 5 min" },
                { label: "SSL Labs grade", value: "A+" },
              ]
        }
        media={<HeroVisual variant="security" />}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: eyebrow }]}
      />

      <AnswerSection path="/ssl" kind="ssl" label={eyebrow} />

      <WhyChooseUs
        eyebrow={copy?.featuresEyebrow || "Why SSL matters"}
        title={copy?.featuresTitle || "What an SSL certificate actually protects"}
        background="alt"
        reasons={reasons}
      />

      <ServiceGrid
        eyebrow="Certificate types"
        title="Every certificate type, explained"
        description="Each tier has its own dedicated page covering exactly who it's for and how it's issued."
        services={sslPages.map((page) => ({
          slug: page.slug,
          title: page.eyebrow,
          description: page.description,
          icon: sslPageIcons[page.slug],
          href: `/ssl/${page.slug}`,
        }))}
      />

      <div id="pricing">
        <PricingSection
          eyebrow={copy?.pricingEyebrow || "Pricing"}
          title={copy?.pricingTitle || "Choose your certificate"}
          description={copy?.pricingDescription || "All tiers include 256-bit encryption — the difference is the level of identity verification."}
          plans={plans}
        />
      </div>

      <TestimonialsSection title="Don't just take it from us" description="See what our customers say about us." testimonials={testimonials} />

      <FAQSection eyebrow={copy?.faqEyebrow || "FAQs"} title={copy?.faqTitle || "SSL questions, answered"} items={faqs} />

      <CTASection
        title={copy?.ctaTitle || "Not sure which certificate you need?"}
        description={copy?.ctaDescription || "Tell us about your site and we'll recommend the right tier."}
        primaryCta={copy?.ctaPrimary ?? { label: "Ask us", href: LEAD_CTA_HREF }}
        secondaryCta={copy?.ctaSecondary}
        background="navy"
      />
    </>
  )
}

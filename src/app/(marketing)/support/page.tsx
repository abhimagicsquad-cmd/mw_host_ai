import { BookOpen, Phone, Ticket } from "lucide-react"

import { LeadForm } from "@/components/forms/lead-form"
import { CTASection } from "@/components/sections/cta-section"
import { FAQSection } from "@/components/sections/faq-section"
import { PageHero } from "@/components/sections/page-hero"
import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/layout/section-heading"
import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { siteConfig } from "@/constants/site-config"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Support",
  description: "Reach MagicWorks Host support by phone, ticket, or knowledge base — 24/7 support on every plan.",
  path: "/support",
})

const supportChannels = [
  {
    title: "Call us",
    description: `Speak directly with support, ${siteConfig.contact.hours.support}.`,
    icon: Phone,
    cta: { label: siteConfig.contact.phone, href: siteConfig.contact.phoneHref },
  },
  {
    title: "Open a ticket",
    description: "Track and manage support tickets from your client area.",
    icon: Ticket,
    cta: { label: "Client area login", href: "https://clients.magicworkshost.com/clientarea.php", external: true },
  },
  {
    title: "Browse the knowledge base",
    description: "Self-serve answers on billing, hosting, domains, and SSL.",
    icon: BookOpen,
    cta: { label: "Search articles", href: "/knowledge-base" },
  },
]

export default function SupportPage() {
  return (
    <>
      <PageHero
        title="We're here 24/7, not just during business hours"
        description="Pick whichever channel is fastest for you — phone, ticket, or self-serve."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Support" }]}
      />

      <SectionContainer width="wide">
        <div className="grid gap-6 sm:grid-cols-3">
          {supportChannels.map((channel) => (
            <div key={channel.title} className="flex flex-col gap-3 rounded-2xl border border-border-alt bg-background p-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange-accessible">
                <channel.icon className="size-5" />
              </span>
              <p className="font-heading text-base font-semibold text-brand-navy">{channel.title}</p>
              <p className="text-sm text-body-text">{channel.description}</p>
              <a
                href={channel.cta.href}
                target={channel.cta.external ? "_blank" : undefined}
                rel={channel.cta.external ? "noopener noreferrer" : undefined}
                className="mt-auto text-sm font-semibold text-brand-orange-accessible hover:underline"
              >
                {channel.cta.label}
              </a>
            </div>
          ))}
        </div>
      </SectionContainer>

      <SectionContainer width="narrow" background="alt">
        <SectionHeading eyebrow="Pre-sales questions" title="Not a customer yet? Ask us anything" />
        <div className="mx-auto mt-10 max-w-lg">
          <LeadForm source="support:pre-sales" submitLabel="Send question" />
        </div>
      </SectionContainer>

      <FAQSection
        eyebrow="FAQs"
        title="Support questions, answered"
        items={[
          { question: "Is support really available 24/7?", answer: "Yes — support tickets and the phone line are monitored around the clock, every day of the year." },
          { question: "How fast do you respond to tickets?", answer: "Most tickets receive a first response within a few hours; urgent live-site issues are prioritized." },
          { question: "Where do I check on my invoice or billing?", answer: "Log into your client area to view invoices, update payment methods, or check your renewal date." },
        ]}
      />

      <CTASection
        title="Still stuck?"
        description="Send us your details and we'll take it from there."
        primaryCta={{ label: "Talk to us", href: LEAD_CTA_HREF }}
        background="navy"
      />
    </>
  )
}

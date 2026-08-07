import type { Metadata } from "next"

import { LeadForm } from "@/components/forms/lead-form"
import { ContactSection } from "@/components/sections/contact-section"
import { CTASection } from "@/components/sections/cta-section"
import { FAQSection } from "@/components/sections/faq-section"
import { PageHero } from "@/components/sections/page-hero"
import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { siteConfig } from "@/constants/site-config"

export const metadata: Metadata = {
  title: `Contact Us | ${siteConfig.name}`,
  description:
    "Get in touch with MagicWorks Host — call, email, or send us your details and our team will respond within a few hours.",
}

export default function ContactUsPage() {
  return (
    <>
      <PageHero
        title="Let's talk about your website"
        description="Questions about a plan, a migration, or something urgent? Reach us directly or send your details below — we usually reply within a few hours."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact Us" }]}
      />

      <ContactSection
        eyebrow="Get in touch"
        title="Send us your details"
        description="Fill in the form and our team will get back to you — no bots, no call centre script."
      >
        <LeadForm source="contact-page" submitLabel="Send message" />
      </ContactSection>

      <FAQSection
        eyebrow="Before you reach out"
        title="Common questions"
        contactCta={false}
        items={[
          {
            question: "How quickly will I hear back?",
            answer: "Sales enquiries are answered within a few hours during business hours; support tickets are monitored 24/7.",
          },
          {
            question: "I need urgent help with a live site — what should I do?",
            answer: `Call us directly at ${siteConfig.contact.phone} — support is available around the clock for existing customers.`,
          },
          {
            question: "Can I get a quote before signing up?",
            answer: "Yes, mention your requirements in the message field and we'll follow up with a tailored recommendation.",
          },
        ]}
      />

      <CTASection
        title="Prefer to talk it through first?"
        description="Share your number and a good time to call — we'll ring you back, no obligation."
        primaryCta={{ label: "Request a callback", href: LEAD_CTA_HREF }}
        background="navy"
      />
    </>
  )
}

import { Inbox, Mail, Shield, Users } from "lucide-react"

import type { FAQItem, Feature, PricingPlan } from "@/types/content"

export type EmailPageData = {
  slug: string
  eyebrow: string
  title: string
  description: string
  bullets: string[]
  plan: PricingPlan
  faqs: FAQItem[]
}

export const emailHubIntro = {
  title: "Professional email on your own domain",
  description: "Business-grade email hosting, sized for a solo founder or a growing team.",
}

export const emailIncludedFeatures: Feature[] = [
  { title: "Your own domain", description: "you@yourbusiness.com instead of a generic free-mail address.", icon: Mail },
  { title: "Spam & malware filtering", description: "Enterprise-grade filtering on every mailbox.", icon: Shield },
  { title: "Webmail + client access", description: "Works with Outlook, Gmail, and any IMAP client.", icon: Inbox },
  { title: "Team-ready", description: "Add mailboxes as your team grows, billed per account.", icon: Users },
]

export const emailPages: EmailPageData[] = [
  {
    slug: "business",
    eyebrow: "Business Email Hosting",
    title: "Business email that looks the part",
    description: "OX Business Email on your own domain — reliable, spam-filtered, and simple to set up.",
    bullets: ["1 account with 5GB storage per mailbox", "Works with Outlook, Gmail, and IMAP clients", "Enterprise-grade spam and malware filtering", "Simple per-mailbox billing"],
    plan: {
      slug: "business-email",
      name: "Business Email",
      price: "₹45",
      priceSuffix: "/mailbox/mo",
      features: ["5GB storage per mailbox", "Webmail + IMAP/POP access", "Spam & malware filtering", "Your own domain"],
      cta: { label: "Get started", href: "/order/business-email" },
      service: "business-email",
    },
    faqs: [
      { question: "How much storage does each mailbox get?", answer: "5GB per mailbox on the Business Email plan." },
      { question: "Can I use this with Outlook or Gmail?", answer: "Yes, it supports standard IMAP/POP so it works with any major email client." },
      { question: "Can I add more mailboxes later?", answer: "Yes, add or remove mailboxes anytime — billing adjusts per mailbox." },
    ],
  },
  {
    slug: "enterprise",
    eyebrow: "Enterprise Email Hosting",
    title: "Enterprise email with room to collaborate",
    description: "More storage and built-in collaboration tools for teams that live in their inbox and shared calendars.",
    bullets: ["25GB mailbox + 5GB file storage", "Shared calendars and collaboration tools", "Enterprise-grade spam and malware filtering", "Priority support"],
    plan: {
      slug: "enterprise-email",
      name: "Enterprise Email",
      price: "₹99",
      priceSuffix: "/mailbox/mo",
      features: ["25GB mailbox storage", "5GB file storage", "Shared calendars & collaboration tools", "Priority support"],
      cta: { label: "Get started", href: "/order/enterprise-email" },
      service: "enterprise-email",
      featured: true,
    },
    faqs: [
      { question: "What collaboration tools are included?", answer: "Shared calendars, contacts, and file storage alongside your mailbox." },
      { question: "Is this suitable for a full team?", answer: "Yes — Enterprise Email is priced per mailbox, so it scales cleanly as your team grows." },
      { question: "Can I migrate from Google Workspace or Microsoft 365?", answer: "Yes, our team can assist with mailbox migration during setup." },
    ],
  },
]

export function getEmailPage(slug: string) {
  return emailPages.find((page) => page.slug === slug)
}

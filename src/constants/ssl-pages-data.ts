import type { LucideIcon } from "lucide-react"
import { Award, Globe2, ShieldCheck, ShoppingCart, Wifi } from "lucide-react"

import type { FAQItem } from "@/types/content"

export type SslPageData = {
  slug: string
  eyebrow: string
  title: string
  description: string
  bullets: string[]
  /** Key into src/constants/pricing-plans.ts's sslPlans — the real, differentiated pricing lives there once, not duplicated per sub-page. */
  planSlug: string
  faqs: FAQItem[]
}

export const sslPages: SslPageData[] = [
  {
    slug: "domain-validated",
    eyebrow: "Domain Validated (DV)",
    title: "Domain Validated SSL — issued in minutes",
    description: "Confirms you control the domain and encrypts every connection — the fastest, most affordable way to get the browser padlock.",
    bullets: ["Issued within minutes, no paperwork", "256-bit encryption on every connection", "Browser padlock and HTTPS by default", "Best fit for blogs, portfolios, and small business sites"],
    planSlug: "domain-validated",
    faqs: [
      { question: "What does Domain Validated actually verify?", answer: "Only that you control the domain — not your business identity. That's why it issues so quickly." },
      { question: "Is this enough for a small business site?", answer: "Yes — for most informational and small business sites, DV is the standard, sufficient choice." },
      { question: "Can I upgrade to a higher validation level later?", answer: "Yes, you can move up to Business or Extended Validated at renewal or anytime." },
    ],
  },
  {
    slug: "business-validated",
    eyebrow: "Business Validated (OV)",
    title: "Business Validated SSL — verified organization identity",
    description: "Confirms your organization is a real, registered legal entity — a stronger trust signal than domain validation alone.",
    bullets: ["Organization identity manually verified", "Higher customer trust signal than DV", "256-bit encryption on every connection", "1-3 business day issuance"],
    planSlug: "business-validated",
    faqs: [
      { question: "How is this different from Domain Validated?", answer: "Business Validated additionally confirms your organization's legal existence — DV only confirms domain control." },
      { question: "What documents are needed for verification?", answer: "Standard business registration details; our team will guide you through exactly what's required during issuance." },
      { question: "How long does verification take?", answer: "Typically 1-3 business days, depending on how quickly your registration details can be confirmed." },
    ],
  },
  {
    slug: "domain-validated-sni",
    eyebrow: "Domain Validated (SNI)",
    title: "Domain Validated SSL with SNI — no dedicated IP required",
    description: "The same Domain Validated certificate, delivered via SNI (Server Name Indication) instead of a dedicated IP — every modern browser supports it, so there's no reason to pay for an IP you don't need.",
    bullets: ["Same DV certificate and encryption strength", "No dedicated-IP add-on required", "Supported by all current browsers and devices", "Lower total cost than DV + dedicated IP"],
    planSlug: "domain-validated",
    faqs: [
      { question: "What is SNI and why does it matter?", answer: "SNI lets a single IP address serve SSL for multiple domains — it removes the need to pay for a dedicated IP just to run HTTPS." },
      { question: "Is SNI less secure than a dedicated IP?", answer: "No — the certificate and encryption are identical. SNI only changes how the certificate is delivered at the network level." },
      { question: "Does every visitor's browser support SNI?", answer: "Yes — every browser and OS still receiving updates supports SNI; only a small number of legacy/embedded clients from over a decade ago don't." },
    ],
  },
  {
    slug: "extended-validated",
    eyebrow: "Extended Validated (EV)",
    title: "Extended Validated SSL — the highest identity assurance",
    description: "Full legal entity verification for sites that handle payments or sensitive data — the strongest identity guarantee a certificate can provide.",
    bullets: ["Full legal entity verification", "Highest identity assurance available", "256-bit encryption on every connection", "Best for financial services and e-commerce"],
    planSlug: "extended-validated",
    faqs: [
      { question: "Who actually needs Extended Validated?", answer: "Financial services, healthcare, and e-commerce sites handling payments or sensitive personal data get the most value from EV's identity assurance." },
      { question: "How long does EV issuance take?", answer: "Typically longer than DV or OV — expect several business days due to the depth of legal entity verification involved." },
      { question: "Does EV show a green address bar?", answer: "Modern browsers surface EV verification more subtly than the old green bar, but the underlying verification is still the strongest available." },
    ],
  },
  {
    slug: "wildcard",
    eyebrow: "Wildcard",
    title: "Wildcard SSL — secure unlimited subdomains with one certificate",
    description: "One certificate covers your root domain and every subdomain — no separate cert to buy or renew each time you spin up a new subdomain.",
    bullets: ["Secures unlimited subdomains under one root domain", "Domain-level validation", "256-bit encryption on every connection", "One certificate to manage and renew"],
    planSlug: "wildcard",
    faqs: [
      { question: "What counts as a subdomain here?", answer: "Anything under your root domain — e.g. blog.yoursite.com, shop.yoursite.com, and app.yoursite.com are all covered by one Wildcard certificate." },
      { question: "Do I need to list every subdomain in advance?", answer: "No — new subdomains are automatically covered without reissuing the certificate." },
      { question: "Is Wildcard validation the same as Domain Validated?", answer: "Yes, Wildcard certificates use domain-level validation, extended to cover the full subdomain range." },
    ],
  },
]

export function getSslPage(slug: string) {
  return sslPages.find((page) => page.slug === slug)
}

export const sslPageIcons: Record<string, LucideIcon> = {
  "domain-validated": ShieldCheck,
  "business-validated": Award,
  "domain-validated-sni": Wifi,
  "extended-validated": ShoppingCart,
  wildcard: Globe2,
}

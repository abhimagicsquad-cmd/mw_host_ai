import type { LucideIcon } from "lucide-react"
import { ArrowRightLeft, Globe, Lock, MousePointerClick, RefreshCw, Shield, ShieldCheck, UserCog } from "lucide-react"

import type { FAQItem, Feature } from "@/types/content"

export type DomainPageData = {
  slug: string
  eyebrow: string
  title: string
  description: string
  bullets: string[]
  faqs: FAQItem[]
}

/** TLD pricing strip — see docs/01-website-audit-report.md §5.3. */
export const tldPricing = [
  { tld: ".com", price: "₹1,099", suffix: "/yr" },
  { tld: ".in", price: "₹699", suffix: "/yr" },
  { tld: ".co.in", price: "₹649", suffix: "/yr" },
  { tld: ".org", price: "₹1,418", suffix: "/yr" },
]

/** "With every domain you get" — shared feature set across all domain pages (audit §5.3). */
export const domainIncludedFeatures: Feature[] = [
  { title: "Easy account management", description: "Manage DNS, contacts, and renewals from one dashboard.", icon: UserCog },
  { title: "Theft protection", description: "Registrar lock prevents unauthorized transfers out.", icon: Shield },
  { title: "Domain forwarding", description: "Point your domain to any URL without hosting a site.", icon: ArrowRightLeft },
  { title: "Auto renewal", description: "Never lose a domain to a missed renewal date.", icon: RefreshCw },
  { title: "Domain masking", description: "Keep the destination URL hidden behind your domain.", icon: Globe },
  { title: "Domain lock", description: "An extra layer of protection against unauthorized changes.", icon: Lock },
]

export const domainHubIntro = {
  title: "Everything domain-related, in one place",
  description: "Register, host, transfer, or search for a domain — all backed by the same account protections.",
}

export const domainPages: DomainPageData[] = [
  {
    slug: "domain-name-registration",
    eyebrow: "Domain Registration",
    title: "Register a domain in minutes",
    description: "Search, register, and manage your domain from a single dashboard — with registrar lock and auto-renewal included.",
    bullets: ["Instant registration for available domains", "Free WHOIS privacy on supported TLDs", "Auto-renewal so you never lose your domain", "Manage DNS from your account dashboard"],
    faqs: [
      { question: "How long does registration take?", answer: "Domains are typically active within a few minutes of successful payment." },
      { question: "Do you offer WHOIS privacy?", answer: "Yes, on supported TLDs at no extra cost." },
      { question: "Can I transfer the domain out later?", answer: "Yes, once past the standard 60-day ICANN transfer lock." },
    ],
  },
  {
    slug: "indian-domain",
    eyebrow: "Indian Domains",
    title: "Register .in and .co.in domains for your business",
    description: "Local TLDs signal a local presence to your customers — registered and managed with the same tools as every other domain.",
    bullets: [".in and .co.in domains available", "Fast local DNS propagation", "Registrar lock included", "Simple GST-ready billing"],
    faqs: [
      { question: "Do I need to be an Indian resident to register a .in domain?", answer: "No, .in domains are open to registrants worldwide." },
      { question: "What documents are required?", answer: "Standard registrant contact details — no special documentation needed for .in or .co.in." },
      { question: "Can I use a .in domain with hosting from another provider?", answer: "Yes, you can point DNS to any host you choose." },
    ],
  },
  {
    slug: "domain-hosting",
    eyebrow: "Domain + Hosting",
    title: "Register your domain and host it in one place",
    description: "Skip the DNS-pointing dance — register your domain and launch your website on the same NVMe hosting infrastructure.",
    bullets: ["One dashboard for domain and hosting", "Free SSL the moment DNS resolves", "NVMe hosting on every plan", "One invoice, one renewal date"],
    faqs: [
      { question: "Does bundling save time over separate providers?", answer: "Yes — DNS is pre-configured automatically, so there's no manual nameserver setup." },
      { question: "Can I still use external DNS if I prefer?", answer: "Yes, you can point to third-party DNS at any time from your dashboard." },
      { question: "What hosting plans work with this?", answer: "Any shared, VPS, or dedicated plan — see our hosting pages for pricing." },
    ],
  },
  {
    slug: "buy-domain-name",
    eyebrow: "Buy a Domain",
    title: "Buy the domain name you actually want",
    description: "Straightforward pricing across the most popular TLDs, with no bait-and-switch renewal pricing hidden in the fine print.",
    bullets: ["Transparent year-one and renewal pricing", "Popular TLDs: .com, .in, .co.in, .org", "Free registrar lock", "Instant checkout"],
    faqs: [
      { question: "Will my renewal price be different from my first year?", answer: "Renewal pricing is disclosed upfront on every TLD — no surprise price jumps." },
      { question: "Can I register multiple domains at once?", answer: "Yes, add as many domains as you need to a single order." },
      { question: "What happens if my desired domain is taken?", answer: "We'll suggest available alternatives across other TLDs." },
    ],
  },
  {
    slug: "transfer-your-domain-name",
    eyebrow: "Domain Transfer",
    title: "Transfer your domain without the downtime",
    description: "Move your domain to MagicWorks Host in a few steps — most transfers complete in 1–7 days with zero site downtime.",
    bullets: ["Step-by-step transfer checklist provided", "No downtime during the transfer window", "Free year of registration added on transfer", "Support team available if anything stalls"],
    faqs: [
      { question: "How long does a domain transfer take?", answer: "Typically 1–7 days, depending on your current registrar's approval process." },
      { question: "What do I need before starting?", answer: "Disable privacy protection, verify your admin email, remove registrar locks, and obtain your EPP/auth code." },
      { question: "Will my website go down during the transfer?", answer: "No — DNS and hosting are unaffected by a domain transfer; only the registrar changes." },
    ],
  },
]

export function getDomainPage(slug: string) {
  return domainPages.find((page) => page.slug === slug)
}

export const domainPageIcons: Record<string, LucideIcon> = {
  "domain-name-registration": Globe,
  "indian-domain": ShieldCheck,
  "domain-hosting": MousePointerClick,
  "buy-domain-name": Globe,
  "transfer-your-domain-name": ArrowRightLeft,
}

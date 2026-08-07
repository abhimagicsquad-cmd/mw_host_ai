import { Cpu, HeadphonesIcon, ShieldCheck } from "lucide-react"

import type { FAQItem, Feature } from "@/types/content"

export type DedicatedPageData = {
  slug: string
  eyebrow: string
  title: string
  description: string
  bullets: string[]
  managed: boolean
  faqs: FAQItem[]
}

/**
 * The audit flagged dedicated-server and managed-dedicated-server as functionally
 * identical pages (same tiers, same pricing) differentiated only by copy and a
 * managed flag — modeled that way here deliberately, one template, no duplication.
 */
export const dedicatedPages: DedicatedPageData[] = [
  {
    slug: "dedicated-server",
    eyebrow: "Dedicated Server",
    title: "Bare-metal performance, fully in your control",
    description: "Full root access to dedicated hardware — no noisy neighbors, no shared resources, no compromise on performance.",
    bullets: ["Dedicated CPU, RAM, and storage — nothing shared", "Full root access", "Choice of OS and control panel", "5 dedicated IPs included"],
    managed: false,
    faqs: [
      { question: "Do I manage the server myself?", answer: "Yes — you get full root access. Our support team is available for infrastructure-level issues, not application management." },
      { question: "Can I choose my operating system?", answer: "Yes, a choice of Linux distributions is available at provisioning." },
      { question: "How fast is provisioning?", answer: "Dedicated servers are typically provisioned within 24 hours of order confirmation." },
    ],
  },
  {
    slug: "managed-dedicated-server",
    eyebrow: "Managed Dedicated Server",
    title: "Dedicated server performance, without the server admin work",
    description: "The same dedicated hardware, plus our team handling patching, monitoring, and hardening — so your team can focus on the application, not the OS.",
    bullets: ["Same dedicated hardware tiers", "Proactive patching and monitoring", "Security hardening included", "Priority support queue"],
    managed: true,
    faqs: [
      { question: "What does 'managed' actually include?", answer: "OS patching, security hardening, uptime monitoring, and priority support — you focus on your application." },
      { question: "Can I still get root access?", answer: "Yes, root access is available on request even on managed plans." },
      { question: "Is managed support available 24/7?", answer: "Yes, managed dedicated customers get priority 24/7 support routing." },
    ],
  },
  {
    slug: "linux-dedicated-server",
    eyebrow: "Linux Dedicated Server",
    title: "Linux dedicated servers tuned for real workloads",
    description: "The same dedicated hardware tiers, running a hardened Linux stack — a solid foundation for anything from a database cluster to a build server.",
    bullets: ["Choice of major Linux distributions", "Hardened default configuration", "Full root access", "5 dedicated IPs included"],
    managed: false,
    faqs: [
      { question: "Which Linux distributions are supported?", answer: "Common enterprise distributions are available at provisioning — ask our team if you need a specific version." },
      { question: "Can I run a control panel like cPanel or Plesk?", answer: "Yes, both are available as optional add-ons." },
      { question: "Is this the same hardware as your other dedicated plans?", answer: "Yes — the same tiers and pricing, just provisioned with a Linux-first configuration." },
    ],
  },
]

export function getDedicatedPage(slug: string) {
  return dedicatedPages.find((page) => page.slug === slug)
}

export const dedicatedTrustFeatures: Feature[] = [
  { title: "Enterprise-grade hardware", description: "Dedicated CPU, RAM, and storage with no shared tenancy.", icon: Cpu },
  { title: "Hardened by default", description: "Security configuration applied before the server ever reaches you.", icon: ShieldCheck },
  { title: "Real support", description: "24/7 phone and ticket support from people who run these servers daily.", icon: HeadphonesIcon },
]

import type { LucideIcon } from "lucide-react"
import { Gauge, Lock, Rocket, Search, Server, Sparkles, Terminal, TrendingUp, Zap } from "lucide-react"

import type { FAQItem, Feature } from "@/types/content"

export type HostingPageData = {
  slug: string
  eyebrow: string
  title: string
  description: string
  bullets: string[]
  features: Feature[]
  faqs: FAQItem[]
}

export const hostingHubIntro = {
  title: "Shared hosting, framed around how you'll actually use it",
  description:
    "Every plan below runs on the same NVMe-backed shared hosting infrastructure — we've just organized the details around what matters most for each kind of site.",
}

export const hostingPages: HostingPageData[] = [
  {
    slug: "buy-web-hosting",
    eyebrow: "Web Hosting",
    title: "Web hosting built for speed, not just uptime",
    description:
      "NVMe storage, free SSL, and one-click installs on every plan — the same infrastructure whether you're launching a portfolio or a growing storefront.",
    bullets: [
      "NVMe storage on every tier",
      "Free SSL certificate included",
      "Softaculous one-click installs",
      "24/7 phone and ticket support",
    ],
    features: [
      { title: "Fast by default", description: "NVMe storage and tuned PHP handlers, not a paid add-on.", icon: Zap },
      { title: "cPanel included", description: "The control panel most developers already know.", icon: Terminal },
      { title: "Free migration", description: "We move your existing site over on annual plans.", icon: Server },
    ],
    faqs: [
      { question: "How long does setup take?", answer: "Most accounts are live within 5 minutes of payment confirmation." },
      { question: "Can I install WordPress automatically?", answer: "Yes — Softaculous one-click install is available in cPanel on every plan." },
      { question: "Is there a money-back guarantee?", answer: "Yes, every plan includes a 30-day money-back guarantee." },
    ],
  },
  {
    slug: "seo-hosting",
    eyebrow: "SEO Hosting",
    title: "Hosting speed that search engines actually notice",
    description:
      "Page speed is a ranking factor. Our NVMe infrastructure keeps Core Web Vitals healthy without you touching a single server setting.",
    bullets: [
      "NVMe storage for faster Time to First Byte",
      "Free SSL — a confirmed Google ranking signal",
      "Unmetered bandwidth on higher tiers",
      "Built-in caching-friendly server configuration",
    ],
    features: [
      { title: "Faster TTFB", description: "Server response time is part of Google's Core Web Vitals story.", icon: Search },
      { title: "HTTPS everywhere", description: "Free SSL on every domain, activated automatically.", icon: Lock },
      { title: "Room to scale", description: "Upgrade tiers instantly as your traffic grows.", icon: TrendingUp },
    ],
    faqs: [
      { question: "Does faster hosting really affect SEO rankings?", answer: "Page experience and Core Web Vitals are confirmed Google ranking factors, and server response time is a major input to them." },
      { question: "Do I need a separate SEO plugin?", answer: "Hosting speed helps your Core Web Vitals score, but on-page SEO still depends on your CMS/plugin setup — we handle the infrastructure side." },
      { question: "Can I move an existing site here without losing rankings?", answer: "Yes — we handle DNS and redirects carefully during migration to avoid any ranking disruption." },
    ],
  },
  {
    slug: "wordpress-hosting",
    eyebrow: "WordPress Hosting",
    title: "WordPress hosting that skips the plugin band-aids",
    description:
      "One-click WordPress installs, NVMe storage, and a server stack tuned for PHP — so your site is fast before you install a single caching plugin.",
    bullets: [
      "One-click WordPress install via Softaculous",
      "NVMe storage for faster database queries",
      "PHP running up to 3x faster than Apache",
      "Free SSL and daily JetBackup snapshots",
    ],
    features: [
      { title: "One-click installs", description: "WordPress, WooCommerce, and 150+ apps via Softaculous.", icon: Rocket },
      { title: "Tuned for PHP", description: "A server stack built around what WordPress actually needs.", icon: Gauge },
      { title: "Daily backups", description: "JetBackup snapshots so a bad update is never catastrophic.", icon: Sparkles },
    ],
    faqs: [
      { question: "Is this managed WordPress hosting?", answer: "It's WordPress-optimized shared hosting with full cPanel access — you keep full control, we keep the server fast." },
      { question: "Can I install multiple WordPress sites?", answer: "Yes, subject to your plan's storage and email account limits." },
      { question: "Do you support WooCommerce?", answer: "Yes — WooCommerce installs cleanly via the same one-click Softaculous flow." },
    ],
  },
  {
    slug: "linux-shared-hosting",
    eyebrow: "Linux Hosting",
    title: "Linux shared hosting with the specs to back it up",
    description:
      "A hardened Linux stack, full cPanel access, and NVMe storage — the fundamentals done properly, without a confusing feature matrix.",
    bullets: [
      "Hardened Linux server stack",
      "Full cPanel + File Manager access",
      "Unlimited MySQL databases",
      "Free SSL on every domain",
    ],
    features: [
      { title: "Full root-level cPanel", description: "File manager, cron jobs, and database tools, no waiting on support.", icon: Terminal },
      { title: "Security hardened", description: "Server-level protections applied by default, not opt-in.", icon: Lock },
      { title: "Unlimited databases", description: "Run as many MySQL databases as your apps need.", icon: Server },
    ],
    faqs: [
      { question: "What control panel do I get?", answer: "cPanel, with full file manager, cron job, and database access." },
      { question: "Can I run multiple applications?", answer: "Yes — unlimited MySQL databases mean you can run several apps on one account." },
      { question: "Is SSH access available?", answer: "SSH access is available on request for shared hosting accounts in good standing." },
    ],
  },
  {
    slug: "unlimited-hosting",
    eyebrow: "Unlimited Hosting",
    title: "Unlimited hosting, without the fine-print asterisk",
    description:
      "Generous storage and bandwidth limits designed for growing sites — with the same NVMe performance as every other plan, not a downgraded tier.",
    bullets: [
      "Generous NVMe storage allocation",
      "High-bandwidth tier for growing traffic",
      "Unlimited email accounts",
      "Free SSL and daily backups",
    ],
    features: [
      { title: "Built to scale", description: "Storage and bandwidth sized for sites that are actively growing.", icon: TrendingUp },
      { title: "Unlimited email", description: "Add as many mailboxes as your team needs.", icon: Sparkles },
      { title: "No surprise caps", description: "Fair-use, not a bait-and-switch — we'll tell you if you're outgrowing shared hosting.", icon: Gauge },
    ],
    faqs: [
      { question: "Is storage really unlimited?", answer: "Plans are sized generously for typical website workloads under a fair-use policy — we'll reach out before ever restricting an account." },
      { question: "When should I upgrade to VPS instead?", answer: "If you're running heavy applications or sustained high traffic, our team will proactively recommend VPS rather than let a shared account struggle." },
      { question: "Does unlimited include unlimited domains?", answer: "Domain limits vary by tier — check the plan comparison or ask our team for your specific use case." },
    ],
  },
]

export function getHostingPage(slug: string) {
  return hostingPages.find((page) => page.slug === slug)
}

export const hostingPageIcons: Record<string, LucideIcon> = {
  "buy-web-hosting": Server,
  "seo-hosting": Search,
  "wordpress-hosting": Rocket,
  "linux-shared-hosting": Terminal,
  "unlimited-hosting": TrendingUp,
}

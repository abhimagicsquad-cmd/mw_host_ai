import { CreditCard, Globe, Lock, Mail, Rocket, Server } from "lucide-react"

import type { KBArticle, KBCategory } from "@/types/knowledge-base"

/**
 * Seed content for the Knowledge Base structure — no CMS document type exists for
 * this yet (the Sanity schema plan only covers an external WHMCS KB link). Typed
 * the same way as every other section's content so swapping this array for a real
 * data source later is a data-source change only, not a component rewrite.
 */
export const kbCategories: KBCategory[] = [
  {
    slug: "getting-started",
    name: "Getting Started",
    description: "Account setup, first login, and provisioning basics.",
    icon: Rocket,
  },
  {
    slug: "billing",
    name: "Billing & Payments",
    description: "Invoices, renewals, refunds, and payment methods.",
    icon: CreditCard,
  },
  {
    slug: "domains",
    name: "Domains",
    description: "Registration, transfers, DNS, and nameservers.",
    icon: Globe,
  },
  {
    slug: "hosting-cpanel",
    name: "Hosting & cPanel",
    description: "Control panel, file manager, and app installs.",
    icon: Server,
  },
  {
    slug: "ssl-security",
    name: "SSL & Security",
    description: "Certificates, malware, and account security.",
    icon: Lock,
  },
  {
    slug: "email",
    name: "Email Hosting",
    description: "Mailbox setup, client configuration, and deliverability.",
    icon: Mail,
  },
]

export const kbArticles: KBArticle[] = [
  {
    slug: "activate-your-hosting-account",
    title: "How to activate your hosting account",
    excerpt: "What to expect after checkout and how long provisioning takes.",
    categorySlug: "getting-started",
    readTime: "3 min read",
    featured: true,
    popular: true,
  },
  {
    slug: "log-into-cpanel-first-time",
    title: "Logging into cPanel for the first time",
    excerpt: "Where to find your cPanel URL and credentials after signup.",
    categorySlug: "getting-started",
    readTime: "2 min read",
    popular: true,
  },
  {
    slug: "understanding-your-invoice",
    title: "Understanding your invoice and billing cycle",
    excerpt: "How annual, biennial, and triennial discounts are applied.",
    categorySlug: "billing",
    readTime: "4 min read",
  },
  {
    slug: "update-payment-method",
    title: "How to update your payment method",
    excerpt: "Change your card or payment details before your next renewal.",
    categorySlug: "billing",
    readTime: "2 min read",
  },
  {
    slug: "point-domain-to-hosting",
    title: "Pointing your domain to MagicWorks Host",
    excerpt: "Updating nameservers when your domain is registered elsewhere.",
    categorySlug: "domains",
    readTime: "5 min read",
    featured: true,
    popular: true,
  },
  {
    slug: "transfer-domain-in",
    title: "Transferring a domain into your account",
    excerpt: "EPP codes, unlock steps, and expected transfer timelines.",
    categorySlug: "domains",
    readTime: "4 min read",
  },
  {
    slug: "install-wordpress-one-click",
    title: "Installing WordPress with one click",
    excerpt: "Using Softaculous to install WordPress and other apps in cPanel.",
    categorySlug: "hosting-cpanel",
    readTime: "3 min read",
    featured: true,
  },
  {
    slug: "create-mysql-database",
    title: "Creating a MySQL database in cPanel",
    excerpt: "Set up a database and user for your application.",
    categorySlug: "hosting-cpanel",
    readTime: "3 min read",
  },
  {
    slug: "restore-backup-jetbackup",
    title: "Restoring a backup with JetBackup",
    excerpt: "Roll back files or your full account to a previous snapshot.",
    categorySlug: "hosting-cpanel",
    readTime: "4 min read",
    popular: true,
  },
  {
    slug: "install-free-ssl-certificate",
    title: "Installing your free SSL certificate",
    excerpt: "Why HTTPS matters and how AutoSSL activates on your domain.",
    categorySlug: "ssl-security",
    readTime: "3 min read",
    popular: true,
  },
  {
    slug: "what-to-do-if-site-hacked",
    title: "What to do if your website is compromised",
    excerpt: "Immediate steps to take and how our support team can help.",
    categorySlug: "ssl-security",
    readTime: "5 min read",
  },
  {
    slug: "set-up-business-email",
    title: "Setting up your business email account",
    excerpt: "Creating mailboxes and connecting them to Outlook or Gmail.",
    categorySlug: "email",
    readTime: "4 min read",
  },
  {
    slug: "fix-email-deliverability",
    title: "Fixing email deliverability issues",
    excerpt: "SPF, DKIM, and DMARC records explained in plain terms.",
    categorySlug: "email",
    readTime: "5 min read",
  },
]

export function getKBCategory(slug: string) {
  return kbCategories.find((category) => category.slug === slug)
}

export function getArticlesByCategory(slug: string) {
  return kbArticles.filter((article) => article.categorySlug === slug)
}

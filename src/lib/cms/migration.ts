import "server-only"

import type { LucideIcon } from "lucide-react"

import { blogCategories, blogPosts } from "@/constants/blog-data"
import { dedicatedPages } from "@/constants/dedicated-pages-data"
import { domainHubIntro, domainIncludedFeatures, domainPageIcons, domainPages, tldPricing } from "@/constants/domain-pages-data"
import { emailHubIntro, emailIncludedFeatures, emailPages } from "@/constants/email-pages-data"
import { hostingHubIntro, hostingPageIcons, hostingPages } from "@/constants/hosting-pages-data"
import { kbArticles, kbCategories } from "@/constants/knowledge-base-data"
import { legalDocuments } from "@/constants/legal-content"
import { allPricingPlans } from "@/constants/pricing-plans"
import { promoPages } from "@/constants/promo-pages-data"
import { siteConfig } from "@/constants/site-config"
import { sslPages } from "@/constants/ssl-pages-data"
import { testimonials } from "@/constants/testimonials"
import { iconMap } from "@/lib/icon-map"
import type { FeatureItemData, PricingPlanData } from "@/types/cms-content"
import type { Feature, PricingPlan } from "@/types/content"

import { servicePagePath, type TemplateKey, templateForPath, templates, templateSectionType } from "./templates"
import type { PageType } from "./types"

/**
 * Builds the complete set of CMS pages from the website's built-in content (src/constants and
 * the route files), so every page can be (re)created in the dashboard with identical output.
 * Sanity, the original source for some pages, has been retired: its content was imported and
 * published before removal, and the importer never overwrites existing dashboard pages. The plan is pure
 * data; `planToRows` turns it into database rows and the admin action writes them as drafts.
 */

const LEAD_CTA_HREF = "#lead" // src/components/common/cta-or-lead-button.tsx (client module)

export type MigrationSource = "sanity" | "hardcoded" | "sanity+hardcoded"

export type PlannedPage = {
  path: string
  title: string
  pageType: PageType
  source: MigrationSource
  /** Page-builder pages. */
  sections?: { type: string; data: Record<string, unknown> }[]
  /** Template pages. */
  template?: TemplateKey
  data?: Record<string, unknown>
  seo?: { meta_title: string | null; meta_description: string | null }
  notes: string[]
}

export type MigrationPlan = { pages: PlannedPage[]; pricing: { plans: PricingPlanData[]; source: MigrationSource }; warnings: string[] }

const iconNames = new Map<LucideIcon, string>(Object.entries(iconMap).map(([name, icon]) => [icon, name]))

function iconName(icon: LucideIcon | undefined, warnings: string[], where: string): string | undefined {
  if (!icon) return undefined
  const name = iconNames.get(icon)
  if (!name) warnings.push(`${where}: icon ${icon.displayName ?? "(unknown)"} has no name in lib/icon-map — it will show without an icon`)
  return name
}

function features(list: Feature[], warnings: string[], where: string): FeatureItemData[] {
  return list.map((f) => ({ title: f.title, description: f.description, icon: iconName(f.icon, warnings, where) }))
}

const faqs = (list: { question: string; answer: unknown }[]) => list.map((f) => ({ question: f.question, answer: String(f.answer) }))

const pageHero = (title: string, description: string, crumb: string) => ({
  type: "pageHeroBlock",
  data: { title, description, breadcrumbs: [{ label: "Home", href: "/" }, { label: crumb }], background: "navy" },
})

const cta = (title: string, description: string, label: string, background = "navy") => ({
  type: "ctaBannerBlock",
  data: { title, description, primaryCta: { label, href: LEAD_CTA_HREF }, background },
})

function templatePage(path: string, title: string, data: Record<string, unknown>, source: MigrationSource, notes: string[] = []): PlannedPage {
  const template = templateForPath(path)
  if (!template) throw new Error(`No template for ${path}`)
  return { path, title, pageType: templates[template].pageType, source, template, data: JSON.parse(JSON.stringify(data)), notes }
}

export async function buildMigrationPlan(): Promise<MigrationPlan> {
  const warnings: string[] = []
  const pages: PlannedPage[] = []

  // ---- Pricing plans (shared collection) --------------------------------------------
  const pricingPlans: PricingPlanData[] = allPricingPlans.map((plan: PricingPlan) => ({ ...plan, cta: plan.cta && { label: plan.cta.label, href: plan.cta.href } }))
  // Home and About were Sanity page-builder pages; they live in the dashboard (no built-in copy).
  warnings.push("/, /about-us: managed in the dashboard only (originally imported from Sanity)")

  // ---- Contact (hardcoded layout → sections, incl. both forms) -----------------------
  pages.push({
    path: "/contact-us",
    title: "Contact Us",
    pageType: "static",
    source: "hardcoded",
    sections: [
      pageHero(
        "Let's talk about your website",
        "Questions about a plan, a migration, or something urgent? Reach us directly or send your details below — we usually reply within a few hours.",
        "Contact Us"
      ),
      {
        type: "leadFormBlock",
        data: {
          eyebrow: "Get in touch",
          title: "Send us your details",
          description: "Fill in the form and our team will get back to you — no bots, no call centre script.",
          submitLabel: "Send message",
          source: "contact-page",
        },
      },
      {
        type: "quoteFormBlock",
        data: {
          eyebrow: "Planning something bigger",
          title: "Request a detailed quote",
          description: "Tell us your service, hosting type, and requirements and we'll follow up with pricing tailored to your project.",
          source: "contact-page:quote",
          background: "alt",
        },
      },
      {
        type: "faqBlock",
        data: {
          eyebrow: "Before you reach out",
          title: "Common questions",
          contactCta: false,
          faqs: [
            { question: "How quickly will I hear back?", answer: "Sales enquiries are answered within a few hours during business hours; support tickets are monitored 24/7." },
            {
              question: "I need urgent help with a live site — what should I do?",
              answer: `Call us directly at ${siteConfig.contact.phone} — support is available around the clock for existing customers.`,
            },
            { question: "Can I get a quote before signing up?", answer: "Yes, mention your requirements in the message field and we'll follow up with a tailored recommendation." },
          ],
        },
      },
      cta("Prefer to talk it through first?", "Share your number and a good time to call — we'll ring you back, no obligation.", "Request a callback"),
    ],
    notes: ["Built-in layout converted to sections; both lead forms kept as form sections"],
  })

  // ---- Service hubs (hardcoded layouts → sections) -----------------------------------
  const hubWhere = "hub"

  pages.push({
    path: "/hosting",
    title: "Web Hosting (hub)",
    pageType: "service",
    source: "hardcoded",
    sections: [
      {
        type: "pageHeroBlock",
        data: {
          title: "Web hosting plans for every kind of site",
          description: "Same NVMe infrastructure underneath — pick the page that matches what you're building.",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "Hosting" }],
          background: "navy",
        },
      },
      {
        type: "serviceGridBlock",
        data: {
          eyebrow: "Choose your hosting",
          title: hostingHubIntro.title,
          description: hostingHubIntro.description,
          services: hostingPages.map((page) => ({
            title: page.eyebrow,
            description: page.description,
            icon: iconName(hostingPageIcons[page.slug], warnings, `/hosting ${page.slug}`),
            href: `/hosting/${page.slug}`,
          })),
        },
      },
      {
        type: "pricingBlock",
        data: {
          eyebrow: "Pricing",
          title: "One pricing grid, every hosting page",
          description: "Every hosting plan below includes free SSL, cPanel, and JetBackup.",
          service: "shared-hosting",
          plans: [],
        },
      },
      {
        type: "testimonialsBlock",
        data: {
          title: "What our hosting customers say",
          description: "Real feedback from businesses running on this same NVMe infrastructure.",
          testimonials: testimonials.map((t) => ({ name: t.name, role: t.title, company: t.company, quote: t.quote, rating: t.rating, avatarUrl: t.avatarUrl })),
        },
      },
      {
        type: "quoteFormBlock",
        data: {
          eyebrow: "Custom requirements",
          title: "Need something beyond the standard tiers?",
          description: "Tell us about your project and we'll put together a tailored recommendation.",
          source: "hosting-hub:quote",
          defaultService: "shared-hosting",
          background: "alt",
        },
      },
      cta("Not sure which hosting page fits your project?", "Tell us what you're building — we'll point you at the right plan directly.", "Get a recommendation"),
    ],
    notes: ["Built-in layout converted to sections; pricing linked to the shared-hosting plans"],
  })

  pages.push({
    path: "/domain",
    title: "Domains (hub)",
    pageType: "service",
    source: "hardcoded",
    sections: [
      {
        type: "pageHeroBlock",
        data: {
          title: "Your domain, handled properly",
          description: "Register, host, or transfer a domain — all from the same account as your hosting.",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "Domain" }],
          background: "navy",
        },
      },
      { type: "tldPricingBlock", data: { items: tldPricing } },
      {
        type: "serviceGridBlock",
        data: {
          eyebrow: "Domain services",
          title: domainHubIntro.title,
          description: domainHubIntro.description,
          services: [
            {
              title: "Domain Search",
              description: "Check availability across popular TLDs and see suggested alternatives instantly.",
              icon: "Search",
              href: "/domain/search",
            },
            ...domainPages.map((page) => ({
              title: page.eyebrow,
              description: page.description,
              icon: iconName(domainPageIcons[page.slug], warnings, `/domain ${page.slug}`),
              href: `/domain/${page.slug}`,
            })),
          ],
        },
      },
      {
        type: "featureGridBlock",
        data: {
          eyebrow: "Included with every domain",
          title: "What you get, no matter which TLD",
          variant: "grid",
          columns: 3,
          background: "alt",
          items: features(domainIncludedFeatures, warnings, hubWhere),
        },
      },
      cta("Not sure which domain extension to pick?", "Tell us about your business and we'll recommend the right TLD.", "Ask us"),
    ],
    notes: ["Built-in layout converted to sections"],
  })

  pages.push({
    path: "/email-hosting",
    title: "Email Hosting (hub)",
    pageType: "service",
    source: "hardcoded",
    sections: [
      {
        type: "pageHeroBlock",
        data: {
          title: "Email that matches your domain, not a free-mail address",
          description: "Business-grade email hosting, billed simply per mailbox.",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "Email Hosting" }],
          background: "navy",
        },
      },
      {
        type: "serviceGridBlock",
        data: {
          eyebrow: "Plans",
          title: emailHubIntro.title,
          description: emailHubIntro.description,
          services: emailPages.map((page) => ({
            title: page.eyebrow,
            description: page.description,
            href: `/email-hosting/${page.slug}`,
            price: page.plan.price,
            priceSuffix: page.plan.priceSuffix,
            featured: page.plan.featured,
          })),
        },
      },
      {
        type: "featureGridBlock",
        data: {
          eyebrow: "Included",
          title: "What every mailbox gets",
          variant: "grid",
          columns: 4,
          background: "alt",
          items: features(emailIncludedFeatures, warnings, hubWhere),
        },
      },
      cta("Not sure which email tier fits your team?", "Tell us how many mailboxes you need — we'll recommend a plan.", "Ask us"),
    ],
    notes: ["Built-in layout converted to sections"],
  })

  // ---- Service pages (template) ------------------------------------------------------

  type LocalService = {
    category: string
    slug: string
    eyebrow: string
    title: string
    description: string
    bullets: string[]
    features?: Feature[]
    faqs: { question: string; answer: unknown }[]
    managed?: boolean
    planSlug?: string
  }
  const local: LocalService[] = [
    ...hostingPages.map((p) => ({ ...p, category: "hosting" })),
    ...domainPages.map((p) => ({ ...p, category: "domain", features: undefined })),
    ...emailPages.map((p) => ({ ...p, category: "email", planSlug: p.plan.slug })),
    ...dedicatedPages.map((p) => ({ ...p, category: "dedicated" })),
    ...sslPages.map((p) => ({ ...p, category: "ssl" })),
  ]
  const localByKey = new Map(local.map((p) => [`${p.category}/${p.slug}`, p]))

  for (const [key, fallback] of localByKey) {
    const [category, slug] = key.split("/")
    const path = servicePagePath(category, slug)
    const data = {
      eyebrow: fallback.eyebrow,
      heroTitle: fallback.title,
      heroDescription: fallback.description,
      bullets: fallback.bullets,
      // Hosting/SSL/VPS pages render per-page features; for the others the route's shared list applies.
      features: fallback.features ? features(fallback.features, warnings, path) : [],
      // Built-in pages keep their built-in plan (the email pages link their Pricing Plans entry).
      planSlug: fallback.planSlug && category === "email" ? fallback.planSlug : "",
      managed: fallback.managed ?? false,
      faqs: faqs(fallback.faqs),
      copy: {},
    }
    pages.push(templatePage(path, data.eyebrow || slug, data, "hardcoded"))
  }

  // ---- Legal ---------------------------------------------------------------------------
  for (const [slug, doc] of Object.entries(legalDocuments)) {
    pages.push(
      templatePage(
        `/legal/${slug}`,
        doc.title,
        { title: doc.title, summary: doc.summary, lastUpdated: doc.lastUpdated, sections: doc.sections },
        "hardcoded"
      )
    )
  }

  // ---- Company singletons: originally Sanity documents, now managed in the dashboard only ----
  warnings.push("/support, /become-our-affiliate, /compare-hosting-plans, /thank-you: managed in the dashboard only (originally imported from Sanity)")

  // ---- Knowledge base (one page: hero + categories + articles) ------------------------
  pages.push(
    templatePage(
      "/knowledge-base",
      "Knowledge Base",
      {
        heroTitle: "",
        heroDescription: "",
        categories: kbCategories.map((c) => ({ name: c.name, slug: c.slug, description: c.description, icon: iconName(c.icon, warnings, "/knowledge-base") })),
        articles: kbArticles.map(({ categorySlug, ...a }) => ({ ...a, categorySlug })) as Record<string, unknown>[],
      },
      "hardcoded",
      [`${kbCategories.length} categories, ${kbArticles.length} articles`]
    )
  )

  // ---- Blog: home + every post (hardcoded) ------------------------------------------
  pages.push(
    templatePage(
      "/blog",
      "Blog",
      {
        title: "Hosting, security, and performance — in plain language",
        description: "Practical articles for people who run websites, not server administrators.",
        categories: blogCategories,
      },
      "hardcoded"
    )
  )
  for (const post of blogPosts) {
    const { slug, ...rest } = post
    pages.push(templatePage(`/blog/${slug}`, post.title, rest, "hardcoded"))
  }

  // ---- Promotions --------------------------------------------------------------------
  for (const promo of promoPages) {
    const { slug, ...rest } = promo
    pages.push(templatePage(`/promo/${slug}`, promo.eyebrow, { ...rest, faqs: faqs(promo.faqs) }, "hardcoded"))
  }

  return { pages, pricing: { plans: JSON.parse(JSON.stringify(pricingPlans)), source: "hardcoded" }, warnings }
}

/** Section rows for a planned page (builder sections, or its single template section). */
export function plannedSections(page: PlannedPage) {
  if (page.template) return [{ type: templateSectionType(page.template), data: page.data ?? {}, position: 0 }]
  return (page.sections ?? []).map((section, position) => ({ ...section, position }))
}

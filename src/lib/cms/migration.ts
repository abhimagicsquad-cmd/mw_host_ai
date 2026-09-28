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
import { sanityFetch } from "@/sanity/lib/client"
import { urlForImage } from "@/sanity/lib/image"
import {
  getAllSanityPricingPlans,
  getSanityAboutPage,
  getSanityAffiliatePage,
  getSanityAllKBArticles,
  getSanityAllKBCategories,
  getSanityAllLegalSlugs,
  getSanityComparisonPage,
  getSanityContactPage,
  getSanityHomePage,
  getSanityKnowledgeBasePage,
  getSanityLegalPage,
  getSanityServicesPage,
  getSanitySupportPage,
  getSanityThankYouPage,
} from "@/sanity/lib/queries"
import type { FeatureItemData, PageBuilderBlock, PageDocument, PricingPlanData, TestimonialData } from "@/sanity/types"
import type { Feature, PricingPlan } from "@/types/content"

import { portableTextToMarkdown } from "./rich-text"
import { servicePagePath, type TemplateKey, templateForPath, templates, templateSectionType } from "./templates"
import type { PageType } from "./types"

/**
 * Builds the complete set of CMS pages from what the website shows today — Sanity where it
 * has a document, otherwise the hardcoded content in src/constants and the route files —
 * so every page becomes editable in the dashboard with identical output. The plan is pure
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

/** Sanity page-builder block → CMS section data (drops Sanity keys, converts rich text + images). */
function blockToSection(block: PageBuilderBlock, servicePlanSlugs: Map<string, string>) {
  const { _type, _key, ...data } = block as PageBuilderBlock & Record<string, unknown>
  void _key
  if (_type === "richTextBlock") data.content = portableTextToMarkdown(data.content)
  if (_type === "testimonialsBlock" && Array.isArray(data.testimonials)) {
    data.testimonials = (data.testimonials as TestimonialData[]).map(({ avatar, ...t }) => ({
      ...t,
      avatarUrl: t.avatarUrl ?? urlForImage(avatar)?.width(192).height(192).url(),
    }))
  }
  // A pricing block showing exactly one service's full plan list becomes a live reference
  // to that service in the Pricing Plans collection (so prices are edited in one place).
  if (_type === "pricingBlock" && Array.isArray(data.plans) && data.plans.length) {
    const plans = data.plans as PricingPlanData[]
    const service = plans[0]?.service
    const slugs = plans.map((p) => p.slug).join(",")
    if (service && plans.every((p) => p.service === service) && servicePlanSlugs.get(service) === slugs) {
      data.service = service
      data.plans = []
    }
  }
  return { type: _type, data: JSON.parse(JSON.stringify(data)) as Record<string, unknown> }
}

const pageHero = (title: string, description: string, crumb: string) => ({
  type: "pageHeroBlock",
  data: { title, description, breadcrumbs: [{ label: "Home", href: "/" }, { label: crumb }], background: "navy" },
})

const cta = (title: string, description: string, label: string, background = "navy") => ({
  type: "ctaBannerBlock",
  data: { title, description, primaryCta: { label, href: LEAD_CTA_HREF }, background },
})

type SanityServiceDoc = {
  category: string
  slug: string
  eyebrow?: string
  heroTitle?: string
  heroDescription?: string
  bullets?: string[]
  features?: FeatureItemData[]
  managed?: boolean
  planSlug?: string
  faqs?: { question: string; answer: string }[]
  seo?: { metaTitle?: string; metaDescription?: string }
}

/** Sanity meta titles are short titles the site suffixes with " | MagicWorks Host"; CMS meta titles are exact, so add it. */
function seoOf(seo?: { metaTitle?: string; metaDescription?: string }) {
  if (!seo?.metaTitle && !seo?.metaDescription) return undefined
  return { meta_title: seo.metaTitle ? `${seo.metaTitle} | ${siteConfig.name}` : null, meta_description: seo.metaDescription ?? null }
}

function templatePage(path: string, title: string, data: Record<string, unknown>, source: MigrationSource, notes: string[] = [], seo?: PlannedPage["seo"]): PlannedPage {
  const template = templateForPath(path)
  if (!template) throw new Error(`No template for ${path}`)
  return { path, title, pageType: templates[template].pageType, source, template, data: JSON.parse(JSON.stringify(data)), seo, notes }
}

export async function buildMigrationPlan(): Promise<MigrationPlan> {
  const warnings: string[] = []
  const pages: PlannedPage[] = []

  // ---- Pricing plans (shared collection) --------------------------------------------
  const sanityPlans = await getAllSanityPricingPlans()
  const pricingPlans: PricingPlanData[] = sanityPlans.length
    ? sanityPlans
    : allPricingPlans.map((plan: PricingPlan) => ({ ...plan, cta: plan.cta && { label: plan.cta.label, href: plan.cta.href } }))
  const servicePlanSlugs = new Map<string, string>()
  for (const plan of pricingPlans) {
    if (!plan.service) continue
    servicePlanSlugs.set(plan.service, [servicePlanSlugs.get(plan.service), plan.slug].filter(Boolean).join(","))
  }

  // ---- Page-builder pages: Home + About (Sanity) ------------------------------------
  for (const [path, title, load] of [
    ["/", "Home", getSanityHomePage],
    ["/about-us", "About Us", getSanityAboutPage],
  ] as const) {
    const doc: PageDocument | null = await load()
    if (!doc?.pageBuilder?.length) {
      warnings.push(`${path}: no Sanity page-builder content — left on its built-in design`)
      continue
    }
    pages.push({
      path,
      title,
      pageType: path === "/" ? "home" : "static",
      source: "sanity",
      sections: doc.pageBuilder.map((block) => blockToSection(block, servicePlanSlugs)),
      seo: seoOf(doc.seo),
      notes: [`${doc.pageBuilder.length} sections from Sanity`],
    })
  }

  // ---- Contact (hardcoded layout → sections, incl. both forms) -----------------------
  const contactSanity = await getSanityContactPage()
  pages.push({
    path: "/contact-us",
    title: "Contact Us",
    pageType: "static",
    source: contactSanity?.pageBuilder?.length ? "sanity+hardcoded" : "hardcoded",
    sections: [
      pageHero(
        "Let's talk about your website",
        "Questions about a plan, a migration, or something urgent? Reach us directly or send your details below — we usually reply within a few hours.",
        "Contact Us"
      ),
      ...(contactSanity?.pageBuilder ?? []).map((block) => blockToSection(block, servicePlanSlugs)),
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
    seo: seoOf(contactSanity?.seo),
    notes: ["Built-in layout converted to sections; both lead forms kept as form sections"],
  })

  // ---- Service hubs (hardcoded layouts → sections; SEO from Sanity) ------------------
  const [hostingSeo, domainSeo, emailSeo] = await Promise.all(["hosting", "domain", "email-hosting"].map((slug) => getSanityServicesPage(slug)))
  const hubWhere = "hub"

  pages.push({
    path: "/hosting",
    title: "Web Hosting (hub)",
    pageType: "service",
    source: hostingSeo?.seo ? "sanity+hardcoded" : "hardcoded",
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
    seo: seoOf(hostingSeo?.seo),
    notes: ["Built-in layout converted to sections; pricing linked to the shared-hosting plans"],
  })

  pages.push({
    path: "/domain",
    title: "Domains (hub)",
    pageType: "service",
    source: domainSeo?.seo ? "sanity+hardcoded" : "hardcoded",
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
    seo: seoOf(domainSeo?.seo),
    notes: ["Built-in layout converted to sections"],
  })

  pages.push({
    path: "/email-hosting",
    title: "Email Hosting (hub)",
    pageType: "service",
    source: emailSeo?.seo ? "sanity+hardcoded" : "hardcoded",
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
    seo: seoOf(emailSeo?.seo),
    notes: ["Built-in layout converted to sections"],
  })

  // ---- Service pages (template): Sanity docs + hardcoded-only pages --------------------
  const sanityServices =
    (await sanityFetch<SanityServiceDoc[]>(/* groq */ `*[_type == "servicePage"]{
      category, "slug": slug.current, eyebrow, heroTitle, heroDescription, bullets, features, managed,
      "planSlug": plan->slug.current, faqs, seo
    }`)) ?? []
  const bySanityKey = new Map(sanityServices.map((doc) => [`${doc.category}/${doc.slug}`, doc]))

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

  for (const key of new Set([...bySanityKey.keys(), ...localByKey.keys()])) {
    const sanity = bySanityKey.get(key)
    const fallback = localByKey.get(key)
    const [category, slug] = key.split("/")
    const path = servicePagePath(category, slug)
    const data = {
      eyebrow: sanity?.eyebrow ?? fallback?.eyebrow ?? "",
      heroTitle: sanity?.heroTitle ?? fallback?.title ?? "",
      heroDescription: sanity?.heroDescription ?? fallback?.description ?? "",
      bullets: sanity?.bullets ?? fallback?.bullets ?? [],
      // Hosting/SSL/VPS pages render per-page features; for the others the route's shared list applies.
      features: sanity?.features ?? (fallback?.features ? features(fallback.features, warnings, path) : []),
      // Only link a Pricing Plans entry where Sanity already did. Built-in-only pages (the SSL
      // certificate pages) keep their built-in plan, whose button goes to checkout.
      planSlug: sanity?.planSlug ?? "",
      managed: sanity?.managed ?? fallback?.managed ?? false,
      faqs: sanity?.faqs ?? (fallback ? faqs(fallback.faqs) : []),
      copy: {},
    }
    // /ssl and /vps-hosting keep their route defaults when Sanity lacks a doc — nothing to copy.
    if (!sanity && !fallback) continue
    pages.push(
      templatePage(path, data.eyebrow || slug, data, sanity && fallback ? "sanity+hardcoded" : sanity ? "sanity" : "hardcoded", [], seoOf(sanity?.seo))
    )
  }

  // ---- Legal ---------------------------------------------------------------------------
  const legalSlugs = new Set([...(await getSanityAllLegalSlugs()), ...Object.keys(legalDocuments)])
  for (const slug of legalSlugs) {
    const sanity = await getSanityLegalPage(slug)
    const fallback = legalDocuments[slug]
    const doc = sanity ?? fallback
    if (!doc) continue
    pages.push(
      templatePage(
        `/legal/${slug}`,
        doc.title,
        { title: doc.title, summary: doc.summary, lastUpdated: doc.lastUpdated, sections: doc.sections },
        sanity ? "sanity" : "hardcoded",
        [],
        seoOf(sanity?.seo)
      )
    )
  }

  // ---- Company singletons (Sanity) ---------------------------------------------------
  const [support, affiliate, comparison, thankYou] = await Promise.all([
    getSanitySupportPage(),
    getSanityAffiliatePage(),
    getSanityComparisonPage(),
    getSanityThankYouPage(),
  ])
  const strip = <T extends { seo?: unknown }>(doc: T) => {
    const { seo, ...rest } = doc
    void seo
    return rest as Record<string, unknown>
  }
  if (support) pages.push(templatePage("/support", "Support", strip(support), "sanity", [], seoOf(support.seo)))
  else warnings.push("/support: no Sanity document — page keeps its built-in content")
  if (affiliate) pages.push(templatePage("/become-our-affiliate", "Affiliate Program", strip(affiliate), "sanity", [], seoOf(affiliate.seo)))
  else warnings.push("/become-our-affiliate: no Sanity document — page keeps its built-in content")
  if (comparison) pages.push(templatePage("/compare-hosting-plans", "Compare Hosting Plans", strip(comparison), "sanity", [], seoOf(comparison.seo)))
  else warnings.push("/compare-hosting-plans: no Sanity document — page keeps its built-in content")
  if (thankYou) pages.push(templatePage("/thank-you", "Thank You", thankYou as unknown as Record<string, unknown>, "sanity", ["Used for the contact-form thank-you message"]))
  else warnings.push("/thank-you: no Sanity document — page keeps its built-in content")

  // ---- Knowledge base (one page: hero + categories + articles) ------------------------
  const [kbPage, kbCats, kbArts] = await Promise.all([getSanityKnowledgeBasePage(), getSanityAllKBCategories(), getSanityAllKBArticles()])
  pages.push(
    templatePage(
      "/knowledge-base",
      "Knowledge Base",
      {
        heroTitle: kbPage?.heroTitle ?? "",
        heroDescription: kbPage?.heroDescription ?? "",
        categories: kbCats.length
          ? kbCats
          : kbCategories.map((c) => ({ name: c.name, slug: c.slug, description: c.description, icon: iconName(c.icon, warnings, "/knowledge-base") })),
        articles: (kbArts.length
          ? kbArts.map(({ category, ...a }) => ({ ...a, categorySlug: category.slug }))
          : kbArticles.map(({ categorySlug, ...a }) => ({ ...a, categorySlug }))) as Record<string, unknown>[],
      },
      kbPage && kbCats.length ? "sanity" : kbPage ? "sanity+hardcoded" : "hardcoded",
      [`${kbCats.length || kbCategories.length} categories, ${kbArts.length || kbArticles.length} articles`],
      seoOf(kbPage?.seo)
    )
  )

  // ---- Blog: home + every post (hardcoded; Sanity has none) --------------------------
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

  return { pages, pricing: { plans: JSON.parse(JSON.stringify(pricingPlans)), source: sanityPlans.length ? "sanity" : "hardcoded" }, warnings }
}

/** Section rows for a planned page (builder sections, or its single template section). */
export function plannedSections(page: PlannedPage) {
  if (page.template) return [{ type: templateSectionType(page.template), data: page.data ?? {}, position: 0 }]
  return (page.sections ?? []).map((section, position) => ({ ...section, position }))
}

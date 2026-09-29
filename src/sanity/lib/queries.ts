import {
  getCmsFooterMenu,
  getCmsGeneralSettings,
  getCmsHeaderMenu,
  getCmsPageDocument,
  getCmsPricingPlans,
  getCmsTemplate,
  getCmsTemplatePages,
  getCmsWebsiteSettings,
} from "@/lib/cms/content"
import { servicePageFromPath, servicePagePath } from "@/lib/cms/templates"
import { sanityFetch } from "@/sanity/lib/client"
import type {
  AffiliatePageData,
  PageBuilderBlock,
  BlogListingPageData,
  BlogPostData,
  ComparisonPageData,
  KBArticleData,
  KBCategoryData,
  KnowledgeBasePageData,
  LegalPageData,
  NavigationData,
  PageDocument,
  PricingPlanData,
  ServicePageData,
  SiteSettingsData,
  SupportPageData,
  ThankYouPageData,
} from "@/sanity/types"

const pageBuilderProjection = /* groq */ `
  pageBuilder[]{
    _type,
    _key,
    _type == "heroBlock" => { eyebrow, title, highlightText, description, bullets, primaryCta, secondaryCta, stats, showDashboardVisual },
    _type == "pageHeroBlock" => { title, description, breadcrumbs, background },
    _type == "bannerBlock" => { message, cta, dismissible },
    _type == "statsBlock" => { eyebrow, title, description, stats },
    _type == "pricingBlock" => {
      eyebrow, title, description,
      plans[]->{ name, "slug": slug.current, price, regularPrice, priceSuffix, billingLabel, discountLabel, description, features, cta, featured, service }
    },
    _type == "trustHighlightsBlock" => { eyebrow, title, description, background, highlights },
    _type == "serviceGridBlock" => { eyebrow, title, description, services, ctaLabel, ctaDialogTitle, ctaDialogDescription },
    _type == "aboutCredibilityBlock" => { eyebrow, title, description, bullets, cta, highlights },
    _type == "featureGridBlock" => { eyebrow, title, description, variant, columns, background, items },
    _type == "testimonialsBlock" => {
      title, description, ctaLabel,
      testimonials[]->{ name, role, company, quote, rating, avatar }
    },
    _type == "faqBlock" => {
      eyebrow, title, description, contactCta,
      faqs[]->{ question, answer }
    },
    _type == "ctaBannerBlock" => { title, description, primaryCta, secondaryCta, background },
    _type == "richTextBlock" => { eyebrow, title, content },
  }
`

/** Copies only non-empty values so a blank CMS field never wipes out the Sanity/default value. */
function mergeDefined<T extends object>(base: T, overrides: Partial<T>): T {
  const result = { ...base }
  for (const [key, value] of Object.entries(overrides) as [keyof T, T[keyof T]][]) {
    if (value === undefined || value === null || value === "") continue
    if (Array.isArray(value) && value.length === 0) continue
    result[key] = value
  }
  return result
}

/**
 * Content precedence everywhere in this file: custom CMS (Supabase, managed at /admin) →
 * Sanity (legacy, read-only until its content is imported) → hardcoded page defaults.
 */
/**
 * Two legacy Sanity values are placeholders, not real business details: social links that
 * point at a bare network homepage (e.g. "https://facebook.com") and a personal webmail
 * contact address. Drop them so the site's real profiles / domain email apply instead.
 */
function withoutPlaceholderSettings(settings: SiteSettingsData | null): SiteSettingsData | null {
  if (!settings) return settings
  const socialLinks = settings.socialLinks?.filter((link) => {
    try {
      return new URL(link.url).pathname.replace(/\/+$/, "") !== ""
    } catch {
      return false
    }
  })
  const contactEmail = settings.contactEmail && /@(gmail|yahoo|outlook|hotmail)\./i.test(settings.contactEmail) ? undefined : settings.contactEmail
  return { ...settings, socialLinks: socialLinks?.length ? socialLinks : undefined, contactEmail }
}

export async function getSiteSettings() {
  const [rawSanity, general, website] = await Promise.all([getSanitySiteSettings(), getCmsGeneralSettings(), getCmsWebsiteSettings()])
  const sanity = withoutPlaceholderSettings(rawSanity)
  const cmsValues: Partial<SiteSettingsData> = {
    ...general,
    headerCta: website.headerCta?.label ? website.headerCta : undefined,
    globalCta: website.globalCta?.label ? website.globalCta : undefined,
    socialLinks: website.socialLinks?.filter((link) => link.platform && link.url),
  }
  if (!sanity && !Object.values(cmsValues).some(Boolean)) return null
  return mergeDefined<SiteSettingsData>(sanity ?? {}, cmsValues)
}

export async function getSanitySiteSettings() {
  return sanityFetch<SiteSettingsData>(
    /* groq */ `*[_type == "siteSettings"][0]{
      siteName, tagline, description, logo, favicon, headerCta, footerContent,
      contactPhone, contactPhoneHref, contactEmail, contactAddress,
      salesHours, accountingHours, supportHours, socialLinks, seoDefaults, globalCta
    }`
  )
}

export async function getHomePage() {
  return (await getCmsBuilderDocument("/")) ?? getSanityHomePage()
}

export async function getSanityHomePage() {
  return sanityFetch<PageDocument>(/* groq */ `*[_type == "homePage"][0]{ seo, ${pageBuilderProjection} }`)
}

export async function getAboutPage() {
  return (await getCmsBuilderDocument("/about-us")) ?? getSanityAboutPage()
}

export async function getSanityAboutPage() {
  return sanityFetch<PageDocument>(/* groq */ `*[_type == "aboutPage"][0]{ seo, ${pageBuilderProjection} }`)
}

export async function getContactPage() {
  return (await getCmsBuilderDocument("/contact-us")) ?? getSanityContactPage()
}

export async function getSanityContactPage() {
  return sanityFetch<PageDocument>(/* groq */ `*[_type == "contactPage"][0]{ seo, ${pageBuilderProjection} }`)
}

export async function getServicesPage(slug: string) {
  return (await getCmsBuilderDocument(`/${slug}`)) ?? getSanityServicesPage(slug)
}

export async function getSanityServicesPage(slug: string) {
  return sanityFetch<PageDocument>(
    /* groq */ `*[_type == "servicesPage" && slug.current == $slug][0]{ seo, ${pageBuilderProjection} }`,
    { slug }
  )
}

export async function getSanityServicePage(category: ServicePageData["category"], slug: string) {
  return sanityFetch<ServicePageData>(
    /* groq */ `*[_type == "servicePage" && category == $category && slug.current == $slug][0]{
      category, "slug": slug.current, eyebrow, heroTitle, heroDescription, bullets, features, managed,
      plan->{ name, "slug": slug.current, price, regularPrice, priceSuffix, billingLabel, discountLabel, description, features, cta, featured, service },
      faqs, seo
    }`,
    { category, slug }
  )
}

export async function getSanityAllServicePageSlugs(category: ServicePageData["category"]) {
  return (
    (await sanityFetch<string[]>(
      /* groq */ `*[_type == "servicePage" && category == $category].slug.current`,
      { category }
    )) ?? []
  )
}

export async function getSanityLegalPage(slug: string) {
  return sanityFetch<LegalPageData>(
    /* groq */ `*[_type == "legalPage" && slug.current == $slug][0]{
      title, "slug": slug.current, summary, lastUpdated, sections, seo
    }`,
    { slug }
  )
}

export async function getSanityAllLegalSlugs() {
  return (await sanityFetch<string[]>(/* groq */ `*[_type == "legalPage"].slug.current`)) ?? []
}

export async function getSanitySupportPage() {
  return sanityFetch<SupportPageData>(
    /* groq */ `*[_type == "supportPage"][0]{ heroTitle, heroDescription, channels, faqs, seo }`
  )
}

export async function getSanityAffiliatePage() {
  return sanityFetch<AffiliatePageData>(
    /* groq */ `*[_type == "affiliatePage"][0]{
      heroEyebrow, heroTitle, heroDescription, heroBullets, stats, howItWorks, faqs, seo
    }`
  )
}

export async function getSanityComparisonPage() {
  return sanityFetch<ComparisonPageData>(
    /* groq */ `*[_type == "comparisonPage"][0]{ heroTitle, heroDescription, rows, faqs, seo }`
  )
}

export async function getSanityKnowledgeBasePage() {
  return sanityFetch<KnowledgeBasePageData>(
    /* groq */ `*[_type == "knowledgeBasePage"][0]{ heroTitle, heroDescription, seo }`
  )
}

export async function getSanityAllKBCategories() {
  return (
    (await sanityFetch<KBCategoryData[]>(
      /* groq */ `*[_type == "kbCategory"] | order(name asc){ name, "slug": slug.current, description, icon }`
    )) ?? []
  )
}

export async function getSanityKBCategoryBySlug(slug: string) {
  return sanityFetch<KBCategoryData>(
    /* groq */ `*[_type == "kbCategory" && slug.current == $slug][0]{ name, "slug": slug.current, description, icon }`,
    { slug }
  )
}

const kbArticleProjection = /* groq */ `
  title, "slug": slug.current, excerpt,
  category->{ name, "slug": slug.current },
  readTime, featured, popular
`

export async function getSanityAllKBArticles() {
  return (
    (await sanityFetch<KBArticleData[]>(
      /* groq */ `*[_type == "kbArticle"] | order(title asc){ ${kbArticleProjection} }`
    )) ?? []
  )
}

export async function getSanityKBArticlesByCategory(categorySlug: string) {
  return (
    (await sanityFetch<KBArticleData[]>(
      /* groq */ `*[_type == "kbArticle" && category->slug.current == $categorySlug] | order(title asc){ ${kbArticleProjection} }`,
      { categorySlug }
    )) ?? []
  )
}

export async function getSanityThankYouPage() {
  return sanityFetch<ThankYouPageData>(
    /* groq */ `*[_type == "thankYouPage"][0]{ heading, description, steps, ctas }`
  )
}

export async function getNavigation(): Promise<NavigationData | null> {
  const [sanity, header, footer] = await Promise.all([getSanityNavigation(), getCmsHeaderMenu(), getCmsFooterMenu()])
  if (!sanity && !header && !footer) return null
  return {
    mainMenu: header ?? sanity?.mainMenu ?? [],
    footerColumns: footer ?? sanity?.footerColumns ?? [],
  }
}

export async function getSanityNavigation() {
  return sanityFetch<NavigationData>(
    /* groq */ `*[_type == "navigation"][0]{ mainMenu, footerColumns }`
  )
}

const pricingPlanProjection = /* groq */ `
  name, "slug": slug.current, price, regularPrice, priceSuffix, billingLabel, discountLabel, description, features, cta, featured, service, region, billingCycles
`

export async function getSanityPricingPlansByService(service: string) {
  const plans = await sanityFetch<PricingPlanData[]>(
    /* groq */ `*[_type == "pricingPlan" && service == $service] | order(order asc){ ${pricingPlanProjection} }`,
    { service }
  )
  return (plans ?? []).map((plan) => ({
    ...plan,
    features: plan.features ?? [],
    cta: plan.cta ?? { label: "Get started", href: "#lead" },
  }))
}

export async function getSanityBlogListingPage() {
  return sanityFetch<BlogListingPageData>(
    /* groq */ `*[_type == "blogListingPage"][0]{ title, eyebrow, description, seo }`
  )
}

const blogPostProjection = /* groq */ `
  title, "slug": slug.current, excerpt, coverImage,
  author->{ name, role, avatar },
  category->{ title, "slug": slug.current },
  publishedAt, readTime, body, seo
`

/** Sanity blog posts. CMS blog posts use the built-in post shape and are merged by the blog routes (see `getCmsBlogPosts`). */
export async function getAllBlogPosts() {
  return (
    (await sanityFetch<BlogPostData[]>(
      /* groq */ `*[_type == "blogPost"] | order(publishedAt desc){ ${blogPostProjection} }`
    )) ?? []
  )
}

export async function getBlogPostBySlug(slug: string) {
  return sanityFetch<BlogPostData>(
    /* groq */ `*[_type == "blogPost" && slug.current == $slug][0]{ ${blogPostProjection} }`,
    { slug }
  )
}

// ---------------------------------------------------------------------------------------
// Custom CMS first. Each getter below returns the CMS template page's content when that
// page is published (or previewed), otherwise the Sanity document — same shape either way,
// so the routes and their hardcoded fallbacks are unchanged.
// ---------------------------------------------------------------------------------------

type CmsServiceData = Omit<ServicePageData, "category" | "slug" | "plan"> & { planSlug?: string }

export async function getServicePage(category: ServicePageData["category"], slug: string): Promise<ServicePageData | null> {
  const cms = await getCmsTemplate<CmsServiceData>("servicePage", servicePagePath(category, slug))
  if (!cms) return getSanityServicePage(category, slug)
  const { planSlug, ...content } = cms
  const plan = planSlug ? await getPricingPlanBySlug(planSlug) : undefined
  return { ...content, category, slug, plan }
}

export async function getAllServicePageSlugs(category: ServicePageData["category"]) {
  const [cms, sanity] = await Promise.all([getCmsTemplatePages("servicePage"), getSanityAllServicePageSlugs(category)])
  const cmsSlugs = cms
    .map((page) => servicePageFromPath(page.path))
    .filter((match) => match?.category === category)
    .map((match) => match!.slug)
  return [...new Set([...cmsSlugs, ...sanity])]
}

export async function getLegalPage(slug: string): Promise<LegalPageData | null> {
  const cms = await getCmsTemplate<Omit<LegalPageData, "slug">>("legalPage", `/legal/${slug}`)
  return cms ? { ...cms, slug } : getSanityLegalPage(slug)
}

export async function getAllLegalSlugs() {
  const [cms, sanity] = await Promise.all([getCmsTemplatePages("legalPage"), getSanityAllLegalSlugs()])
  return [...new Set([...cms.map((page) => page.path.replace(/^\/legal\//, "")), ...sanity])]
}

export async function getSupportPage() {
  return (await getCmsTemplate<SupportPageData>("supportPage", "/support")) ?? getSanitySupportPage()
}

export async function getAffiliatePage() {
  return (await getCmsTemplate<AffiliatePageData>("affiliatePage", "/become-our-affiliate")) ?? getSanityAffiliatePage()
}

export async function getComparisonPage() {
  return (await getCmsTemplate<ComparisonPageData>("comparisonPage", "/compare-hosting-plans")) ?? getSanityComparisonPage()
}

export async function getThankYouPage() {
  return (await getCmsTemplate<ThankYouPageData>("thankYouPage", "/thank-you")) ?? getSanityThankYouPage()
}

export async function getBlogListingPage() {
  return (await getCmsTemplate<BlogListingPageData>("blogListing", "/blog")) ?? getSanityBlogListingPage()
}

type CmsKnowledgeBase = KnowledgeBasePageData & {
  categories?: KBCategoryData[]
  articles?: (Omit<KBArticleData, "category"> & { categorySlug: string })[]
}

async function getCmsKnowledgeBase() {
  return getCmsTemplate<CmsKnowledgeBase>("knowledgeBase", "/knowledge-base")
}

export async function getKnowledgeBasePage(): Promise<KnowledgeBasePageData | null> {
  const cms = await getCmsKnowledgeBase()
  return cms ? { heroTitle: cms.heroTitle, heroDescription: cms.heroDescription } : getSanityKnowledgeBasePage()
}

export async function getAllKBCategories(): Promise<KBCategoryData[]> {
  const cms = await getCmsKnowledgeBase()
  return cms?.categories?.length ? cms.categories : getSanityAllKBCategories()
}

export async function getKBCategoryBySlug(slug: string): Promise<KBCategoryData | null> {
  const cms = await getCmsKnowledgeBase()
  if (!cms?.categories?.length) return getSanityKBCategoryBySlug(slug)
  return cms.categories.find((category) => category.slug === slug) ?? null
}

function cmsArticles(cms: CmsKnowledgeBase): KBArticleData[] {
  const names = new Map((cms.categories ?? []).map((category) => [category.slug, category.name]))
  return (cms.articles ?? [])
    .map(({ categorySlug, ...article }) => ({ ...article, category: { slug: categorySlug, name: names.get(categorySlug) ?? categorySlug } }))
    .sort((a, b) => a.title.localeCompare(b.title))
}

export async function getAllKBArticles(): Promise<KBArticleData[]> {
  const cms = await getCmsKnowledgeBase()
  return cms?.articles?.length ? cmsArticles(cms) : getSanityAllKBArticles()
}

export async function getKBArticlesByCategory(categorySlug: string): Promise<KBArticleData[]> {
  const cms = await getCmsKnowledgeBase()
  if (!cms?.articles?.length) return getSanityKBArticlesByCategory(categorySlug)
  return cmsArticles(cms).filter((article) => article.category.slug === categorySlug)
}

function normalizePlan(plan: PricingPlanData) {
  return { ...plan, features: plan.features ?? [], cta: plan.cta ?? { label: "Get started", href: "#lead" } }
}

export async function getPricingPlansByService(service: string) {
  const cms = await getCmsPricingPlans()
  if (!cms) return getSanityPricingPlansByService(service)
  return cms.filter((plan) => plan.service === service).map(normalizePlan)
}

/** One plan by slug: CMS pricing collection, then Sanity. */
export async function getPricingPlanBySlug(slug: string): Promise<PricingPlanData | undefined> {
  const cms = await getCmsPricingPlans()
  if (cms) {
    const plan = cms.find((p) => p.slug === slug)
    return plan ? normalizePlan(plan) : undefined
  }
  return (await getAllSanityPricingPlans()).find((p) => p.slug === slug)
}

export async function getAllSanityPricingPlans() {
  const plans = await sanityFetch<PricingPlanData[]>(/* groq */ `*[_type == "pricingPlan"] | order(service asc, order asc){ ${pricingPlanProjection} }`)
  return (plans ?? []).map(normalizePlan)
}

/**
 * A CMS page-builder page with its pricing sections resolved: a pricing block that names a
 * `service` always shows that service's current plans from the Pricing Plans collection
 * (falling back to Sanity), so a price changed once updates every page.
 */
export async function getCmsBuilderDocument(path: string): Promise<PageDocument | null> {
  const doc = await getCmsPageDocument(path)
  if (!doc?.pageBuilder) return doc
  const pageBuilder = await Promise.all(
    doc.pageBuilder.map(async (block): Promise<PageBuilderBlock> =>
      block._type === "pricingBlock" && block.service ? { ...block, plans: await getPricingPlansByService(block.service) } : block
    )
  )
  return { ...doc, pageBuilder }
}

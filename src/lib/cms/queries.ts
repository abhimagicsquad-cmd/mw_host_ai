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
import type {
  AffiliatePageData,
  BlogListingPageData,
  ComparisonPageData,
  KBArticleData,
  KBCategoryData,
  KnowledgeBasePageData,
  LegalPageData,
  NavigationData,
  PageBuilderBlock,
  PageDocument,
  PricingPlanData,
  ServicePageData,
  SiteSettingsData,
  SupportPageData,
  ThankYouPageData,
} from "@/types/cms-content"

/**
 * Website content getters. The custom dashboard (Supabase, managed at /admin) is the only
 * content source: each getter returns the dashboard's published (or previewed) content, or
 * null / [] when the dashboard has none — the route then renders its built-in default
 * content (src/constants and the route files), so pages never break.
 */

/** Copies only non-empty values so a blank dashboard field never wipes out a default. */
function mergeDefined<T extends object>(base: T, overrides: Partial<T>): T {
  const result = { ...base }
  for (const [key, value] of Object.entries(overrides) as [keyof T, T[keyof T]][]) {
    if (value === undefined || value === null || value === "") continue
    if (Array.isArray(value) && value.length === 0) continue
    result[key] = value
  }
  return result
}

/** Site settings from Settings → General / Website; callers fall back to src/constants/site-config. */
export async function getSiteSettings(): Promise<SiteSettingsData | null> {
  const [general, website] = await Promise.all([getCmsGeneralSettings(), getCmsWebsiteSettings()])
  const values: Partial<SiteSettingsData> = {
    ...general,
    headerCta: website.headerCta?.label ? website.headerCta : undefined,
    globalCta: website.globalCta?.label ? website.globalCta : undefined,
    socialLinks: website.socialLinks?.filter((link) => link.platform && link.url),
  }
  if (!Object.values(values).some(Boolean)) return null
  return mergeDefined<SiteSettingsData>({}, values)
}

export async function getHomePage() {
  return getCmsBuilderDocument("/")
}

export async function getAboutPage() {
  return getCmsBuilderDocument("/about-us")
}

export async function getContactPage() {
  return getCmsBuilderDocument("/contact-us")
}

export async function getServicesPage(slug: string) {
  return getCmsBuilderDocument(`/${slug}`)
}

/** Header / footer menus from Menus; null when the dashboard has neither (built-in menus apply). */
export async function getNavigation(): Promise<NavigationData | null> {
  const [header, footer] = await Promise.all([getCmsHeaderMenu(), getCmsFooterMenu()])
  if (!header && !footer) return null
  return { mainMenu: header ?? [], footerColumns: footer ?? [] }
}

type CmsServiceData = Omit<ServicePageData, "category" | "slug" | "plan"> & { planSlug?: string }

export async function getServicePage(category: ServicePageData["category"], slug: string): Promise<ServicePageData | null> {
  const cms = await getCmsTemplate<CmsServiceData>("servicePage", servicePagePath(category, slug))
  if (!cms) return null
  const { planSlug, ...content } = cms
  const plan = planSlug ? await getPricingPlanBySlug(planSlug) : undefined
  return { ...content, category, slug, plan }
}

export async function getAllServicePageSlugs(category: ServicePageData["category"]) {
  const cms = await getCmsTemplatePages("servicePage")
  const slugs = cms
    .map((page) => servicePageFromPath(page.path))
    .filter((match) => match?.category === category)
    .map((match) => match!.slug)
  return [...new Set(slugs)]
}

export async function getLegalPage(slug: string): Promise<LegalPageData | null> {
  const cms = await getCmsTemplate<Omit<LegalPageData, "slug">>("legalPage", `/legal/${slug}`)
  return cms ? { ...cms, slug } : null
}

export async function getAllLegalSlugs() {
  const cms = await getCmsTemplatePages("legalPage")
  return [...new Set(cms.map((page) => page.path.replace(/^\/legal\//, "")))]
}

export async function getSupportPage() {
  return getCmsTemplate<SupportPageData>("supportPage", "/support")
}

export async function getAffiliatePage() {
  return getCmsTemplate<AffiliatePageData>("affiliatePage", "/become-our-affiliate")
}

export async function getComparisonPage() {
  return getCmsTemplate<ComparisonPageData>("comparisonPage", "/compare-hosting-plans")
}

export async function getThankYouPage() {
  return getCmsTemplate<ThankYouPageData>("thankYouPage", "/thank-you")
}

export async function getBlogListingPage() {
  return getCmsTemplate<BlogListingPageData>("blogListing", "/blog")
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
  return cms ? { heroTitle: cms.heroTitle, heroDescription: cms.heroDescription } : null
}

export async function getAllKBCategories(): Promise<KBCategoryData[]> {
  return (await getCmsKnowledgeBase())?.categories ?? []
}

export async function getKBCategoryBySlug(slug: string): Promise<KBCategoryData | null> {
  const cms = await getCmsKnowledgeBase()
  return cms?.categories?.find((category) => category.slug === slug) ?? null
}

function cmsArticles(cms: CmsKnowledgeBase): KBArticleData[] {
  const names = new Map((cms.categories ?? []).map((category) => [category.slug, category.name]))
  return (cms.articles ?? [])
    .map(({ categorySlug, ...article }) => ({ ...article, category: { slug: categorySlug, name: names.get(categorySlug) ?? categorySlug } }))
    .sort((a, b) => a.title.localeCompare(b.title))
}

export async function getAllKBArticles(): Promise<KBArticleData[]> {
  const cms = await getCmsKnowledgeBase()
  return cms ? cmsArticles(cms) : []
}

export async function getKBArticlesByCategory(categorySlug: string): Promise<KBArticleData[]> {
  return (await getAllKBArticles()).filter((article) => article.category.slug === categorySlug)
}

function normalizePlan(plan: PricingPlanData) {
  return { ...plan, features: plan.features ?? [], cta: plan.cta ?? { label: "Get started", href: "#lead" } }
}

/**
 * A service's plans from Content → Pricing Plans ([] until it's published — routes then use
 * their built-in plans). `region` narrows to India (plans without a region count as India) or
 * USA; omit it for every region.
 */
export async function getPricingPlansByService(service: string, region?: "india" | "usa") {
  const plans = (await getCmsPricingPlans()) ?? []
  return plans
    .filter((plan) => plan.service === service && (!region || (plan.region ?? "india") === region))
    .map(normalizePlan)
}

/** One plan by slug from the Pricing Plans collection. */
export async function getPricingPlanBySlug(slug: string): Promise<PricingPlanData | undefined> {
  const plan = (await getCmsPricingPlans())?.find((p) => p.slug === slug)
  return plan ? normalizePlan(plan) : undefined
}

/**
 * A dashboard page-builder page with its pricing sections resolved: a pricing block that names
 * a `service` always shows that service's current plans from the Pricing Plans collection (India
 * plans for shared hosting, whose USA plans have their own page), so a price changed once
 * updates every page.
 */
export async function getCmsBuilderDocument(path: string): Promise<PageDocument | null> {
  const doc = await getCmsPageDocument(path)
  if (!doc?.pageBuilder) return doc
  const pageBuilder = await Promise.all(
    doc.pageBuilder.map(async (block): Promise<PageBuilderBlock> =>
      block._type === "pricingBlock" && block.service
        ? { ...block, plans: await getPricingPlansByService(block.service, block.service === "shared-hosting" ? "india" : undefined) }
        : block
    )
  )
  return { ...doc, pageBuilder }
}

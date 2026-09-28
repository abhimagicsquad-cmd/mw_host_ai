import {
  getCmsBlogPosts,
  getCmsFooterMenu,
  getCmsGeneralSettings,
  getCmsHeaderMenu,
  getCmsPageDocument,
  getCmsWebsiteSettings,
} from "@/lib/cms/content"
import { sanityFetch } from "@/sanity/lib/client"
import type {
  AffiliatePageData,
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
export async function getSiteSettings() {
  const [sanity, general, website] = await Promise.all([getSanitySiteSettings(), getCmsGeneralSettings(), getCmsWebsiteSettings()])
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
  return (await getCmsPageDocument("/")) ?? getSanityHomePage()
}

export async function getSanityHomePage() {
  return sanityFetch<PageDocument>(/* groq */ `*[_type == "homePage"][0]{ seo, ${pageBuilderProjection} }`)
}

export async function getAboutPage() {
  return (await getCmsPageDocument("/about-us")) ?? getSanityAboutPage()
}

export async function getSanityAboutPage() {
  return sanityFetch<PageDocument>(/* groq */ `*[_type == "aboutPage"][0]{ seo, ${pageBuilderProjection} }`)
}

export async function getContactPage() {
  return (await getCmsPageDocument("/contact-us")) ?? getSanityContactPage()
}

export async function getSanityContactPage() {
  return sanityFetch<PageDocument>(/* groq */ `*[_type == "contactPage"][0]{ seo, ${pageBuilderProjection} }`)
}

export async function getServicesPage(slug: string) {
  return (await getCmsPageDocument(`/${slug}`)) ?? getSanityServicesPage(slug)
}

export async function getSanityServicesPage(slug: string) {
  return sanityFetch<PageDocument>(
    /* groq */ `*[_type == "servicesPage" && slug.current == $slug][0]{ seo, ${pageBuilderProjection} }`,
    { slug }
  )
}

export async function getServicePage(category: ServicePageData["category"], slug: string) {
  return sanityFetch<ServicePageData>(
    /* groq */ `*[_type == "servicePage" && category == $category && slug.current == $slug][0]{
      category, "slug": slug.current, eyebrow, heroTitle, heroDescription, bullets, features, managed,
      plan->{ name, "slug": slug.current, price, regularPrice, priceSuffix, billingLabel, discountLabel, description, features, cta, featured, service },
      faqs, seo
    }`,
    { category, slug }
  )
}

export async function getAllServicePageSlugs(category: ServicePageData["category"]) {
  return (
    (await sanityFetch<string[]>(
      /* groq */ `*[_type == "servicePage" && category == $category].slug.current`,
      { category }
    )) ?? []
  )
}

export async function getLegalPage(slug: string) {
  return sanityFetch<LegalPageData>(
    /* groq */ `*[_type == "legalPage" && slug.current == $slug][0]{
      title, "slug": slug.current, summary, lastUpdated, sections, seo
    }`,
    { slug }
  )
}

export async function getAllLegalSlugs() {
  return (await sanityFetch<string[]>(/* groq */ `*[_type == "legalPage"].slug.current`)) ?? []
}

export async function getSupportPage() {
  return sanityFetch<SupportPageData>(
    /* groq */ `*[_type == "supportPage"][0]{ heroTitle, heroDescription, channels, faqs, seo }`
  )
}

export async function getAffiliatePage() {
  return sanityFetch<AffiliatePageData>(
    /* groq */ `*[_type == "affiliatePage"][0]{
      heroEyebrow, heroTitle, heroDescription, heroBullets, stats, howItWorks, faqs, seo
    }`
  )
}

export async function getComparisonPage() {
  return sanityFetch<ComparisonPageData>(
    /* groq */ `*[_type == "comparisonPage"][0]{ heroTitle, heroDescription, rows, faqs, seo }`
  )
}

export async function getKnowledgeBasePage() {
  return sanityFetch<KnowledgeBasePageData>(
    /* groq */ `*[_type == "knowledgeBasePage"][0]{ heroTitle, heroDescription, seo }`
  )
}

export async function getAllKBCategories() {
  return (
    (await sanityFetch<KBCategoryData[]>(
      /* groq */ `*[_type == "kbCategory"] | order(name asc){ name, "slug": slug.current, description, icon }`
    )) ?? []
  )
}

export async function getKBCategoryBySlug(slug: string) {
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

export async function getAllKBArticles() {
  return (
    (await sanityFetch<KBArticleData[]>(
      /* groq */ `*[_type == "kbArticle"] | order(title asc){ ${kbArticleProjection} }`
    )) ?? []
  )
}

export async function getKBArticlesByCategory(categorySlug: string) {
  return (
    (await sanityFetch<KBArticleData[]>(
      /* groq */ `*[_type == "kbArticle" && category->slug.current == $categorySlug] | order(title asc){ ${kbArticleProjection} }`,
      { categorySlug }
    )) ?? []
  )
}

export async function getThankYouPage() {
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

export async function getPricingPlansByService(service: string) {
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

export async function getBlogListingPage() {
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

export async function getAllBlogPosts() {
  const [cmsPosts, sanityPosts] = await Promise.all([getCmsBlogPosts(), getSanityBlogPosts()])
  const cmsSlugs = new Set(cmsPosts.map((post) => post.slug))
  return [...cmsPosts, ...sanityPosts.filter((post) => !cmsSlugs.has(post.slug))]
}

async function getSanityBlogPosts() {
  return (
    (await sanityFetch<BlogPostData[]>(
      /* groq */ `*[_type == "blogPost"] | order(publishedAt desc){ ${blogPostProjection} }`
    )) ?? []
  )
}

export async function getBlogPostBySlug(slug: string) {
  const cmsPost = (await getCmsBlogPosts()).find((post) => post.slug === slug)
  return cmsPost ?? getSanityBlogPostBySlug(slug)
}

async function getSanityBlogPostBySlug(slug: string) {
  return sanityFetch<BlogPostData>(
    /* groq */ `*[_type == "blogPost" && slug.current == $slug][0]{ ${blogPostProjection} }`,
    { slug }
  )
}

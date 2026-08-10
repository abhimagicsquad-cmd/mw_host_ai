import { sanityFetch } from "@/sanity/lib/client"
import type {
  BlogListingPageData,
  BlogPostData,
  PageDocument,
  ServicePageData,
  SiteSettingsData,
} from "@/sanity/types"

const pageBuilderProjection = /* groq */ `
  pageBuilder[]{
    _type,
    _key,
    _type == "heroBlock" => { eyebrow, title, description, bullets, primaryCta, secondaryCta, stats },
    _type == "bannerBlock" => { message, cta, dismissible },
    _type == "statsBlock" => { eyebrow, title, description, stats },
    _type == "pricingBlock" => {
      eyebrow, title, description,
      plans[]->{ name, "slug": slug.current, price, regularPrice, priceSuffix, billingLabel, discountLabel, description, features, cta, featured, service }
    },
    _type == "trustHighlightsBlock" => { eyebrow, title, description, background, highlights },
    _type == "serviceGridBlock" => { eyebrow, title, description, services, ctaLabel },
    _type == "aboutCredibilityBlock" => { eyebrow, title, description, bullets, cta, highlights },
    _type == "testimonialsBlock" => {
      title, description, ctaLabel,
      testimonials[]->{ name, role, company, quote, rating, avatar }
    },
    _type == "faqBlock" => {
      eyebrow, title, description, contactCta,
      faqs[]->{ question, answer }
    },
    _type == "ctaBannerBlock" => { title, description, primaryCta, secondaryCta, background },
    _type == "richTextBlock" => { title, content },
  }
`

export async function getSiteSettings() {
  return sanityFetch<SiteSettingsData>(
    /* groq */ `*[_type == "siteSettings"][0]{
      siteName, tagline, description, logo, favicon, headerCta, footerContent,
      contactPhone, contactPhoneHref, contactEmail, contactAddress,
      salesHours, accountingHours, supportHours, socialLinks, seoDefaults, globalCta
    }`
  )
}

export async function getHomePage() {
  return sanityFetch<PageDocument>(/* groq */ `*[_type == "homePage"][0]{ seo, ${pageBuilderProjection} }`)
}

export async function getAboutPage() {
  return sanityFetch<PageDocument>(/* groq */ `*[_type == "aboutPage"][0]{ seo, ${pageBuilderProjection} }`)
}

export async function getContactPage() {
  return sanityFetch<PageDocument>(/* groq */ `*[_type == "contactPage"][0]{ seo, ${pageBuilderProjection} }`)
}

export async function getServicesPage(slug: string) {
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

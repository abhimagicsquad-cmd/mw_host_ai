import type { PortableTextBlock } from "@portabletext/react"
import type { Image as SanityImageAsset } from "sanity"

export type SanityImage = SanityImageAsset

export type Seo = {
  metaTitle?: string
  metaDescription?: string
  ogImage?: SanityImage
}

export type CtaLinkData = {
  label: string
  href: string
  external?: boolean
}

export type StatItemData = {
  label: string
  value: string
  icon?: string
}

export type FeatureItemData = {
  title: string
  description?: string
  icon?: string
}

export type FaqItemData = {
  question: string
  answer: string
}

export type PricingPlanData = {
  name: string
  slug: string
  price: string
  regularPrice?: string
  priceSuffix?: string
  billingLabel?: string
  discountLabel?: string
  description?: string
  features?: string[]
  cta?: CtaLinkData
  featured?: boolean
  service?: string
}

export type ServiceCardData = {
  title: string
  description?: string
  icon?: string
  href: string
  price?: string
  priceSuffix?: string
  featured?: boolean
}

export type TestimonialData = {
  name: string
  role?: string
  company?: string
  quote: string
  avatar?: SanityImage
  rating?: number
}

export type HeroBlockData = { _type: "heroBlock"; _key: string; eyebrow?: string; title: string; description?: string; bullets?: string[]; primaryCta?: CtaLinkData; secondaryCta?: CtaLinkData; stats?: StatItemData[] }
export type BannerBlockData = { _type: "bannerBlock"; _key: string; message: string; cta?: CtaLinkData; dismissible?: boolean }
export type StatsBlockData = { _type: "statsBlock"; _key: string; eyebrow?: string; title: string; description?: string; stats: StatItemData[] }
export type PricingBlockData = { _type: "pricingBlock"; _key: string; eyebrow?: string; title: string; description?: string; plans: PricingPlanData[] }
export type TrustHighlightsBlockData = { _type: "trustHighlightsBlock"; _key: string; eyebrow?: string; title: string; description?: string; background?: "default" | "alt" | "navy"; highlights: FeatureItemData[] }
export type ServiceGridBlockData = { _type: "serviceGridBlock"; _key: string; eyebrow?: string; title: string; description?: string; services: ServiceCardData[]; ctaLabel?: string }
export type AboutCredibilityBlockData = { _type: "aboutCredibilityBlock"; _key: string; eyebrow?: string; title: string; description?: string; bullets?: string[]; cta?: CtaLinkData; highlights?: StatItemData[] }
export type TestimonialsBlockData = { _type: "testimonialsBlock"; _key: string; title: string; description?: string; testimonials: TestimonialData[]; ctaLabel?: string }
export type FaqBlockData = { _type: "faqBlock"; _key: string; eyebrow?: string; title: string; description?: string; contactCta?: boolean; faqs: FaqItemData[] }
export type CtaBannerBlockData = { _type: "ctaBannerBlock"; _key: string; title: string; description?: string; primaryCta?: CtaLinkData; secondaryCta?: CtaLinkData; background?: "default" | "alt" | "navy" }
export type RichTextBlockData = { _type: "richTextBlock"; _key: string; title?: string; content: PortableTextBlock[] }

export type PageBuilderBlock =
  | HeroBlockData
  | BannerBlockData
  | StatsBlockData
  | PricingBlockData
  | TrustHighlightsBlockData
  | ServiceGridBlockData
  | AboutCredibilityBlockData
  | TestimonialsBlockData
  | FaqBlockData
  | CtaBannerBlockData
  | RichTextBlockData

export type PageDocument = {
  seo?: Seo
  pageBuilder?: PageBuilderBlock[]
}

export type SiteSettingsData = {
  siteName?: string
  tagline?: string
  description?: string
  logo?: SanityImage
  favicon?: SanityImage
  headerCta?: CtaLinkData
  footerContent?: PortableTextBlock[]
  contactPhone?: string
  contactPhoneHref?: string
  contactEmail?: string
  contactAddress?: string
  salesHours?: string
  accountingHours?: string
  supportHours?: string
  socialLinks?: { platform: string; url: string }[]
  seoDefaults?: Seo
  globalCta?: CtaLinkData
}

export type BlogPostData = {
  title: string
  slug: string
  excerpt: string
  coverImage?: SanityImage
  author?: { name: string; role?: string; avatar?: SanityImage }
  category?: { title: string; slug: string }
  publishedAt: string
  readTime?: string
  body: PortableTextBlock[]
  seo?: Seo
}

export type BlogListingPageData = {
  title: string
  eyebrow?: string
  description?: string
  seo?: Seo
}

export type ServicePageData = {
  category: "hosting" | "domain" | "dedicated" | "email" | "ssl" | "vps"
  slug: string
  eyebrow: string
  heroTitle: string
  heroDescription?: string
  bullets?: string[]
  features?: FeatureItemData[]
  managed?: boolean
  plan?: PricingPlanData
  faqs?: FaqItemData[]
  seo?: Seo
}

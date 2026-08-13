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

export type BillingCycleOptionData = {
  cycle: "monthly" | "annually" | "biennially" | "triennially"
  label: string
  totalPrice: string
  priceSuffix?: string
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
  region?: "india" | "usa"
  billingCycles?: BillingCycleOptionData[]
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

export type BreadcrumbItemData = {
  label: string
  href?: string
}

export type HeroBlockData = { _type: "heroBlock"; _key: string; eyebrow?: string; title: string; highlightText?: string; description?: string; bullets?: string[]; primaryCta?: CtaLinkData; secondaryCta?: CtaLinkData; stats?: StatItemData[]; showDashboardVisual?: boolean }
export type PageHeroBlockData = { _type: "pageHeroBlock"; _key: string; title: string; description?: string; breadcrumbs?: BreadcrumbItemData[]; background?: "navy" | "alt" }
export type BannerBlockData = { _type: "bannerBlock"; _key: string; message: string; cta?: CtaLinkData; dismissible?: boolean }
export type StatsBlockData = { _type: "statsBlock"; _key: string; eyebrow?: string; title: string; description?: string; stats: StatItemData[] }
export type PricingBlockData = { _type: "pricingBlock"; _key: string; eyebrow?: string; title: string; description?: string; plans: PricingPlanData[] }
export type TrustHighlightsBlockData = { _type: "trustHighlightsBlock"; _key: string; eyebrow?: string; title: string; description?: string; background?: "default" | "alt" | "navy"; highlights: FeatureItemData[] }
export type ServiceGridBlockData = { _type: "serviceGridBlock"; _key: string; eyebrow?: string; title: string; description?: string; services: ServiceCardData[]; ctaLabel?: string; ctaDialogTitle?: string; ctaDialogDescription?: string }
export type AboutCredibilityBlockData = { _type: "aboutCredibilityBlock"; _key: string; eyebrow?: string; title: string; description?: string; bullets?: string[]; cta?: CtaLinkData; highlights?: StatItemData[] }
export type FeatureGridBlockData = { _type: "featureGridBlock"; _key: string; eyebrow?: string; title: string; description?: string; variant: "grid" | "cards"; columns?: 2 | 3 | 4; background?: "none" | "alt"; items: FeatureItemData[] }
export type TestimonialsBlockData = { _type: "testimonialsBlock"; _key: string; title: string; description?: string; testimonials: TestimonialData[]; ctaLabel?: string }
export type FaqBlockData = { _type: "faqBlock"; _key: string; eyebrow?: string; title: string; description?: string; contactCta?: boolean; faqs: FaqItemData[] }
export type CtaBannerBlockData = { _type: "ctaBannerBlock"; _key: string; title: string; description?: string; primaryCta?: CtaLinkData; secondaryCta?: CtaLinkData; background?: "default" | "alt" | "navy" }
export type RichTextBlockData = { _type: "richTextBlock"; _key: string; eyebrow?: string; title?: string; content: PortableTextBlock[] }

export type PageBuilderBlock =
  | HeroBlockData
  | PageHeroBlockData
  | BannerBlockData
  | StatsBlockData
  | PricingBlockData
  | TrustHighlightsBlockData
  | ServiceGridBlockData
  | AboutCredibilityBlockData
  | FeatureGridBlockData
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

export type LegalSectionData = {
  heading: string
  body: string[]
}

export type LegalPageData = {
  title: string
  slug: string
  summary: string
  lastUpdated: string
  sections: LegalSectionData[]
  seo?: Seo
}

export type SupportChannelData = {
  title: string
  description: string
  icon: string
  ctaLabel: string
  ctaHref: string
  external?: boolean
}

export type SupportPageData = {
  heroTitle: string
  heroDescription?: string
  channels: SupportChannelData[]
  faqs?: FaqItemData[]
  seo?: Seo
}

export type AffiliatePageData = {
  heroEyebrow?: string
  heroTitle: string
  heroDescription?: string
  heroBullets?: string[]
  stats?: StatItemData[]
  howItWorks?: FeatureItemData[]
  faqs?: FaqItemData[]
  seo?: Seo
}

export type ComparisonRowData = {
  label: string
  values: string[]
}

export type ComparisonPageData = {
  heroTitle: string
  heroDescription?: string
  rows: ComparisonRowData[]
  faqs?: FaqItemData[]
  seo?: Seo
}

export type KBCategoryData = {
  name: string
  slug: string
  description: string
  icon: string
}

export type KBArticleData = {
  title: string
  slug: string
  excerpt: string
  category: { name: string; slug: string }
  readTime: string
  featured?: boolean
  popular?: boolean
}

export type KnowledgeBasePageData = {
  heroTitle: string
  heroDescription?: string
  seo?: Seo
}

export type IconCtaLinkData = {
  label: string
  href: string
  icon?: string
  variant?: "primary" | "secondary" | "outline" | "ghost"
}

export type ThankYouPageData = {
  heading: string
  description: string
  steps?: FeatureItemData[]
  ctas?: IconCtaLinkData[]
}

export type NavLinkData = {
  label: string
  href: string
  icon?: string
  external?: boolean
}

export type NavColumnData = {
  heading?: string
  links: NavLinkData[]
}

export type NavFeaturedData = {
  title: string
  description?: string
  href: string
  icon?: string
}

export type NavItemData = {
  label: string
  href?: string
  external?: boolean
  columns?: NavColumnData[]
  featured?: NavFeaturedData
}

export type NavigationData = {
  mainMenu: NavItemData[]
  footerColumns: NavColumnData[]
}

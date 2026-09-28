/** Row shapes for the CMS tables in supabase/migrations/0004_create_cms.sql. */

export type AdminRole = "super_admin" | "admin" | "editor"

export type PageType = "home" | "service" | "product" | "category" | "static" | "landing" | "blog"

export type PageStatus = "draft" | "published"

export type MediaFolder = "images" | "icons" | "documents"

export type MenuLocation = "header" | "footer"

export type UserRow = {
  id: string
  username: string
  email: string | null
  full_name: string | null
  password_hash: string
  role: AdminRole
  is_active: boolean
  must_change_password: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

/** A user row with the password hash stripped — the only shape that ever leaves the server. */
export type SafeUser = Omit<UserRow, "password_hash">

export type PageRow = {
  id: string
  title: string
  path: string
  page_type: PageType
  status: PageStatus
  excerpt: string | null
  featured_image: string | null
  published_at: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export type PageSectionRow = {
  id: string
  page_id: string
  type: SectionType
  position: number
  data: Record<string, unknown>
  is_visible: boolean
  created_at: string
  updated_at: string
}

export type MediaRow = {
  id: string
  file_name: string
  storage_path: string
  public_url: string
  mime_type: string
  size_bytes: number
  folder: MediaFolder
  alt_text: string | null
  uploaded_by: string | null
  created_at: string
  updated_at: string
}

export type SeoRow = {
  id: string
  path: string
  page_id: string | null
  meta_title: string | null
  meta_description: string | null
  canonical_url: string | null
  no_index: boolean
  og_title: string | null
  og_description: string | null
  og_image: string | null
  twitter_card: "summary" | "summary_large_image" | null
  twitter_title: string | null
  twitter_description: string | null
  twitter_image: string | null
  schema_json: unknown
  updated_by: string | null
  updated_at: string
}

export type MenuRow = {
  id: string
  location: MenuLocation
  items: unknown
  updated_by: string | null
  updated_at: string
}

export type ActivityLogRow = {
  id: string
  user_id: string | null
  username: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  description: string | null
  metadata: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

export type SettingsRow = {
  key: "general" | "website"
  value: Record<string, unknown>
  updated_by: string | null
  updated_at: string
}

export type LeadRow = {
  id: string
  created_at: string
  name: string
  phone: string
  email: string
  message: string | null
  source: string | null
  service: string | null
  company: string | null
  hosting_type: string | null
  page_url: string | null
}

export type SectionType =
  | "heroBlock"
  | "pageHeroBlock"
  | "bannerBlock"
  | "statsBlock"
  | "pricingBlock"
  | "trustHighlightsBlock"
  | "serviceGridBlock"
  | "aboutCredibilityBlock"
  | "featureGridBlock"
  | "testimonialsBlock"
  | "faqBlock"
  | "ctaBannerBlock"
  | "richTextBlock"
  | "tldPricingBlock"
  | "quoteFormBlock"
  | "leadFormBlock"

export type CtaValue = { label: string; href: string; external?: boolean }

export type GeneralSettings = {
  siteName?: string
  tagline?: string
  description?: string
  contactPhone?: string
  contactPhoneHref?: string
  contactEmail?: string
  contactAddress?: string
  salesHours?: string
  accountingHours?: string
  supportHours?: string
}

export type WebsiteSettings = {
  headerCta?: CtaValue
  globalCta?: CtaValue
  socialLinks?: { platform: string; url: string }[]
  defaultMetaTitle?: string
  defaultMetaDescription?: string
}

/** Server action result consumed by `useActionState` forms. */
export type ActionState = {
  ok?: boolean
  error?: string
  message?: string
  fieldErrors?: Record<string, string>
}

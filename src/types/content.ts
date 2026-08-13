import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

export type CTA = {
  label: string
  href: string
  external?: boolean
}

export type Feature = {
  title: string
  description: string
  icon?: LucideIcon
}

export type ServiceItem = {
  slug: string
  title: string
  description: string
  icon?: LucideIcon
  href: string
  price?: string
  priceSuffix?: string
  featured?: boolean
}

export type BillingCycleOption = {
  cycle: "monthly" | "annually" | "biennially" | "triennially"
  label: string
  totalPrice: string
  priceSuffix?: string
}

export type PricingPlan = {
  slug: string
  name: string
  price: string
  regularPrice?: string
  priceSuffix?: string
  billingLabel?: string
  discountLabel?: string
  description?: string
  features: string[]
  cta: CTA
  featured?: boolean
  /** Value from the centralized service-options list, used to pre-select the lead form's service field. */
  service?: string
  /** India/USA data-center region, for product families sold in both (VPS, Dedicated). Absent = region-agnostic. */
  region?: "india" | "usa"
  /** Multi-year term pricing, for the mock checkout flow's configure step. Absent = monthly-only billing. */
  billingCycles?: BillingCycleOption[]
}

export type Testimonial = {
  name: string
  title?: string
  company?: string
  quote: string
  avatarUrl?: string
  rating?: number
}

export type FAQItem = {
  question: string
  answer: ReactNode
}

export type Stat = {
  label: string
  value: string
  icon?: LucideIcon
}

export type LogoItem = {
  name: string
  logoUrl: string
  href?: string
}

export type BreadcrumbItem = {
  label: string
  href?: string
}

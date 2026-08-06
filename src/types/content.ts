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

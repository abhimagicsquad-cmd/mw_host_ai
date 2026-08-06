import type { LucideIcon } from "lucide-react"
import type { ComponentType, SVGProps } from "react"

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

export type NavLink = {
  label: string
  href: string
  description?: string
  icon?: LucideIcon
  external?: boolean
}

export type NavColumn = {
  heading?: string
  links: NavLink[]
}

export type NavFeatured = {
  title: string
  description?: string
  href: string
  icon?: LucideIcon
}

export type NavItem = {
  label: string
  href?: string
  columns?: NavColumn[]
  featured?: NavFeatured
  external?: boolean
}

export type SocialLink = {
  label: string
  href: string
  icon: IconComponent
}

import type { ComponentType, SVGProps } from "react"

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

/**
 * `icon` here is a name (see `@/lib/icon-map`), not a component reference — this data is
 * produced by Server Components and passed into client nav components (`NavMenu`/`MobileNav`),
 * and React 19 forbids passing component/function values as props across that boundary.
 * Each client component resolves the name to a component via `resolveIcon()` at render time.
 */
export type NavLink = {
  label: string
  href: string
  description?: string
  icon?: string
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
  icon?: string
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

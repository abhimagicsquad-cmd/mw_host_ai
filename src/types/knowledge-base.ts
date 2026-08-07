import type { LucideIcon } from "lucide-react"

export type KBCategory = {
  slug: string
  name: string
  description: string
  icon: LucideIcon
}

export type KBArticle = {
  slug: string
  title: string
  excerpt: string
  categorySlug: string
  readTime: string
  featured?: boolean
  popular?: boolean
}

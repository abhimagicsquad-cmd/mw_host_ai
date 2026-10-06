import type { LucideIcon } from "lucide-react"

import { guideCategories, guideHref, kbGuides } from "@/constants/kb-guides"
import { kbArticles, kbCategories } from "@/constants/knowledge-base-data"
import { getAllKBArticles, getAllKBCategories } from "@/lib/cms/queries"
import { resolveIcon } from "@/lib/icon-map"
import type { KBArticle } from "@/types/knowledge-base"

export type HelpCategory = { slug: string; name: string; description: string; icon?: LucideIcon }

/**
 * The help centre's categories and articles: the dashboard's knowledge base (or the built-in
 * defaults when it has none), plus the long-form guides and their categories, which have their
 * own pages. Guides are listed first in each category since they're the ones that open.
 */
export async function getHelpCentre(): Promise<{ categories: HelpCategory[]; articles: KBArticle[] }> {
  const [cmsCategories, cmsArticles] = await Promise.all([getAllKBCategories(), getAllKBArticles()])

  const baseCategories: HelpCategory[] = cmsCategories.length
    ? cmsCategories.map((category) => ({ slug: category.slug, name: category.name, description: category.description, icon: resolveIcon(category.icon) }))
    : kbCategories.map(({ slug, name, description, icon }) => ({ slug, name, description, icon }))
  const known = new Set(baseCategories.map((category) => category.slug))
  const categories = [
    // Hosting and WordPress guides lead (they're the broadest topics); the rest follow the dashboard's order.
    ...guideCategories.filter((category) => !known.has(category.slug) && category.slug !== "migration").map(toHelpCategory),
    ...baseCategories,
    ...guideCategories.filter((category) => !known.has(category.slug) && category.slug === "migration").map(toHelpCategory),
  ]

  const baseArticles: KBArticle[] = cmsCategories.length
    ? cmsArticles.map((article) => ({
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        categorySlug: article.category.slug,
        readTime: article.readTime,
        featured: article.featured,
        popular: article.popular,
      }))
    : kbArticles
  const guideArticles: KBArticle[] = kbGuides.map((guide) => ({
    slug: guide.slug,
    title: guide.title,
    excerpt: guide.excerpt,
    categorySlug: guide.categorySlug,
    readTime: guide.readTime,
    href: guideHref(guide.slug),
  }))
  const guideSlugs = new Set(guideArticles.map((article) => article.slug))

  return { categories, articles: [...guideArticles, ...baseArticles.filter((article) => !guideSlugs.has(article.slug))] }
}

function toHelpCategory(category: (typeof guideCategories)[number]): HelpCategory {
  return { slug: category.slug, name: category.name, description: category.description, icon: resolveIcon(category.icon) }
}

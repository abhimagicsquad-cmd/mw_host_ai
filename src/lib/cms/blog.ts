import "server-only"

import { cache } from "react"

import { type BlogCategory, type BlogPost, blogCategories, blogPosts } from "@/constants/blog-data"
import { getBlogListingPage } from "@/lib/cms/queries"
import type { BlogListingPageData } from "@/types/cms-content"

import { getCmsBlogPosts } from "./content"

/**
 * One merged view of the blog for the listing, category and post routes, in precedence
 * order dashboard (CMS) → built-in posts (a slug present in the dashboard wins).
 * CMS posts use the built-in post shape, so they render with the same template.
 */

type BlogListing = BlogListingPageData & { categories?: BlogCategory[] }

export const getBlog = cache(async () => {
  const [listing, cmsPosts] = await Promise.all([getBlogListingPage() as Promise<BlogListing | null>, getCmsBlogPosts()])

  const seen = new Set<string>()
  const posts: BlogPost[] = []
  for (const post of [...cmsPosts, ...blogPosts]) {
    if (seen.has(post.slug)) continue
    seen.add(post.slug)
    posts.push(post)
  }

  const baseCategories = listing?.categories?.length ? listing.categories : blogCategories
  const categories: BlogCategory[] = [
    ...baseCategories,
    ...[...new Set(posts.map((post) => post.categorySlug))]
      .filter((slug) => slug !== "uncategorized" && !baseCategories.some((c) => c.slug === slug))
      .map((slug) => blogCategories.find((c) => c.slug === slug) ?? { slug, name: slug }),
  ]

  return {
    listing,
    posts,
    categories,
    cmsSlugs: new Set(cmsPosts.map((post) => post.slug)),
    categoryName: (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug,
    related: (post: BlogPost, limit = 3) =>
      posts.filter((candidate) => candidate.slug !== post.slug && candidate.categorySlug === post.categorySlug).slice(0, limit),
  }
})

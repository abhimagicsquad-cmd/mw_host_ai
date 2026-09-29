import "server-only"

import { cache } from "react"

import { type BlogCategory, type BlogPost, blogCategories, blogPosts } from "@/constants/blog-data"
import { getAllBlogPosts, getBlogListingPage } from "@/sanity/lib/queries"
import type { BlogListingPageData, BlogPostData } from "@/sanity/types"

import { getCmsBlogPosts } from "./content"

/**
 * One merged view of the blog for the listing, category and post routes, in precedence
 * order CMS → Sanity → built-in posts (a slug present in an earlier source wins).
 * CMS posts use the built-in post shape, so they render with the same template.
 */

function formatPublishedLabel(publishedAt: string) {
  return new Date(publishedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
}

export function sanityToBlogPost(post: BlogPostData): BlogPost {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    categorySlug: post.category?.slug ?? "uncategorized",
    readTime: post.readTime ?? "5 min read",
    publishedLabel: formatPublishedLabel(post.publishedAt),
    author: { name: post.author?.name ?? "MagicWorks Host Team", role: post.author?.role ?? "" },
    sections: [],
  }
}

type BlogListing = BlogListingPageData & { categories?: BlogCategory[] }

export const getBlog = cache(async () => {
  const [listing, cmsPosts, sanityPosts] = await Promise.all([
    getBlogListingPage() as Promise<BlogListing | null>,
    getCmsBlogPosts(),
    getAllBlogPosts(),
  ])

  const seen = new Set<string>()
  const posts: BlogPost[] = []
  for (const post of [...cmsPosts, ...sanityPosts.map(sanityToBlogPost), ...blogPosts]) {
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
    sanityPosts,
    categoryName: (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug,
    related: (post: BlogPost, limit = 3) =>
      posts.filter((candidate) => candidate.slug !== post.slug && candidate.categorySlug === post.categorySlug).slice(0, limit),
  }
})

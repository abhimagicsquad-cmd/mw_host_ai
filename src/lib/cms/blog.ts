import "server-only"

import { cache } from "react"

import { type BlogCategory, type BlogPost, blogCategories, blogPosts, inWordpressCategory, wordpressCategories } from "@/constants/blog-data"
import { getBlogListingPage } from "@/lib/cms/queries"
import type { BlogListingPageData } from "@/types/cms-content"

import { getCmsBlogPosts } from "./content"

/**
 * The blog for the listing, category, post and index routes. The dashboard (CMS) is the one
 * source: the site shows exactly the posts published there, so unpublishing or deleting a post
 * takes it off the site. The built-in posts (src/constants) are the seed the dashboard was
 * filled from (scripts/import-blog-posts-to-cms.mjs) and are only used when the dashboard returns
 * no posts at all — the database is not configured or unreachable — so the blog never renders empty.
 */

type BlogListing = BlogListingPageData & { categories?: BlogCategory[] }

/** Publish time for sorting: the exact date, else the "Jan 2026" label. */
function publishedTime(post: BlogPost) {
  const time = Date.parse(post.publishedAt ?? `1 ${post.publishedLabel}`)
  return Number.isNaN(time) ? 0 : time
}

export const getBlog = cache(async () => {
  const [listing, cmsPosts] = await Promise.all([getBlogListingPage() as Promise<BlogListing | null>, getCmsBlogPosts()])
  const source = cmsPosts.length ? cmsPosts : blogPosts

  // Newest first; one post per slug.
  const posts = source
    .filter((post, index) => source.findIndex((other) => other.slug === post.slug) === index)
    .map((post, index) => ({ post, index }))
    .sort((a, b) => publishedTime(b.post) - publishedTime(a.post) || a.index - b.index)
    .map(({ post }) => post)

  const baseCategories = listing?.categories?.length ? listing.categories : blogCategories
  const categories: BlogCategory[] = [
    ...baseCategories,
    ...[...new Set(posts.map((post) => post.categorySlug))]
      .filter((slug) => slug !== "uncategorized" && !baseCategories.some((c) => c.slug === slug))
      .map((slug) => blogCategories.find((c) => c.slug === slug) ?? { slug, name: slug }),
  ]

  // Topics with posts, then the WordPress category archives with posts (a slug that is both shows once).
  const topicsWithPosts = [
    ...categories.filter((category) => posts.some((post) => post.categorySlug === category.slug)),
    ...wordpressCategories.filter((category) => posts.some((post) => inWordpressCategory(post, category.slug))),
  ].filter((category, index, all) => all.findIndex((other) => other.slug === category.slug) === index)

  return {
    listing,
    posts,
    categories,
    topicsWithPosts,
    categoryName: (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug,
    related: (post: BlogPost, limit = 3) =>
      posts.filter((candidate) => candidate.slug !== post.slug && candidate.categorySlug === post.categorySlug).slice(0, limit),
  }
})

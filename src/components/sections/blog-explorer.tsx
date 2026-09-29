import { BlogExplorerClient, type BlogCard } from "@/components/sections/blog-explorer-client"
import type { BlogCategory, BlogPost } from "@/constants/blog-data"

type BlogExplorerProps = {
  categories: BlogCategory[]
  posts: BlogPost[]
  /** Pre-selects a category (e.g. from a /blog/category/[category] route) instead of "all". */
  initialCategory?: string
}

/** Searchable, filterable post listing. Only card fields cross to the client, keeping article bodies out of the page payload. */
export function BlogExplorer({ categories, posts, initialCategory }: BlogExplorerProps) {
  const cards: BlogCard[] = posts.map(({ slug, title, excerpt, categorySlug, publishedLabel, readTime, featured }) => ({
    slug,
    title,
    excerpt,
    categorySlug,
    publishedLabel,
    readTime,
    featured,
  }))
  return <BlogExplorerClient categories={categories} posts={cards} initialCategory={initialCategory} />
}

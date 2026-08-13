"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"

import { LeadCTAButton } from "@/components/common/lead-cta-button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { BlogCategory, BlogPost } from "@/constants/blog-data"

type BlogExplorerProps = {
  categories: BlogCategory[]
  posts: BlogPost[]
  /** Pre-selects a category (e.g. from a /blog/category/[category] route) instead of "all". */
  initialCategory?: string
}

export function BlogExplorer({ categories, posts, initialCategory = "all" }: BlogExplorerProps) {
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState(initialCategory)

  const categoryName = (slug: string) => categories.find((category) => category.slug === slug)?.name ?? slug

  const isFiltering = query.trim().length > 0 || activeCategory !== "all"
  const featuredPosts = useMemo(() => posts.filter((post) => post.featured), [posts])

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return posts.filter((post) => {
      const matchesCategory = activeCategory === "all" || post.categorySlug === activeCategory
      const matchesQuery =
        normalizedQuery.length === 0 ||
        post.title.toLowerCase().includes(normalizedQuery) ||
        post.excerpt.toLowerCase().includes(normalizedQuery)

      return matchesCategory && matchesQuery
    })
  }, [posts, activeCategory, query])

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search articles — e.g. 'SSL', 'WordPress', 'speed'"
            aria-label="Search the blog"
            className="h-11 w-full rounded-full border border-input bg-transparent pl-10 pr-4 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              activeCategory === "all"
                ? "border-brand-orange bg-brand-orange text-white"
                : "border-border-alt bg-background text-brand-navy hover:border-brand-orange/40"
            )}
          >
            All topics
          </button>
          {categories.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => setActiveCategory(category.slug)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                activeCategory === category.slug
                  ? "border-brand-orange bg-brand-orange text-white"
                  : "border-border-alt bg-background text-brand-navy hover:border-brand-orange/40"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {!isFiltering && featuredPosts.length > 0 ? (
        <div className="flex flex-col gap-4">
          <p className="font-heading text-sm font-semibold tracking-wide text-brand-navy uppercase">Featured articles</p>
          <div className="grid gap-5 sm:grid-cols-3">
            {featuredPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col gap-2 rounded-2xl border border-brand-orange/30 bg-gradient-to-b from-brand-orange/8 to-background p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <Badge className="w-fit bg-brand-orange text-white">Featured</Badge>
                <p className="font-heading text-base font-semibold text-brand-navy">{post.title}</p>
                <p className="text-sm leading-relaxed text-body-text">{post.excerpt}</p>
                <p className="mt-auto text-xs text-muted-foreground">{post.publishedLabel} &middot; {post.readTime}</p>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {filteredPosts.length > 0 ? (
        <div className="flex flex-col gap-4">
          {!isFiltering ? (
            <p className="font-heading text-sm font-semibold tracking-wide text-brand-navy uppercase">All articles</p>
          ) : null}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col gap-2 rounded-2xl border border-border-alt bg-background p-6 transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <p className="text-xs font-semibold tracking-wide text-brand-orange uppercase">{categoryName(post.categorySlug)}</p>
                <p className="font-heading text-base font-semibold text-brand-navy group-hover:text-brand-orange">{post.title}</p>
                <p className="text-sm leading-relaxed text-body-text">{post.excerpt}</p>
                <p className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{post.publishedLabel}</span>
                  <span aria-hidden="true">&middot;</span>
                  <span>{post.readTime}</span>
                </p>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border-alt bg-surface-alt px-6 py-14 text-center">
          <p className="font-heading text-base font-semibold text-brand-navy">No articles match your search</p>
          <p className="max-w-sm text-sm text-body-text">
            We publish new articles regularly. In the meantime, ask our support team directly.
          </p>
          <LeadCTAButton source="blog:empty-state" variant="outline" size="sm">
            Ask support
          </LeadCTAButton>
        </div>
      )}
    </div>
  )
}

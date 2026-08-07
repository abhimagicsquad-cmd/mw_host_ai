"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import { LeadCTAButton } from "@/components/common/lead-cta-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { KBArticle, KBCategory } from "@/types/knowledge-base"

type KnowledgeBaseExplorerProps = {
  // Only the serializable fields this client component actually renders — icons are
  // React components and can't cross the server -> client boundary as props.
  categories: Pick<KBCategory, "slug" | "name">[]
  articles: KBArticle[]
}

export function KnowledgeBaseExplorer({ categories, articles }: KnowledgeBaseExplorerProps) {
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const popularArticles = useMemo(() => articles.filter((article) => article.popular).slice(0, 5), [articles])

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return articles.filter((article) => {
      const matchesCategory = activeCategory === "all" || article.categorySlug === activeCategory
      const matchesQuery =
        normalizedQuery.length === 0 ||
        article.title.toLowerCase().includes(normalizedQuery) ||
        article.excerpt.toLowerCase().includes(normalizedQuery)

      return matchesCategory && matchesQuery
    })
  }, [articles, activeCategory, query])

  const categoryName = (slug: string) => categories.find((category) => category.slug === slug)?.name ?? slug

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="flex flex-col gap-6">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search articles — e.g. 'SSL', 'domain transfer', 'invoice'"
            aria-label="Search the knowledge base"
            className="h-11 rounded-full pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              activeCategory === "all"
                ? "border-brand-orange bg-brand-orange-accessible text-white"
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
                  ? "border-brand-orange bg-brand-orange-accessible text-white"
                  : "border-border-alt bg-background text-brand-navy hover:border-brand-orange/40"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>

        {filteredArticles.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredArticles.map((article) => (
              <div
                key={article.slug}
                className="flex flex-col gap-2 rounded-2xl border border-border-alt bg-background p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="text-muted-foreground">
                    {categoryName(article.categorySlug)}
                  </Badge>
                  {article.featured ? <Badge className="bg-brand-orange-accessible text-white">Featured</Badge> : null}
                </div>
                <p className="font-heading text-sm font-semibold text-brand-navy">{article.title}</p>
                <p className="text-sm leading-relaxed text-body-text">{article.excerpt}</p>
                <p className="mt-auto text-xs text-muted-foreground">{article.readTime}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border-alt bg-surface-alt px-6 py-14 text-center">
            <p className="font-heading text-base font-semibold text-brand-navy">No articles match your search</p>
            <p className="max-w-sm text-sm text-body-text">
              We&apos;re still building out this section. Try a different term, or ask our support team directly.
            </p>
            <LeadCTAButton source="knowledge-base:empty-state" variant="outline" size="sm">
              Ask support
            </LeadCTAButton>
          </div>
        )}
      </div>

      <aside className="flex flex-col gap-4">
        <p className="font-heading text-sm font-semibold tracking-wide text-brand-navy uppercase">Popular topics</p>
        <ul className="flex flex-col gap-3">
          {popularArticles.map((article) => (
            <li key={article.slug} className="rounded-xl border border-border-alt bg-background p-4">
              <p className="text-sm font-medium text-brand-navy">{article.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{categoryName(article.categorySlug)}</p>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}

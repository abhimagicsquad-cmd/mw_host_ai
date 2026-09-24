import type { Metadata } from "next"
import Link from "next/link"
import { Search as SearchIcon } from "lucide-react"

import { PageHero } from "@/components/sections/page-hero"
import { SectionContainer } from "@/components/layout/section-container"
import { Input } from "@/components/ui/input"
import { buildMetadata } from "@/lib/seo"
import { searchSite } from "@/lib/search-index"

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>
}

export const metadata: Metadata = buildMetadata({
  title: "Search",
  description: "Search hosting plans, domains, SSL, email hosting, blog posts, and knowledge base articles.",
  path: "/search",
  noIndex: true,
})

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams
  const results = searchSite(q)

  return (
    <>
      <PageHero
        title="Search"
        description="Find hosting plans, domains, SSL certificates, email hosting, blog posts, and knowledge base articles."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Search" }]}
      />

      <SectionContainer width="narrow">
        <form action="/search" method="get" className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search the site…"
            className="h-12 pl-11"
            autoFocus
          />
        </form>

        {q ? (
          <p className="mt-6 text-sm text-muted-foreground">
            {results.length ? `${results.length} result${results.length === 1 ? "" : "s"} for` : "No results for"}{" "}
            <span className="font-medium text-brand-navy">&ldquo;{q}&rdquo;</span>
          </p>
        ) : null}

        <ul className="mt-6 flex flex-col gap-4">
          {results.map((result) => (
            <li key={`${result.group}-${result.href}-${result.title}`}>
              <Link
                href={result.href}
                className="flex flex-col gap-1 rounded-2xl border border-border-alt bg-background p-5 transition-all hover:-translate-y-0.5 hover:border-brand-orange/30 hover:shadow-md"
              >
                <span className="text-xs font-semibold tracking-wide text-brand-orange uppercase">{result.group}</span>
                <span className="font-semibold text-brand-navy">{result.title}</span>
                <span className="text-sm text-body-text">{result.description}</span>
              </Link>
            </li>
          ))}
        </ul>

        {q && results.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Try a different search term, or <Link href="/contact-us" className="text-brand-orange underline-offset-2 hover:underline">contact us</Link> directly.
          </p>
        ) : null}
      </SectionContainer>
    </>
  )
}

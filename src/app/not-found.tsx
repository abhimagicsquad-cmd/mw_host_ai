import type { Metadata } from "next"
import Link from "@/components/common/site-link"
import { Search as SearchIcon } from "lucide-react"

import { SectionContainer } from "@/components/layout/section-container"
import { Input } from "@/components/ui/input"

import SiteLayout from "./(site)/layout"

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
}

const POPULAR_LINKS = [
  { label: "Web hosting plans", href: "/hosting" },
  { label: "WordPress hosting", href: "/hosting/wordpress-hosting" },
  { label: "VPS hosting", href: "/vps-hosting" },
  { label: "Domain search", href: "/domain/search" },
  { label: "SSL certificates", href: "/ssl" },
  { label: "Knowledge base", href: "/knowledge-base" },
  { label: "Blog", href: "/blog" },
  { label: "Contact us", href: "/contact-us" },
]

/** Branded 404 for unmatched URLs and notFound() calls — keeps the site header/footer and offers search and the main sections. */
export default function NotFound() {
  return (
    <SiteLayout>
      <SectionContainer width="narrow" className="py-16 text-center sm:py-24">
        <p className="text-sm font-semibold tracking-wide text-brand-orange uppercase">Error 404</p>
        <h1 className="mt-3 text-3xl font-bold text-brand-navy sm:text-4xl">We couldn&apos;t find that page</h1>
        <p className="mx-auto mt-4 max-w-lg text-base text-body-text">
          The link may be old or mistyped. Search the site, or jump to one of the sections below.
        </p>

        <form action="/search/" method="get" className="relative mx-auto mt-8 max-w-md">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input type="search" name="q" placeholder="Search hosting, domains, guides…" aria-label="Search the site" className="h-12 pl-11" />
        </form>

        <ul className="mx-auto mt-10 grid max-w-xl gap-3 sm:grid-cols-2">
          {POPULAR_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block rounded-xl border border-border-alt bg-background px-4 py-3 text-sm font-medium text-brand-navy transition-colors hover:border-brand-orange/40 hover:text-brand-orange"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </SectionContainer>
    </SiteLayout>
  )
}

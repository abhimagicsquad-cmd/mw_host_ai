import Link from "@/components/common/site-link"
import { ArrowRight, BookOpen } from "lucide-react"

import { SectionContainer } from "@/components/layout/section-container"

type RelatedLink = { label: string; href: string; description?: string }

type RelatedLinksSectionProps = {
  servicesTitle?: string
  services?: RelatedLink[]
  guidesTitle?: string
  guides?: RelatedLink[]
  background?: "none" | "alt"
}

/**
 * Topic-cluster links: related service pages and knowledge-base guides, with descriptive anchor
 * text, so readers (and crawlers) can move between a service and the guides that explain it.
 */
export function RelatedLinksSection({
  servicesTitle = "Related services",
  services = [],
  guidesTitle = "Guides to help you decide",
  guides = [],
  background = "alt",
}: RelatedLinksSectionProps) {
  if (!services.length && !guides.length) return null

  return (
    <SectionContainer width="wide" background={background}>
      <div className="grid gap-12 lg:grid-cols-2">
        {services.length ? (
          <div>
            <h2 className="text-lg font-semibold text-brand-navy">{servicesTitle}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex h-full flex-col gap-1 rounded-2xl border border-border-alt bg-background p-4 transition-shadow hover:shadow-md"
                  >
                    <span className="flex items-center gap-1 text-sm font-semibold text-brand-navy group-hover:text-brand-orange">
                      {link.label}
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </span>
                    {link.description ? <span className="line-clamp-2 text-sm text-body-text">{link.description}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {guides.length ? (
          <div>
            <h2 className="text-lg font-semibold text-brand-navy">{guidesTitle}</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {guides.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-start gap-3 rounded-2xl border border-border-alt bg-background p-4 transition-shadow hover:shadow-md"
                  >
                    <BookOpen className="mt-0.5 size-4 shrink-0 text-brand-orange" aria-hidden="true" />
                    <span className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-brand-navy group-hover:text-brand-orange">{link.label}</span>
                      {link.description ? <span className="line-clamp-2 text-sm text-body-text">{link.description}</span> : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </SectionContainer>
  )
}

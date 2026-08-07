import Link from "next/link"

import { CTASection } from "@/components/sections/cta-section"
import { KnowledgeBaseExplorer } from "@/components/sections/knowledge-base-explorer"
import { PageHero } from "@/components/sections/page-hero"
import { SectionContainer } from "@/components/layout/section-container"
import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { getArticlesByCategory, kbArticles, kbCategories } from "@/constants/knowledge-base-data"
import { siteConfig } from "@/constants/site-config"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Knowledge Base",
  description: "Search MagicWorks Host help articles on billing, domains, hosting, SSL, and email — or ask our support team directly.",
  path: "/knowledge-base",
})

export default function KnowledgeBasePage() {
  return (
    <>
      <PageHero
        title="How can we help?"
        description="Search our growing library of hosting, billing, and account help articles."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Knowledge Base" }]}
      />

      <SectionContainer width="wide">
        <p className="font-heading text-sm font-semibold tracking-wide text-brand-navy uppercase">Browse by category</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kbCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/knowledge-base/category/${category.slug}`}
              className="group flex items-start gap-3 rounded-2xl border border-border-alt bg-background p-5 transition-all hover:-translate-y-0.5 hover:border-brand-orange/30 hover:shadow-md"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange-accessible">
                <category.icon className="size-5" />
              </span>
              <div>
                <p className="font-heading text-sm font-semibold text-brand-navy group-hover:text-brand-orange-accessible">{category.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{category.description}</p>
                <p className="mt-1 text-xs font-medium text-brand-orange-accessible">
                  {getArticlesByCategory(category.slug).length} articles
                </p>
              </div>
            </Link>
          ))}
        </div>
      </SectionContainer>

      <SectionContainer width="wide" background="alt">
        <KnowledgeBaseExplorer
          categories={kbCategories.map(({ slug, name }) => ({ slug, name }))}
          articles={kbArticles}
        />
      </SectionContainer>

      <CTASection
        title="Can't find what you're looking for?"
        description="This library is growing every week. In the meantime, our support team is one message away."
        primaryCta={{ label: "Ask support", href: LEAD_CTA_HREF }}
        secondaryCta={{ label: "Call us", href: siteConfig.contact.phoneHref }}
        background="alt"
      />
    </>
  )
}

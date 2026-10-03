import type { Metadata } from "next"
import Link from "@/components/common/site-link"

import { CTASection } from "@/components/sections/cta-section"
import { KnowledgeBaseExplorer } from "@/components/sections/knowledge-base-explorer"
import { PageHero } from "@/components/sections/page-hero"
import { SectionContainer } from "@/components/layout/section-container"
import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { siteConfig } from "@/constants/site-config"
import { getHelpCentre } from "@/lib/help-centre"
import { buildPageMetadata } from "@/lib/seo"
import { getKnowledgeBasePage } from "@/lib/cms/queries"

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getKnowledgeBasePage()
  if (!cms?.seo?.metaTitle) {
    return buildPageMetadata({
      title: "Knowledge Base",
      description: "Guides and help articles on web hosting, WordPress, domains, SSL, security and website migration — or ask the MagicWorks Host support team directly.",
      path: "/knowledge-base",
    })
  }
  return buildPageMetadata({
    title: cms.seo.metaTitle,
    description: cms.seo.metaDescription ?? "",
    path: "/knowledge-base",
  })
}

export default async function KnowledgeBasePage() {
  const [page, helpCentre] = await Promise.all([getKnowledgeBasePage(), getHelpCentre()])

  const heroTitle = page?.heroTitle ?? "How can we help?"
  const heroDescription = page?.heroDescription ?? "Search our growing library of hosting, billing, and account help articles."

  const categories = helpCentre.categories.map((category) => ({
    ...category,
    articleCount: helpCentre.articles.filter((article) => article.categorySlug === category.slug).length,
  }))
  const explorerCategories = helpCentre.categories.map(({ slug, name }) => ({ slug, name }))
  const explorerArticles = helpCentre.articles

  return (
    <>
      <PageHero
        title={heroTitle}
        description={heroDescription}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Knowledge Base" }]}
      />

      <SectionContainer width="wide">
        <p className="text-sm font-semibold tracking-wide text-brand-navy uppercase">Browse by category</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Link
                key={category.slug}
                href={`/knowledge-base/category/${category.slug}`}
                className="group flex items-start gap-3 rounded-2xl border border-border-alt bg-background p-5 transition-all hover:-translate-y-0.5 hover:border-brand-orange/30 hover:shadow-md"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange">
                  {Icon ? <Icon className="size-5" /> : null}
                </span>
                <div>
                  <p className="text-sm font-semibold text-brand-navy group-hover:text-brand-orange">{category.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{category.description}</p>
                  <p className="mt-1 text-xs font-medium text-brand-orange">{category.articleCount} articles</p>
                </div>
              </Link>
            )
          })}
        </div>
      </SectionContainer>

      <SectionContainer width="wide" background="alt">
        <KnowledgeBaseExplorer categories={explorerCategories} articles={explorerArticles} />
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

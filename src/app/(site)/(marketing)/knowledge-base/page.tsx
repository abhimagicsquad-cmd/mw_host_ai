import type { Metadata } from "next"
import Link from "next/link"

import { CTASection } from "@/components/sections/cta-section"
import { KnowledgeBaseExplorer } from "@/components/sections/knowledge-base-explorer"
import { PageHero } from "@/components/sections/page-hero"
import { SectionContainer } from "@/components/layout/section-container"
import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { getArticlesByCategory, kbArticles, kbCategories } from "@/constants/knowledge-base-data"
import { siteConfig } from "@/constants/site-config"
import { resolveIcon } from "@/lib/icon-map"
import { buildMetadata } from "@/lib/seo"
import { getAllKBArticles, getAllKBCategories, getKnowledgeBasePage } from "@/sanity/lib/queries"

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getKnowledgeBasePage()
  if (!cms?.seo?.metaTitle) {
    return buildMetadata({
      title: "Knowledge Base",
      description: "Search MagicWorks Host help articles on billing, domains, hosting, SSL, and email — or ask our support team directly.",
      path: "/knowledge-base",
    })
  }
  return buildMetadata({
    title: cms.seo.metaTitle,
    description: cms.seo.metaDescription ?? "",
    path: "/knowledge-base",
  })
}

export default async function KnowledgeBasePage() {
  const [page, cmsCategories, cmsArticles] = await Promise.all([
    getKnowledgeBasePage(),
    getAllKBCategories(),
    getAllKBArticles(),
  ])

  const heroTitle = page?.heroTitle ?? "How can we help?"
  const heroDescription = page?.heroDescription ?? "Search our growing library of hosting, billing, and account help articles."

  const categories = cmsCategories.length
    ? cmsCategories.map((category) => ({
        slug: category.slug,
        name: category.name,
        description: category.description,
        icon: resolveIcon(category.icon),
        articleCount: cmsArticles.filter((article) => article.category.slug === category.slug).length,
      }))
    : kbCategories.map((category) => ({
        slug: category.slug,
        name: category.name,
        description: category.description,
        icon: category.icon,
        articleCount: getArticlesByCategory(category.slug).length,
      }))

  const explorerCategories = cmsCategories.length
    ? cmsCategories.map(({ slug, name }) => ({ slug, name }))
    : kbCategories.map(({ slug, name }) => ({ slug, name }))

  const explorerArticles = cmsArticles.length
    ? cmsArticles.map((article) => ({
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        categorySlug: article.category.slug,
        readTime: article.readTime,
        featured: article.featured,
        popular: article.popular,
      }))
    : kbArticles

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

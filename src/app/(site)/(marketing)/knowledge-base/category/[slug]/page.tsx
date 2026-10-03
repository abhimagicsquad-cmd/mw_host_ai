import type { Metadata } from "next"
import Link from "@/components/common/site-link"
import { notFound } from "next/navigation"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { ItemListJsonLd } from "@/components/common/json-ld"
import { LeadCTAButton } from "@/components/common/lead-cta-button"
import { CTASection } from "@/components/sections/cta-section"
import { PageHero } from "@/components/sections/page-hero"
import { SectionContainer } from "@/components/layout/section-container"
import { guideCategories } from "@/constants/kb-guides"
import { kbCategories } from "@/constants/knowledge-base-data"
import { getHelpCentre } from "@/lib/help-centre"
import { buildPageMetadata } from "@/lib/seo"
import { getAllKBCategories } from "@/lib/cms/queries"

type KBCategoryPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const cmsCategories = await getAllKBCategories()
  const slugs = new Set([...kbCategories.map((category) => category.slug), ...cmsCategories.map((c) => c.slug), ...guideCategories.map((c) => c.slug)])
  return [...slugs].map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: KBCategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = (await getHelpCentre()).categories.find((item) => item.slug === slug)
  if (!category) return {}

  return buildPageMetadata({
    title: `${category.name} Help Articles`,
    description: category.description,
    path: `/knowledge-base/category/${slug}`,
  })
}

export default async function KBCategoryPage({ params }: KBCategoryPageProps) {
  const { slug } = await params
  const { categories, articles: allArticles } = await getHelpCentre()
  const category = categories.find((item) => item.slug === slug)
  if (!category) notFound()

  const articles = allArticles.filter((article) => article.categorySlug === slug)
  const guides = articles.filter((article) => article.href)
  const otherCategories = categories.filter((item) => item.slug !== slug)

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Knowledge Base", href: "/knowledge-base" },
    { label: category.name },
  ]

  return (
    <>
      {guides.length ? <ItemListJsonLd name={`${category.name} guides`} items={guides.map((guide) => ({ name: guide.title, path: guide.href! }))} /> : null}

      <PageHero title={category.name} description={category.description} breadcrumbs={breadcrumbs} />

      <SectionContainer width="wide">
        {articles.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {articles.map((article) => {
              const className = "flex flex-col gap-2 rounded-2xl border border-border-alt bg-background p-5"
              const body = (
                <>
                  <p className="text-sm font-semibold text-brand-navy">{article.title}</p>
                  <p className="text-sm leading-relaxed text-body-text">{article.excerpt}</p>
                  <p className="mt-auto text-xs text-muted-foreground">{article.readTime}</p>
                </>
              )
              return article.href ? (
                <Link key={article.slug} href={article.href} className={`${className} transition-shadow hover:shadow-md`}>
                  {body}
                </Link>
              ) : (
                <div key={article.slug} className={className}>
                  {body}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border-alt bg-surface-alt px-6 py-14 text-center">
            <p className="text-base font-semibold text-brand-navy">No articles here yet</p>
            <p className="max-w-sm text-sm text-body-text">
              We&apos;re still writing this section. Ask our support team and we&apos;ll answer directly.
            </p>
            <LeadCTAButton source={`knowledge-base:category-empty:${slug}`} variant="outline" size="sm">
              Ask support
            </LeadCTAButton>
          </div>
        )}
      </SectionContainer>

      <SectionContainer width="wide" background="alt">
        <h2 className="text-sm font-semibold tracking-wide text-brand-navy uppercase">Other categories</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {otherCategories.map((other) => (
            <Link
              key={other.slug}
              href={`/knowledge-base/category/${other.slug}`}
              className="rounded-full border border-border-alt bg-background px-3.5 py-1.5 text-sm font-medium text-brand-navy transition-colors hover:border-brand-orange/40 hover:text-brand-orange"
            >
              {other.name}
            </Link>
          ))}
        </div>
      </SectionContainer>

      <CTASection
        title="Still stuck?"
        description="Our support team replies within a few hours, every day."
        primaryCta={{ label: "Ask support", href: LEAD_CTA_HREF }}
        background="navy"
      />
    </>
  )
}

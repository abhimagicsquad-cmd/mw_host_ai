import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { BreadcrumbJsonLd } from "@/components/common/json-ld"
import { LeadCTAButton } from "@/components/common/lead-cta-button"
import { CTASection } from "@/components/sections/cta-section"
import { PageHero } from "@/components/sections/page-hero"
import { SectionContainer } from "@/components/layout/section-container"
import { getArticlesByCategory, getKBCategory, kbCategories } from "@/constants/knowledge-base-data"
import { buildMetadata } from "@/lib/seo"
import { getAllKBCategories, getKBArticlesByCategory, getKBCategoryBySlug } from "@/sanity/lib/queries"

type KBCategoryPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const cmsCategories = await getAllKBCategories()
  const slugs = new Set([...kbCategories.map((category) => category.slug), ...cmsCategories.map((c) => c.slug)])
  return [...slugs].map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: KBCategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const cms = await getKBCategoryBySlug(slug)
  const fallback = getKBCategory(slug)

  if (!cms && !fallback) return {}

  const name = cms?.name ?? fallback!.name
  const description = cms?.description ?? fallback!.description

  return buildMetadata({
    title: `${name} Help Articles`,
    description,
    path: `/knowledge-base/category/${slug}`,
  })
}

export default async function KBCategoryPage({ params }: KBCategoryPageProps) {
  const { slug } = await params
  const [cms, cmsCategories] = await Promise.all([getKBCategoryBySlug(slug), getAllKBCategories()])
  const fallback = getKBCategory(slug)

  if (!cms && !fallback) notFound()

  const name = cms?.name ?? fallback!.name
  const description = cms?.description ?? fallback!.description

  const articles = cms
    ? (await getKBArticlesByCategory(slug)).map((article) => ({
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        readTime: article.readTime,
      }))
    : getArticlesByCategory(slug)

  const otherCategories = cms
    ? cmsCategories.filter((item) => item.slug !== slug).map(({ slug, name }) => ({ slug, name }))
    : kbCategories.filter((item) => item.slug !== slug).map(({ slug, name }) => ({ slug, name }))

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Knowledge Base", href: "/knowledge-base" },
    { label: name },
  ]

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />

      <PageHero title={name} description={description} breadcrumbs={breadcrumbs} />

      <SectionContainer width="wide">
        {articles.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {articles.map((article) => (
              <div key={article.slug} className="flex flex-col gap-2 rounded-2xl border border-border-alt bg-background p-5">
                <p className="font-heading text-sm font-semibold text-brand-navy">{article.title}</p>
                <p className="text-sm leading-relaxed text-body-text">{article.excerpt}</p>
                <p className="mt-auto text-xs text-muted-foreground">{article.readTime}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border-alt bg-surface-alt px-6 py-14 text-center">
            <p className="font-heading text-base font-semibold text-brand-navy">No articles here yet</p>
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
        <p className="font-heading text-sm font-semibold tracking-wide text-brand-navy uppercase">Other categories</p>
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

import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { CTASection } from "@/components/sections/cta-section"
import { BlogExplorer } from "@/components/sections/blog-explorer"
import { PageHero } from "@/components/sections/page-hero"
import { SectionContainer } from "@/components/layout/section-container"
import { getBlog } from "@/lib/cms/blog"
import { buildPageMetadata } from "@/lib/seo"

type BlogCategoryPageProps = {
  params: Promise<{ category: string }>
}

async function getCombinedContent() {
  const { posts, categories } = await getBlog()
  return { combinedPosts: posts, combinedCategories: categories }
}

export async function generateStaticParams() {
  const { combinedCategories } = await getCombinedContent()
  return combinedCategories.map((category) => ({ category: category.slug }))
}

export async function generateMetadata({ params }: BlogCategoryPageProps): Promise<Metadata> {
  const { category } = await params
  const { combinedCategories } = await getCombinedContent()
  const match = combinedCategories.find((c) => c.slug === category)
  if (!match) return {}

  return buildPageMetadata({
    title: `${match.name} Articles`,
    description: `${match.name} articles from the MagicWorks Host blog — practical guidance for people who run websites.`,
    path: `/blog/category/${category}`,
  })
}

export default async function BlogCategoryPage({ params }: BlogCategoryPageProps) {
  const { category } = await params
  const { combinedPosts, combinedCategories } = await getCombinedContent()

  const match = combinedCategories.find((c) => c.slug === category)
  if (!match) notFound()

  return (
    <>
      <PageHero
        title={`${match.name} articles`}
        description={`Everything we've published on ${match.name.toLowerCase()} — filter further or search across all topics below.`}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: match.name }]}
      />

      <SectionContainer width="wide">
        <BlogExplorer categories={combinedCategories} posts={combinedPosts} initialCategory={match.slug} />
      </SectionContainer>

      <CTASection
        title="Have a topic you'd like us to cover?"
        description="Let us know what you're stuck on — it might become our next article."
        primaryCta={{ label: "Suggest a topic", href: LEAD_CTA_HREF }}
        background="alt"
      />
    </>
  )
}

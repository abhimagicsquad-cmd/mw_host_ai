import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { CTASection } from "@/components/sections/cta-section"
import { BlogExplorer } from "@/components/sections/blog-explorer"
import { PageHero } from "@/components/sections/page-hero"
import { SectionContainer } from "@/components/layout/section-container"
import { inWordpressCategory, wordpressCategories } from "@/constants/blog-data"
import { getBlog } from "@/lib/cms/blog"
import { buildPageMetadata } from "@/lib/seo"

/**
 * /category/<slug>/ — a blog topic (the blog's own filters) or one of the WordPress blog's
 * category archives, kept at the same URLs WordPress used. Topics win when a slug is both.
 */
type BlogCategoryPageProps = {
  params: Promise<{ category: string }>
}

async function resolveCategory(slug: string) {
  const { posts, categories } = await getBlog()
  const topic = categories.find((c) => c.slug === slug)
  if (topic) return { name: topic.name, posts, categories, initialCategory: topic.slug }
  const archive = wordpressCategories.find((c) => c.slug === slug)
  if (archive) return { name: archive.name, posts: posts.filter((post) => inWordpressCategory(post, slug)), categories, initialCategory: undefined }
  return null
}

export async function generateStaticParams() {
  const { categories } = await getBlog()
  const slugs = new Set([...categories.map((c) => c.slug), ...wordpressCategories.map((c) => c.slug)])
  return [...slugs].map((category) => ({ category }))
}

export async function generateMetadata({ params }: BlogCategoryPageProps): Promise<Metadata> {
  const { category } = await params
  const match = await resolveCategory(category)
  if (!match) return {}

  return buildPageMetadata({
    title: `${match.name} Articles`,
    description: `${match.name} articles from the MagicWorks Host blog — practical guidance for people who run websites.`,
    path: `/blog/category/${category}`,
  })
}

export default async function BlogCategoryPage({ params }: BlogCategoryPageProps) {
  const { category } = await params
  const match = await resolveCategory(category)
  if (!match) notFound()

  return (
    <>
      <PageHero
        title={`${match.name} articles`}
        description={`Everything we've published on ${match.name.toLowerCase()} — filter further or search across all topics below.`}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: match.name }]}
      />

      <SectionContainer width="wide">
        <BlogExplorer categories={match.categories} posts={match.posts} initialCategory={match.initialCategory} />
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

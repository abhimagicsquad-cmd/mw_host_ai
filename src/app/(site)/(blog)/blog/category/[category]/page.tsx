import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { CTASection } from "@/components/sections/cta-section"
import { BlogExplorer } from "@/components/sections/blog-explorer"
import { PageHero } from "@/components/sections/page-hero"
import { SectionContainer } from "@/components/layout/section-container"
import { type BlogCategory, type BlogPost, blogCategories, blogPosts } from "@/constants/blog-data"
import { buildMetadata } from "@/lib/seo"
import { getAllBlogPosts, getBlogListingPage } from "@/sanity/lib/queries"
import type { BlogPostData } from "@/sanity/types"

type BlogCategoryPageProps = {
  params: Promise<{ category: string }>
}

function formatPublishedLabel(publishedAt: string) {
  return new Date(publishedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
}

function toBlogPost(post: BlogPostData): BlogPost {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    categorySlug: post.category?.slug ?? "uncategorized",
    readTime: post.readTime ?? "5 min read",
    publishedLabel: formatPublishedLabel(post.publishedAt),
    author: { name: post.author?.name ?? "MagicWorks Host Team", role: post.author?.role ?? "" },
    sections: [],
  }
}

async function getCombinedContent() {
  const [cms, cmsPosts] = await Promise.all([getBlogListingPage(), getAllBlogPosts()])
  const combinedPosts: BlogPost[] = [...cmsPosts.map(toBlogPost), ...blogPosts]
  const cmsCategorySlugs = new Set(combinedPosts.map((post) => post.categorySlug))
  const combinedCategories: BlogCategory[] = [
    ...blogCategories,
    ...[...cmsCategorySlugs]
      .filter((slug) => slug !== "uncategorized" && !blogCategories.some((c) => c.slug === slug))
      .map((slug) => ({ slug, name: slug })),
  ]
  return { cms, combinedPosts, combinedCategories }
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

  return buildMetadata({
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

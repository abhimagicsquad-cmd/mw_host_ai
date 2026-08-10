import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { BlogExplorer } from "@/components/sections/blog-explorer"
import { CTASection } from "@/components/sections/cta-section"
import { PageHero } from "@/components/sections/page-hero"
import { SectionContainer } from "@/components/layout/section-container"
import { type BlogCategory, blogCategories, type BlogPost, blogPosts } from "@/constants/blog-data"
import { buildMetadata } from "@/lib/seo"
import { getAllBlogPosts, getBlogListingPage } from "@/sanity/lib/queries"
import type { BlogPostData } from "@/sanity/types"

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

export async function generateMetadata() {
  const cms = await getBlogListingPage()
  return buildMetadata({
    title: cms?.title ?? "Blog",
    description: cms?.description ?? "Hosting performance, security, and WordPress articles from the MagicWorks Host team.",
    path: "/blog",
  })
}

export default async function BlogPage() {
  const [cms, cmsPosts] = await Promise.all([getBlogListingPage(), getAllBlogPosts()])

  const combinedPosts: BlogPost[] = [...cmsPosts.map(toBlogPost), ...blogPosts]
  const cmsCategorySlugs = new Set(combinedPosts.map((post) => post.categorySlug))
  const combinedCategories: BlogCategory[] = [
    ...blogCategories,
    ...[...cmsCategorySlugs]
      .filter((slug) => slug !== "uncategorized" && !blogCategories.some((c) => c.slug === slug))
      .map((slug) => ({ slug, name: slug })),
  ]

  return (
    <>
      <PageHero
        title={cms?.title ?? "Hosting, security, and performance — in plain language"}
        description={cms?.description ?? "Practical articles for people who run websites, not server administrators."}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]}
      />

      <SectionContainer width="wide">
        <BlogExplorer categories={combinedCategories} posts={combinedPosts} />
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

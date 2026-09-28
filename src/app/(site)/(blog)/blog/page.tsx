import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { BlogExplorer } from "@/components/sections/blog-explorer"
import { CTASection } from "@/components/sections/cta-section"
import { PageHero } from "@/components/sections/page-hero"
import { SectionContainer } from "@/components/layout/section-container"
import { getBlog } from "@/lib/cms/blog"
import { buildPageMetadata } from "@/lib/seo"

export async function generateMetadata() {
  // The listing's `title` is the on-page heading; the <title> tag is managed under SEO.
  const { listing } = await getBlog()
  return buildPageMetadata({
    title: listing?.seo?.metaTitle ?? "Blog",
    description: listing?.seo?.metaDescription ?? "Hosting performance, security, and WordPress articles from the MagicWorks Host team.",
    path: "/blog",
  })
}

export default async function BlogPage() {
  const { listing, posts, categories } = await getBlog()

  return (
    <>
      <PageHero
        title={listing?.title ?? "Hosting, security, and performance — in plain language"}
        description={listing?.description ?? "Practical articles for people who run websites, not server administrators."}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]}
      />

      <SectionContainer width="wide">
        <BlogExplorer categories={categories} posts={posts} />
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

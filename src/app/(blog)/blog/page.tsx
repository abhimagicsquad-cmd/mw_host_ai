import type { Metadata } from "next"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { BlogExplorer } from "@/components/sections/blog-explorer"
import { CTASection } from "@/components/sections/cta-section"
import { PageHero } from "@/components/sections/page-hero"
import { SectionContainer } from "@/components/layout/section-container"
import { blogCategories, blogPosts } from "@/constants/blog-data"
import { siteConfig } from "@/constants/site-config"

export const metadata: Metadata = {
  title: `Blog | ${siteConfig.name}`,
  description: "Hosting performance, security, and WordPress articles from the MagicWorks Host team.",
}

export default function BlogPage() {
  return (
    <>
      <PageHero
        title="Hosting, security, and performance — in plain language"
        description="Practical articles for people who run websites, not server administrators."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]}
      />

      <SectionContainer width="wide">
        <BlogExplorer categories={blogCategories} posts={blogPosts} />
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

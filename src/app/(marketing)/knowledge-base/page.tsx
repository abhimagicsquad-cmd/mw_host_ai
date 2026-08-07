import type { Metadata } from "next"

import { CTASection } from "@/components/sections/cta-section"
import { KnowledgeBaseExplorer } from "@/components/sections/knowledge-base-explorer"
import { PageHero } from "@/components/sections/page-hero"
import { SectionContainer } from "@/components/layout/section-container"
import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { kbArticles, kbCategories } from "@/constants/knowledge-base-data"
import { siteConfig } from "@/constants/site-config"

export const metadata: Metadata = {
  title: `Knowledge Base | ${siteConfig.name}`,
  description: "Search MagicWorks Host help articles on billing, domains, hosting, SSL, and email — or ask our support team directly.",
}

export default function KnowledgeBasePage() {
  return (
    <>
      <PageHero
        title="How can we help?"
        description="Search our growing library of hosting, billing, and account help articles."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Knowledge Base" }]}
      />

      <SectionContainer width="wide">
        <KnowledgeBaseExplorer
          categories={kbCategories.map(({ slug, name }) => ({ slug, name }))}
          articles={kbArticles}
        />
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

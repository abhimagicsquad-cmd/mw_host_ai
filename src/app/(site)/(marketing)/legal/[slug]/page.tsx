import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { SectionContainer } from "@/components/layout/section-container"
import { CTASection } from "@/components/sections/cta-section"
import { PageHero } from "@/components/sections/page-hero"
import { legalDocuments, legalSlugs } from "@/constants/legal-content"
import { buildMetadata } from "@/lib/seo"
import { getAllLegalSlugs, getLegalPage } from "@/sanity/lib/queries"

type LegalPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const cmsSlugs = await getAllLegalSlugs()
  const slugs = new Set([...legalSlugs, ...cmsSlugs])
  return [...slugs].map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const { slug } = await params
  const cms = await getLegalPage(slug)
  const fallback = legalDocuments[slug]

  if (!cms && !fallback) return {}

  return buildMetadata({
    title: cms?.title ?? fallback!.title,
    description: cms?.summary ?? fallback!.summary,
    path: `/legal/${slug}`,
  })
}

export default async function LegalPage({ params }: LegalPageProps) {
  const { slug } = await params
  const cms = await getLegalPage(slug)
  const fallback = legalDocuments[slug]

  if (!cms && !fallback) notFound()

  const title = cms?.title ?? fallback!.title
  const summary = cms?.summary ?? fallback!.summary
  const lastUpdated = cms?.lastUpdated ?? fallback!.lastUpdated
  const sections = cms?.sections ?? fallback!.sections

  return (
    <>
      <PageHero
        title={title}
        description={summary}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Legal" }, { label: title }]}
      />

      <SectionContainer width="narrow">
        <p className="mb-8 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        <div className="flex flex-col gap-8">
          {sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-xl font-semibold text-brand-navy">{section.heading}</h2>
              <div className="mt-3 flex flex-col gap-3 text-base leading-relaxed text-body-text">
                {section.body.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionContainer>

      <CTASection
        title="Questions about our policies?"
        description="Our team is happy to walk through any of this in plain language."
        primaryCta={{ label: "Contact us", href: LEAD_CTA_HREF }}
        background="alt"
      />
    </>
  )
}

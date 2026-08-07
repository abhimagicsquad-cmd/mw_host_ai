import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { SectionContainer } from "@/components/layout/section-container"
import { CTASection } from "@/components/sections/cta-section"
import { PageHero } from "@/components/sections/page-hero"
import { legalDocuments, legalSlugs } from "@/constants/legal-content"
import { buildMetadata } from "@/lib/seo"

type LegalPageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return legalSlugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const { slug } = await params
  const doc = legalDocuments[slug]

  if (!doc) return {}

  return buildMetadata({
    title: doc.title,
    description: doc.summary,
    path: `/legal/${doc.slug}`,
  })
}

export default async function LegalPage({ params }: LegalPageProps) {
  const { slug } = await params
  const doc = legalDocuments[slug]

  if (!doc) notFound()

  return (
    <>
      <PageHero
        title={doc.title}
        description={doc.summary}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Legal" }, { label: doc.title }]}
      />

      <SectionContainer width="narrow">
        <p className="mb-8 text-sm text-muted-foreground">Last updated: {doc.lastUpdated}</p>
        <div className="flex flex-col gap-8">
          {doc.sections.map((section) => (
            <div key={section.heading}>
              <h2 className="font-heading text-xl font-semibold text-brand-navy">{section.heading}</h2>
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

import type { Metadata } from "next"
import Link from "@/components/common/site-link"
import { notFound } from "next/navigation"
import { ArrowRight, Check, Lightbulb } from "lucide-react"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { GuideArticleJsonLd } from "@/components/common/json-ld"
import { LeadCTAButton } from "@/components/common/lead-cta-button"
import { SectionContainer } from "@/components/layout/section-container"
import { CTASection } from "@/components/sections/cta-section"
import { FAQSection } from "@/components/sections/faq-section"
import { PageHero } from "@/components/sections/page-hero"
import { RelatedLinksSection } from "@/components/sections/related-links-section"
import { getGuide, guideCategoryName, guideHref, kbGuides, type GuideBlock } from "@/constants/kb-guides"
import { serviceLinkFor } from "@/constants/service-links"
import { buildPageMetadata } from "@/lib/seo"

type GuidePageProps = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return kbGuides.map((guide) => ({ slug: guide.slug }))
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const guide = getGuide((await params).slug)
  if (!guide) return {}
  return buildPageMetadata({
    title: guide.metaTitle ?? guide.title,
    description: guide.description,
    path: guideHref(guide.slug),
    ogType: "article",
    publishedTime: guide.updated,
    modifiedTime: guide.updated,
  })
}

const headingId = (heading: string) =>
  heading
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")

const formatDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })

function Block({ block }: { block: GuideBlock }) {
  if (typeof block === "string") return <p className="text-base leading-relaxed text-body-text">{block}</p>
  if ("list" in block) {
    const ListTag = block.ordered ? "ol" : "ul"
    return (
      <ListTag className={block.ordered ? "flex list-decimal flex-col gap-2 pl-5 text-base leading-relaxed text-body-text marker:font-semibold marker:text-brand-navy" : "flex flex-col gap-2"}>
        {block.list.map((item) =>
          block.ordered ? (
            <li key={item} className="pl-1">
              {item}
            </li>
          ) : (
            <li key={item} className="flex items-start gap-2 text-base leading-relaxed text-body-text">
              <Check className="mt-1 size-4 shrink-0 text-brand-orange" aria-hidden="true" />
              <span>{item}</span>
            </li>
          )
        )}
      </ListTag>
    )
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-border-alt">
      <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
        <thead className="bg-surface-alt">
          <tr>
            {block.table.headers.map((header) => (
              <th key={header} scope="col" className="px-4 py-3 font-semibold text-brand-navy">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.table.rows.map((row) => (
            <tr key={row.join("|")} className="border-t border-border-alt">
              {row.map((cell, index) =>
                index === 0 ? (
                  <th key={index} scope="row" className="px-4 py-3 align-top font-medium text-brand-navy">
                    {cell}
                  </th>
                ) : (
                  <td key={index} className="px-4 py-3 align-top text-body-text">
                    {cell}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * A long-form knowledge-base guide: answer-first summary (featured-snippet / AI-answer block,
 * marked speakable), key takeaways, the article with a table of contents, FAQs, and links into
 * the related services and guides (topic cluster), with a help CTA alongside.
 */
export default async function GuidePage({ params }: GuidePageProps) {
  const guide = getGuide((await params).slug)
  if (!guide) notFound()

  const category = guideCategoryName(guide.categorySlug)
  const path = guideHref(guide.slug)
  const services = guide.relatedServices.map((link) => ({ ...link, description: serviceLinkFor(link.href)?.description }))
  const relatedGuides = guide.relatedGuides
    .map(getGuide)
    .filter((related) => related !== undefined)
    .map((related) => ({ label: related.title, href: guideHref(related.slug), description: related.excerpt }))
  const primaryService = services[0]

  return (
    <>
      <GuideArticleJsonLd
        title={guide.title}
        description={guide.description}
        path={path}
        dateModified={guide.updated}
        section={category}
        about={[category, ...guide.relatedServices.slice(0, 2).map((link) => link.label)]}
      />

      <PageHero
        title={guide.title}
        description={guide.excerpt}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Knowledge Base", href: "/knowledge-base" },
          { label: category, href: `/knowledge-base/category/${guide.categorySlug}` },
          { label: guide.title },
        ]}
      />

      <SectionContainer width="wide">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
          <article className="min-w-0">
            <p className="text-sm text-muted-foreground">
              {guide.readTime} · Updated <time dateTime={guide.updated}>{formatDate(guide.updated)}</time> · By the MagicWorks Host team
            </p>

            <div className="mt-6 rounded-2xl border border-brand-orange/25 bg-brand-orange/5 p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-brand-orange uppercase">
                <Lightbulb className="size-4" aria-hidden="true" />
                Quick answer
              </h2>
              <p data-speakable className="mt-3 text-base leading-relaxed text-brand-navy">
                {guide.answer}
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold text-brand-navy">Key takeaways</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {guide.keyTakeaways.map((takeaway) => (
                  <li key={takeaway} className="flex items-start gap-2 text-base leading-relaxed text-body-text">
                    <Check className="mt-1 size-4 shrink-0 text-brand-orange" aria-hidden="true" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>

            {guide.sections.map((section) => (
              <section key={section.heading} aria-labelledby={headingId(section.heading)} className="mt-10 flex scroll-mt-28 flex-col gap-4">
                <h2 id={headingId(section.heading)} className="text-2xl font-bold text-brand-navy">
                  {section.heading}
                </h2>
                {section.body.map((block, index) => (
                  <Block key={index} block={block} />
                ))}
              </section>
            ))}

            {primaryService ? (
              <div className="mt-12 flex flex-col gap-4 rounded-2xl bg-brand-navy p-6 text-white sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-semibold">Ready to put this into practice?</p>
                  <p className="mt-1 text-sm text-white/70">{primaryService.description ?? `See ${primaryService.label} from MagicWorks Host.`}</p>
                </div>
                <Link
                  href={primaryService.href}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-orange/90"
                >
                  {primaryService.label}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            ) : null}
          </article>

          <aside className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
            <nav aria-label="In this guide" className="rounded-2xl border border-border-alt bg-surface-alt p-5">
              <h2 className="text-sm font-semibold tracking-wide text-brand-navy uppercase">In this guide</h2>
              <ol className="mt-3 flex flex-col gap-2">
                {guide.sections.map((section) => (
                  <li key={section.heading}>
                    <a href={`#${headingId(section.heading)}`} className="text-sm text-body-text hover:text-brand-orange">
                      {section.heading}
                    </a>
                  </li>
                ))}
                <li>
                  <a href="#faqs" className="text-sm text-body-text hover:text-brand-orange">
                    Frequently asked questions
                  </a>
                </li>
              </ol>
            </nav>

            <div className="rounded-2xl border border-border-alt bg-background p-5">
              <h2 className="text-base font-semibold text-brand-navy">Need a hand?</h2>
              <p className="mt-2 text-sm text-body-text">Our team answers hosting, domain and website questions by phone and ticket, 24/7.</p>
              <div className="mt-4">
                <LeadCTAButton source={`guide:${guide.slug}`} size="sm">
                  Talk to an expert
                </LeadCTAButton>
              </div>
            </div>
          </aside>
        </div>
      </SectionContainer>

      <div id="faqs" className="scroll-mt-28">
        <FAQSection eyebrow="FAQs" title="Frequently asked questions" items={guide.faqs} background="alt" />
      </div>

      <RelatedLinksSection servicesTitle="Related services" services={services} guidesTitle="Keep reading" guides={relatedGuides} background="none" />

      <CTASection
        title="Have a question this guide didn't answer?"
        description="Ask our support team — they reply within a few hours, every day."
        primaryCta={{ label: "Ask support", href: LEAD_CTA_HREF }}
        secondaryCta={{ label: "Browse the knowledge base", href: "/knowledge-base" }}
        background="navy"
      />
    </>
  )
}

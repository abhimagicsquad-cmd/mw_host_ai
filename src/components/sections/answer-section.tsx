import Link from "@/components/common/site-link"
import { ArrowRight, BookOpen, Check } from "lucide-react"

import { HowToJsonLd } from "@/components/common/json-ld"
import { SectionContainer } from "@/components/layout/section-container"
import { blogPosts, getBlogCategoryName } from "@/constants/blog-data"
import { guideHref, guidesForService } from "@/constants/kb-guides"
import { gettingStartedSteps, serviceAnswers } from "@/constants/service-answers"

type AnswerSectionProps = {
  /** The page path, used to look up its answer block in serviceAnswers. */
  path: string
  kind: Parameters<typeof gettingStartedSteps>[0]
  /** Product name used in the HowTo title, e.g. "WordPress Hosting". */
  label: string
}

/**
 * Answer-first block for product pages: a direct definition of the page's core question, key
 * facts, "how to get started" steps and the related articles in the page's topic cluster.
 * Renders nothing for pages without an entry.
 */
export function AnswerSection({ path, kind, label }: AnswerSectionProps) {
  const entry = serviceAnswers[path]
  if (!entry) return null

  const steps = gettingStartedSteps(kind)
  const articles = blogPosts.filter((post) => post.categorySlug === entry.topic).slice(0, 3)
  const guides = guidesForService(path)

  return (
    <SectionContainer width="default">
      <HowToJsonLd name={`How to get started with ${label}`} steps={steps} />
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="text-2xl font-bold text-brand-navy sm:text-3xl">{entry.question}</h2>
          <p data-speakable className="mt-4 text-base leading-relaxed text-body-text">
            {entry.answer}
          </p>
          <ul className="mt-5 flex flex-col gap-2">
            {entry.facts.map((fact) => (
              <li key={fact} className="flex items-start gap-2 text-sm text-body-text">
                <Check className="mt-0.5 size-4 shrink-0 text-brand-orange" aria-hidden="true" />
                {fact}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border-alt bg-surface-alt p-6">
          <h2 className="text-lg font-semibold text-brand-navy">How to get started</h2>
          <ol className="mt-4 flex flex-col gap-4">
            {steps.map((step, index) => (
              <li key={step.name} className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-brand-navy">{step.name}</p>
                  <p className="mt-1 text-sm text-body-text">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {guides.length > 0 ? (
        <div className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-lg font-semibold text-brand-navy">Guides to help you choose</h2>
            <Link href="/knowledge-base" className="flex items-center gap-1 text-sm font-medium text-brand-orange hover:underline">
              Knowledge base
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {guides.map((guide) => (
              <li key={guide.slug}>
                <Link
                  href={guideHref(guide.slug)}
                  className="flex h-full flex-col gap-2 rounded-2xl border border-border-alt bg-surface-alt p-5 transition-shadow hover:shadow-md"
                >
                  <span className="flex items-start gap-2 text-sm font-semibold text-brand-navy">
                    <BookOpen className="mt-0.5 size-4 shrink-0 text-brand-orange" aria-hidden="true" />
                    {guide.title}
                  </span>
                  <span className="line-clamp-2 text-sm text-body-text">{guide.excerpt}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {articles.length > 0 ? (
        <div className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-lg font-semibold text-brand-navy">Learn more about {getBlogCategoryName(entry.topic)}</h2>
            <Link href={`/blog/category/${entry.topic}`} className="flex items-center gap-1 text-sm font-medium text-brand-orange hover:underline">
              All {getBlogCategoryName(entry.topic)} articles
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {articles.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="flex h-full flex-col gap-2 rounded-2xl border border-border-alt bg-background p-5 transition-shadow hover:shadow-md"
                >
                  <span className="text-sm font-semibold text-brand-navy">{post.title}</span>
                  <span className="line-clamp-2 text-sm text-body-text">{post.excerpt}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </SectionContainer>
  )
}

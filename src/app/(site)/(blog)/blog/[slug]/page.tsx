import type { Metadata } from "next"
import { PortableText } from "@portabletext/react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { BlogPostingJsonLd, BreadcrumbJsonLd } from "@/components/common/json-ld"
import { Reveal } from "@/components/common/reveal"
import { SectionContainer } from "@/components/layout/section-container"
import { CTASection } from "@/components/sections/cta-section"
import { blogPosts, getBlogCategoryName, getBlogPost, getRelatedPosts } from "@/constants/blog-data"
import { buildMetadata } from "@/lib/seo"
import { getAllBlogPosts, getBlogPostBySlug } from "@/sanity/lib/queries"

type BlogPostPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const cmsPosts = await getAllBlogPosts()
  const slugs = new Set([...blogPosts.map((post) => post.slug), ...cmsPosts.map((post) => post.slug)])
  return [...slugs].map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const cmsPost = await getBlogPostBySlug(slug)

  if (cmsPost) {
    return buildMetadata({
      title: cmsPost.seo?.metaTitle ?? cmsPost.title,
      description: cmsPost.seo?.metaDescription ?? cmsPost.excerpt,
      path: `/blog/${cmsPost.slug}`,
      ogType: "article",
      publishedTime: cmsPost.publishedAt,
    })
  }

  const post = getBlogPost(slug)
  if (!post) return {}

  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    ogType: "article",
    publishedTime: publishedLabelToISO(post.publishedLabel),
  })
}

/** Approximates an ISO date from the human-readable "Jan 2026" label the local fallback posts use — accurate to the month, which is the same granularity already shown to readers. */
function publishedLabelToISO(label: string): string | undefined {
  const parsed = new Date(`1 ${label}`)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString()
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const cmsPost = await getBlogPostBySlug(slug)

  if (cmsPost) {
    const breadcrumbs = [
      { label: "Home", href: "/" },
      { label: "Blog", href: "/blog" },
      { label: cmsPost.title },
    ]

    return (
      <>
        <BreadcrumbJsonLd items={breadcrumbs} />
        <BlogPostingJsonLd title={cmsPost.title} description={cmsPost.excerpt} slug={cmsPost.slug} authorName={cmsPost.author?.name ?? "MagicWorks Host Team"} />

        <SectionContainer width="narrow" background="alt" className="py-12 sm:py-16">
          <Reveal className="flex flex-col gap-4">
            <Link href="/blog" className="flex items-center gap-1.5 text-sm font-medium text-brand-orange hover:underline">
              <ArrowLeft className="size-4" />
              Back to blog
            </Link>
            {cmsPost.category ? (
              <Link
                href={`/blog/category/${cmsPost.category.slug}`}
                className="w-fit rounded-full border border-brand-orange/20 bg-brand-orange/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-brand-orange uppercase transition-colors hover:bg-brand-orange/20"
              >
                {cmsPost.category.title}
              </Link>
            ) : null}
            <h1 className="font-heading text-3xl font-bold text-brand-navy sm:text-4xl">{cmsPost.title}</h1>
            <p className="text-lg text-body-text">{cmsPost.excerpt}</p>
            {cmsPost.author ? (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{cmsPost.author.name}</span>
                {cmsPost.readTime ? (
                  <>
                    <span aria-hidden="true">&middot;</span>
                    <span>{cmsPost.readTime}</span>
                  </>
                ) : null}
              </div>
            ) : null}
          </Reveal>
        </SectionContainer>

        <SectionContainer width="narrow">
          <article className="prose prose-slate max-w-none">
            <PortableText value={cmsPost.body} />
          </article>
        </SectionContainer>

        <CTASection
          title="Want help putting this into practice?"
          description="Our support team can walk through any of this on your actual site."
          primaryCta={{ label: "Talk to us", href: LEAD_CTA_HREF }}
          background="navy"
        />
      </>
    )
  }

  const post = getBlogPost(slug)

  if (!post) notFound()

  const relatedPosts = getRelatedPosts(post)
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: post.title },
  ]

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <BlogPostingJsonLd title={post.title} description={post.excerpt} slug={post.slug} authorName={post.author.name} />

      <SectionContainer width="narrow" background="alt" className="py-12 sm:py-16">
        <Reveal className="flex flex-col gap-4">
          <Link href="/blog" className="flex items-center gap-1.5 text-sm font-medium text-brand-orange hover:underline">
            <ArrowLeft className="size-4" />
            Back to blog
          </Link>
          <Link
            href={`/blog/category/${post.categorySlug}`}
            className="w-fit rounded-full border border-brand-orange/20 bg-brand-orange/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-brand-orange uppercase transition-colors hover:bg-brand-orange/20"
          >
            {getBlogCategoryName(post.categorySlug)}
          </Link>
          <h1 className="font-heading text-3xl font-bold text-brand-navy sm:text-4xl">{post.title}</h1>
          <p className="text-lg text-body-text">{post.excerpt}</p>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex size-8 items-center justify-center rounded-full bg-brand-navy/10 text-xs font-semibold text-brand-navy">
              {post.author.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")}
            </span>
            <span>{post.author.name}</span>
            <span aria-hidden="true">&middot;</span>
            <span>{post.publishedLabel}</span>
            <span aria-hidden="true">&middot;</span>
            <span>{post.readTime}</span>
          </div>
        </Reveal>
      </SectionContainer>

      <SectionContainer width="narrow">
        <div className="rounded-2xl border border-border-alt bg-surface-alt p-6">
          <p className="font-heading text-sm font-semibold tracking-wide text-brand-navy uppercase">On this page</p>
          <ul className="mt-3 flex flex-col gap-2">
            {post.sections.map((section, index) => (
              <li key={section.heading}>
                <a href={`#${slugifyHeading(section.heading)}`} className="text-sm text-body-text hover:text-brand-orange">
                  {index + 1}. {section.heading}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <article className="mt-10 flex flex-col gap-10">
          {post.sections.map((section) => (
            <div key={section.heading} id={slugifyHeading(section.heading)}>
              <h2 className="font-heading text-xl font-semibold text-brand-navy">{section.heading}</h2>
              <div className="mt-3 flex flex-col gap-3 text-base leading-relaxed text-body-text">
                {section.body.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          ))}
        </article>

        <div className="mt-12 flex items-center gap-4 rounded-2xl border border-border-alt bg-background p-6">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-navy/10 text-sm font-semibold text-brand-navy">
            {post.author.name
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")}
          </span>
          <div>
            <p className="font-heading text-sm font-semibold text-brand-navy">{post.author.name}</p>
            <p className="text-sm text-muted-foreground">{post.author.role} at MagicWorks Host</p>
          </div>
        </div>
      </SectionContainer>

      {relatedPosts.length > 0 ? (
        <SectionContainer width="wide" background="alt">
          <p className="font-heading text-sm font-semibold tracking-wide text-brand-navy uppercase">Related articles</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {relatedPosts.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="flex flex-col gap-2 rounded-2xl border border-border-alt bg-background p-6 transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <p className="text-xs font-semibold tracking-wide text-brand-orange uppercase">{getBlogCategoryName(related.categorySlug)}</p>
                <p className="font-heading text-sm font-semibold text-brand-navy">{related.title}</p>
                <p className="text-sm text-body-text">{related.excerpt}</p>
              </Link>
            ))}
          </div>
        </SectionContainer>
      ) : null}

      <CTASection
        title="Want help putting this into practice?"
        description="Our support team can walk through any of this on your actual site."
        primaryCta={{ label: "Talk to us", href: LEAD_CTA_HREF }}
        background="navy"
      />
    </>
  )
}

function slugifyHeading(heading: string) {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
}

import type { Metadata } from "next"
import Image from "next/image"
import Link from "@/components/common/site-link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { BlogPostingJsonLd, BreadcrumbJsonLd } from "@/components/common/json-ld"
import { Reveal } from "@/components/common/reveal"
import { SectionContainer } from "@/components/layout/section-container"
import { CTASection } from "@/components/sections/cta-section"
import type { BlogImage } from "@/constants/blog-data"
import { paragraphParts, parseImageParagraph, plainText, postShareImage } from "@/lib/blog-content"
import { getBlog } from "@/lib/cms/blog"
import { buildPageMetadata } from "@/lib/seo"

type BlogPostPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const { posts } = await getBlog()
  return posts.map((post) => ({ slug: post.slug }))
}

/** The published post at this slug (see getBlog — the dashboard is the source). */
async function resolvePost(slug: string) {
  const blog = await getBlog()
  const post = blog.posts.find((candidate) => candidate.slug === slug)
  return { blog, post }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const { post } = await resolvePost(slug)

  if (!post) return {}

  const image = postShareImage(post)
  return buildPageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    ogType: "article",
    publishedTime: post.publishedAt ?? publishedLabelToISO(post.publishedLabel),
    modifiedTime: post.modifiedAt ?? undefined,
    ...(image ? { image: { url: image.src, width: image.width, height: image.height, alt: image.alt } } : {}),
  })
}

/** Approximates an ISO date from the human-readable "Jan 2026" label the local fallback posts use — accurate to the month, which is the same granularity already shown to readers. */
function publishedLabelToISO(label: string): string | undefined {
  const parsed = new Date(`1 ${label}`)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString()
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const { blog, post } = await resolvePost(slug)

  if (!post) notFound()

  const relatedPosts = blog.related(post)
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: post.title },
  ]

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <BlogPostingJsonLd
        title={post.title}
        description={post.excerpt}
        slug={post.slug}
        authorName={post.author.name}
        datePublished={post.publishedAt ?? publishedLabelToISO(post.publishedLabel)}
        dateModified={post.modifiedAt}
        wordCount={post.sections.reduce((count, section) => count + section.body.map(plainText).join(" ").split(/\s+/).filter(Boolean).length, 0)}
        section={blog.categoryName(post.categorySlug)}
        image={postShareImage(post)?.src}
      />

      <SectionContainer width="narrow" background="alt" className="py-12 sm:py-16">
        <Reveal className="flex flex-col gap-4">
          <Link href="/blog" className="flex items-center gap-1.5 text-sm font-medium text-brand-orange hover:underline">
            <ArrowLeft className="size-4" />
            Back to blog
          </Link>
          <Link
            href={`/blog/category/${post.categorySlug}`}
            className="w-fit rounded-full border border-brand-orange/30 bg-background px-3.5 py-1.5 text-xs font-semibold tracking-wide text-brand-orange uppercase transition-colors hover:bg-brand-orange/10"
          >
            {blog.categoryName(post.categorySlug)}
          </Link>
          <h1 className="text-3xl font-bold text-brand-navy sm:text-4xl">{post.title}</h1>
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
        {post.featuredImage ? <BlogFigure image={post.featuredImage} eager className="mb-10" /> : null}

        <div className="rounded-2xl border border-border-alt bg-surface-alt p-6">
          <p className="text-sm font-semibold tracking-wide text-brand-navy uppercase">On this page</p>
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
              <h2 className="text-xl font-semibold text-brand-navy">{section.heading}</h2>
              <div className="mt-3 flex flex-col gap-3 text-base leading-relaxed text-body-text">
                {section.body.map((paragraph, index) => {
                  const image = parseImageParagraph(paragraph)
                  return image ? <BlogFigure key={index} image={image} className="my-2" /> : <Paragraph key={index} text={paragraph} />
                })}
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
            <p className="text-sm font-semibold text-brand-navy">{post.author.name}</p>
            <p className="text-sm text-muted-foreground">{post.author.role ? `${post.author.role} at MagicWorks Host` : "MagicWorks Host"}</p>
          </div>
        </div>
      </SectionContainer>

      {relatedPosts.length > 0 ? (
        <SectionContainer width="wide" background="alt">
          <p className="text-sm font-semibold tracking-wide text-brand-navy uppercase">Related articles</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {relatedPosts.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="flex flex-col gap-2 rounded-2xl border border-border-alt bg-background p-6 transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <p className="text-xs font-semibold tracking-wide text-brand-orange uppercase">{blog.categoryName(related.categorySlug)}</p>
                <p className="text-sm font-semibold text-brand-navy">{related.title}</p>
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

/** Images show at their own width, never wider than the column — small images aren't stretched (and blurred). */
const IMAGE_CLASS = "mx-auto h-auto max-w-full rounded-2xl border border-border-alt"
/** The article column: 720px wide from the sm breakpoint, the viewport less the 16px gutters below it. */
const COLUMN_WIDTH = 720
/** Above the default 75: the WordPress originals are already compressed JPEGs, and re-encoding them at 75 softens them. */
const BLOG_IMAGE_QUALITY = 90

function BlogFigure({ image, eager, className }: { image: BlogImage; eager?: boolean; className?: string }) {
  const shown = Math.min(image.width ?? COLUMN_WIDTH, COLUMN_WIDTH)
  return (
    <figure className={className}>
      {image.width && image.height ? (
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes={`(min-width: ${shown + 48}px) ${shown}px, calc(100vw - 32px)`}
          quality={BLOG_IMAGE_QUALITY}
          loading={eager ? "eager" : "lazy"}
          className={IMAGE_CLASS}
        />
      ) : (
        // No known size (a dashboard post's image): the optimizer needs one, so load it as is.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image.src} alt={image.alt} loading={eager ? "eager" : "lazy"} className={IMAGE_CLASS} />
      )}
    </figure>
  )
}

/** A paragraph with its `[anchor](href)` links; links off the site open in a new tab. */
function Paragraph({ text }: { text: string }) {
  return (
    <p>
      {paragraphParts(text).map((part, index) =>
        !part.href ? (
          part.text
        ) : part.href.startsWith("/") ? (
          <Link key={index} href={part.href} className="font-medium text-brand-orange underline-offset-2 hover:underline">
            {part.text}
          </Link>
        ) : (
          <a key={index} href={part.href} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-orange underline-offset-2 hover:underline">
            {part.text}
          </a>
        )
      )}
    </p>
  )
}

function slugifyHeading(heading: string) {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
}

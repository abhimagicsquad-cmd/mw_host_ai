import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { CmsSchemaJsonLd } from "@/components/common/cms-schema-json-ld"
import { PageBuilder } from "@/components/page-builder/page-builder"
import { getPublishedCmsPage, getPublishedCmsPaths, isTemplateSection } from "@/lib/cms/content"
import { templateForPath } from "@/lib/cms/templates"
import { buildPageMetadata } from "@/lib/seo"
import { getCmsBuilderDocument } from "@/lib/cms/queries"

import BlogPostPage, { generateMetadata as blogPostMetadata, generateStaticParams as blogPostStaticParams } from "../(blog)/blog-post"

/**
 * Root-level URLs that aren't a coded route (every coded route takes precedence):
 * 1. pages created in the admin CMS at their own URL (e.g. /cloud-hosting/);
 * 2. blog posts, which live at /<slug>/ exactly like the WordPress site.
 * Anything else 404s.
 */
type CmsPageProps = { params: Promise<{ slug: string[] }> }

function toPath(slug: string[]) {
  return `/${slug.map((part) => decodeURIComponent(part)).join("/")}`.toLowerCase()
}

async function builderPage(path: string) {
  const page = await getPublishedCmsPage(path)
  // Template pages (service, legal, blog…) are rendered by their own routes, never here.
  if (!page || templateForPath(path) || page.sections.every(isTemplateSection)) return null
  return page
}

/** The blog post a single-segment URL refers to, if any. */
function postParams(slug: string[]) {
  return slug.length === 1 ? { params: Promise.resolve({ slug: decodeURIComponent(slug[0]).toLowerCase() }) } : null
}

export async function generateStaticParams() {
  const [paths, posts] = await Promise.all([getPublishedCmsPaths(), blogPostStaticParams()])
  return [
    ...paths.filter((page) => page.path !== "/" && !templateForPath(page.path)).map((page) => ({ slug: page.path.slice(1).split("/") })),
    ...posts.map((post) => ({ slug: [post.slug] })),
  ]
}

export async function generateMetadata({ params }: CmsPageProps): Promise<Metadata> {
  const { slug } = await params
  const path = toPath(slug)
  const page = await builderPage(path)
  if (page) return buildPageMetadata({ title: page.title, description: page.excerpt ?? "", path })
  const post = postParams(slug)
  return post ? blogPostMetadata(post) : {}
}

export default async function CmsPage({ params }: CmsPageProps) {
  const { slug } = await params
  const path = toPath(slug)
  if (!(await builderPage(path))) {
    const post = postParams(slug)
    if (post) return BlogPostPage(post)
    notFound()
  }
  const doc = await getCmsBuilderDocument(path)
  if (!doc?.pageBuilder?.length) notFound()

  return (
    <>
      <CmsSchemaJsonLd path={path} />
      <PageBuilder blocks={doc.pageBuilder} />
    </>
  )
}

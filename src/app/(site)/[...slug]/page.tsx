import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { CmsSchemaJsonLd } from "@/components/common/cms-schema-json-ld"
import { PageBuilder } from "@/components/sanity/page-builder"
import { getPublishedCmsPage, getPublishedCmsPaths, isTemplateSection } from "@/lib/cms/content"
import { templateForPath } from "@/lib/cms/templates"
import { buildPageMetadata } from "@/lib/seo"
import { getCmsBuilderDocument } from "@/sanity/lib/queries"

/**
 * Serves pages created in the admin CMS at their own URL (e.g. /cloud-hosting). Every
 * coded route takes precedence over this catch-all, so it only ever handles URLs that
 * don't already exist — anything else 404s as before.
 */
type CmsPageProps = { params: Promise<{ slug: string[] }> }

function toPath(slug: string[]) {
  return `/${slug.map((part) => decodeURIComponent(part)).join("/")}`.toLowerCase()
}

export async function generateStaticParams() {
  const paths = await getPublishedCmsPaths()
  return paths
    .filter((page) => page.path !== "/" && !templateForPath(page.path))
    .map((page) => ({ slug: page.path.slice(1).split("/") }))
}

export async function generateMetadata({ params }: CmsPageProps): Promise<Metadata> {
  const path = toPath((await params).slug)
  const page = await getPublishedCmsPage(path)
  if (!page) return {}
  return buildPageMetadata({ title: page.title, description: page.excerpt ?? "", path })
}

export default async function CmsPage({ params }: CmsPageProps) {
  const path = toPath((await params).slug)
  const page = await getPublishedCmsPage(path)
  // Template pages (service, legal, blog…) are rendered by their own routes, never here.
  if (!page || templateForPath(path) || page.sections.every(isTemplateSection)) notFound()
  const doc = await getCmsBuilderDocument(path)
  if (!doc?.pageBuilder?.length) notFound()

  return (
    <>
      <CmsSchemaJsonLd path={path} />
      <PageBuilder blocks={doc.pageBuilder} />
    </>
  )
}

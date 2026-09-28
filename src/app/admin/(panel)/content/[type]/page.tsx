import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { FilePlus2, Home } from "lucide-react"

import { PagesTable } from "@/components/admin/pages-table"
import { EmptyState, PageHeader, Panel, ProblemNotice } from "@/components/admin/ui"
import { buttonVariants } from "@/components/ui/button"
import { requireAdmin } from "@/lib/admin/auth"
import { can } from "@/lib/admin/permissions"
import { getPageByPath, listPages } from "@/lib/admin/queries"
import type { PageType } from "@/lib/cms/types"

const CONTENT_TYPES: Partial<Record<PageType, { title: string; description: string; singular: string }>> = {
  service: { title: "Service pages", description: "Hub pages for hosting, domains, email and other services.", singular: "service page" },
  product: { title: "Product pages", description: "Individual plans or products.", singular: "product page" },
  category: { title: "Category pages", description: "Pages that group related services or articles.", singular: "category page" },
  static: { title: "Static pages", description: "About, contact, policies and other standalone pages.", singular: "static page" },
  blog: { title: "Blog posts", description: "Articles published under /blog. They appear in the blog listing automatically.", singular: "blog post" },
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params
  return { title: type === "home" ? "Home page" : (CONTENT_TYPES[type as PageType]?.title ?? "Content") }
}

export default async function ContentTypePage({ params, searchParams }: { params: Promise<{ type: string }>; searchParams: Promise<{ q?: string }> }) {
  const admin = await requireAdmin()
  const { type } = await params
  const { q } = await searchParams

  if (type === "home") {
    const home = await getPageByPath("/")
    if (home.data) redirect(`/admin/pages/${home.data.id}`)
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Home page" description="The website's front page ( / )." />
        <ProblemNotice problem={home.problem} />
        {!home.problem ? (
          <Panel>
            <EmptyState
              icon={Home}
              title="The home page isn't managed by the CMS yet"
              description="The website is showing its built-in home page. Import it from Sanity on the dashboard to edit the current content, or start a new home page from scratch."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Link href="/admin/dashboard" className={buttonVariants({ variant: "outline" })}>
                    Import from Sanity
                  </Link>
                  {can(admin.role, "pages.edit") ? (
                    <Link href="/admin/pages/new?type=home" className={buttonVariants()}>
                      <FilePlus2 />
                      Create home page
                    </Link>
                  ) : null}
                </div>
              }
            />
          </Panel>
        ) : null}
      </div>
    )
  }

  const config = CONTENT_TYPES[type as PageType]
  if (!config) notFound()
  const { data, problem } = await listPages({ type: type as PageType, q: q?.trim() || undefined })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={config.title}
        description={config.description}
        breadcrumbs={[{ label: "Content" }, { label: config.title }]}
        actions={
          can(admin.role, "pages.edit") ? (
            <Link href={`/admin/pages/new?type=${type}`} className={buttonVariants()}>
              <FilePlus2 />
              New {config.singular}
            </Link>
          ) : null
        }
      />
      <PagesTable
        pages={data}
        problem={problem}
        admin={admin}
        query={q}
        searchAction={`/admin/content/${type}`}
        emptyTitle={`No ${config.title.toLowerCase()} yet`}
        newHref={`/admin/pages/new?type=${type}`}
      />
    </div>
  )
}

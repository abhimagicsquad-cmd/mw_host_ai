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
import { CONTENT_GROUPS, type ContentGroup, contentGroupForPath } from "@/lib/cms/groups"

/** Where "New …" in each group starts (URL prefix and page type for the new-page form). */
const NEW_PAGE: Partial<Record<ContentGroup, { label: string; href: string }>> = {
  services: { label: "New service page", href: "/admin/pages/new?type=service" },
  legal: { label: "New legal page", href: "/admin/pages/new?type=static&prefix=/legal/" },
  blog: { label: "New blog post", href: "/admin/pages/new?type=blog" },
  promotions: { label: "New promotion", href: "/admin/pages/new?type=landing&prefix=/promo/" },
  custom: { label: "New custom page", href: "/admin/pages/new" },
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params
  return { title: CONTENT_GROUPS[type as ContentGroup]?.title ?? "Content" }
}

export default async function ContentGroupPage({ params, searchParams }: { params: Promise<{ type: string }>; searchParams: Promise<{ q?: string }> }) {
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
              title="The home page isn't set up yet"
              description="The website is showing its built-in home page. Create a page at the path / to edit it here."
              action={
                <Link href="/admin/pages/new" className={buttonVariants()}>
                  Create page
                </Link>
              }
            />
          </Panel>
        ) : null}
      </div>
    )
  }

  const group = CONTENT_GROUPS[type as ContentGroup]
  if (!group) notFound()
  const { data, problem } = await listPages({ q: q?.trim() || undefined })
  const pages = data.filter((page) => contentGroupForPath(page.path) === type).sort((a, b) => a.path.localeCompare(b.path))
  const newPage = NEW_PAGE[type as ContentGroup]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={group.title}
        description={group.description}
        breadcrumbs={[{ label: "Content" }, { label: group.title }]}
        actions={
          newPage && can(admin.role, "pages.edit") ? (
            <Link href={newPage.href} className={buttonVariants()}>
              <FilePlus2 />
              {newPage.label}
            </Link>
          ) : null
        }
      />
      <PagesTable
        pages={pages}
        problem={problem}
        admin={admin}
        query={q}
        searchAction={`/admin/content/${type}`}
        emptyTitle={`No ${group.title.toLowerCase()} in the CMS yet — create one with Add New Page`}
        newHref={newPage?.href ?? "/admin/pages/new"}
      />
    </div>
  )
}

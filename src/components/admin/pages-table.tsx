import Link from "next/link"
import { FilePlus2, FileText, Search } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import type { CurrentAdmin } from "@/lib/admin/auth"
import { can } from "@/lib/admin/permissions"
import type { Problem } from "@/lib/admin/queries"
import type { PageRow } from "@/lib/cms/types"

import { PageRowActions } from "./page-row-actions"
import { EmptyState, formatDate, PAGE_TYPE_LABELS, Panel, Pill, ProblemNotice, StatusBadge, Table, Td, Th } from "./ui"

export function PagesTable({
  pages,
  problem,
  admin,
  query,
  searchAction,
  emptyTitle = "No pages yet",
  newHref = "/admin/pages/new",
}: {
  pages: PageRow[]
  problem: Problem
  admin: CurrentAdmin
  query?: string
  searchAction: string
  emptyTitle?: string
  newHref?: string
}) {
  const perms = {
    canEdit: can(admin.role, "pages.edit"),
    canPublish: can(admin.role, "pages.publish"),
    canDelete: can(admin.role, "pages.delete"),
  }

  return (
    <div className="flex flex-col gap-4">
      <ProblemNotice problem={problem} />
      <Panel
        bodyClassName="p-0"
        title={`${pages.length} ${pages.length === 1 ? "page" : "pages"}`}
        actions={
          <form action={searchAction} className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              name="q"
              defaultValue={query}
              placeholder="Search title or URL…"
              aria-label="Search pages"
              className="h-8 w-full rounded-lg border border-input bg-transparent pr-2.5 pl-8 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </form>
        }
      >
        {pages.length ? (
          <Table>
            <thead>
              <tr>
                <Th>Title</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th>Last updated</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="transition-colors hover:bg-muted/30">
                  <Td>
                    <Link href={`/admin/pages/${page.id}`} className="font-medium hover:text-primary hover:underline">
                      {page.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{page.path}</p>
                  </Td>
                  <Td>
                    <Pill>{PAGE_TYPE_LABELS[page.page_type]}</Pill>
                  </Td>
                  <Td>
                    <StatusBadge status={page.status} />
                  </Td>
                  <Td className="text-muted-foreground">{formatDate(page.updated_at)}</Td>
                  <Td>
                    <PageRowActions page={{ id: page.id, title: page.title, path: page.path, status: page.status }} {...perms} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState
            icon={query ? Search : FileText}
            title={query ? `No pages match “${query}”` : emptyTitle}
            action={
              perms.canEdit && !query ? (
                <Link href={newHref} className={buttonVariants()}>
                  <FilePlus2 />
                  Create a page
                </Link>
              ) : null
            }
          />
        )}
      </Panel>
    </div>
  )
}

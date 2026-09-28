import type { Metadata } from "next"

import { PagesTable } from "@/components/admin/pages-table"
import { PageHeader } from "@/components/admin/ui"
import { requireAdmin } from "@/lib/admin/auth"
import { listPages } from "@/lib/admin/queries"

export const metadata: Metadata = { title: "Draft pages" }

export default async function DraftPagesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const admin = await requireAdmin()
  const { q } = await searchParams
  const { data, problem } = await listPages({ status: "draft", q: q?.trim() || undefined })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Draft pages" description="Unpublished pages — only visible here until you publish them." />
      <PagesTable pages={data} problem={problem} admin={admin} query={q} searchAction="/admin/pages/drafts" emptyTitle="No drafts" />
    </div>
  )
}

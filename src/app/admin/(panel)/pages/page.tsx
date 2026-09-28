import type { Metadata } from "next"
import Link from "next/link"
import { FilePlus2 } from "lucide-react"

import { PagesTable } from "@/components/admin/pages-table"
import { PageHeader } from "@/components/admin/ui"
import { buttonVariants } from "@/components/ui/button"
import { requireAdmin } from "@/lib/admin/auth"
import { can } from "@/lib/admin/permissions"
import { listPages } from "@/lib/admin/queries"

export const metadata: Metadata = { title: "All pages" }

export default async function AllPagesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const admin = await requireAdmin()
  const { q } = await searchParams
  const { data, problem } = await listPages({ q: q?.trim() || undefined })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="All pages"
        description="Every page managed by the CMS. Published pages are live on the website."
        actions={
          can(admin.role, "pages.edit") ? (
            <Link href="/admin/pages/new" className={buttonVariants()}>
              <FilePlus2 />
              Add new page
            </Link>
          ) : null
        }
      />
      <PagesTable pages={data} problem={problem} admin={admin} query={q} searchAction="/admin/pages" />
    </div>
  )
}

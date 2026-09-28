import type { Metadata } from "next"

import { NewPageForm } from "@/components/admin/new-page-form"
import { PageHeader, ProblemNotice } from "@/components/admin/ui"
import { requireAdmin } from "@/lib/admin/auth"
import { getPageByPath } from "@/lib/admin/queries"
import type { PageType } from "@/lib/cms/types"

export const metadata: Metadata = { title: "Add new page" }

const TYPES: PageType[] = ["home", "service", "product", "category", "static", "landing", "blog"]

export default async function NewPagePage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  await requireAdmin("pages.edit")
  const { type } = await searchParams
  const home = await getPageByPath("/")
  const defaultType = TYPES.includes(type as PageType) ? (type as PageType) : "static"

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Add new page"
        breadcrumbs={[{ label: "Pages", href: "/admin/pages" }, { label: "New" }]}
        description="Create the page, then build its content from sections in the editor."
      />
      <ProblemNotice problem={home.problem} />
      <NewPageForm defaultType={defaultType} hasHome={Boolean(home.data)} />
    </div>
  )
}

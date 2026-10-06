import type { Metadata } from "next"
import Link from "next/link"
import { Search } from "lucide-react"

import { AssistantFaqsTable, FaqImportButtons } from "@/components/admin/assistant/assistant-faqs-manager"
import { AssistantMigrationNotice } from "@/components/admin/assistant/assistant-status"
import { selectClassName } from "@/components/admin/form-controls"
import { PageHeader, Panel, ProblemNotice } from "@/components/admin/ui"
import { buttonVariants } from "@/components/ui/button"
import { ASSISTANT_PAGE_SIZE, listAssistantFaqs } from "@/lib/admin/assistant-queries"
import { requireAdmin } from "@/lib/admin/auth"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Hosting Assistant FAQs" }

type Params = { q?: string; category?: string; status?: string; page?: string }

export default async function AssistantFaqsPage({ searchParams }: { searchParams: Promise<Params> }) {
  await requireAdmin("assistant.manage")
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const { data, problem } = await listAssistantFaqs({ q: params.q, category: params.category, status: params.status, page })
  const pages = Math.max(1, Math.ceil(data.total / ASSISTANT_PAGE_SIZE))
  const filtered = Boolean(params.q || params.category || params.status)
  const href = (nextPage: number) => {
    const query = new URLSearchParams()
    if (params.q) query.set("q", params.q)
    if (params.category) query.set("category", params.category)
    if (params.status) query.set("status", params.status)
    if (nextPage > 1) query.set("page", String(nextPage))
    const qs = query.toString()
    return `/admin/assistant/faqs${qs ? `?${qs}` : ""}`
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="FAQs"
        description="What the assistant knows. Published FAQs are matched by exact question, keywords and similar wording; related ones are suggested."
        breadcrumbs={[{ label: "Hosting Assistant", href: "/admin/assistant" }, { label: "FAQs" }]}
        actions={problem === "assistant-missing" ? null : <FaqImportButtons />}
      />
      {problem === "assistant-missing" ? (
        <AssistantMigrationNotice />
      ) : (
        <>
          <ProblemNotice problem={problem} />
          <Panel bodyClassName="p-0" title={`${data.total} ${data.total === 1 ? "FAQ" : "FAQs"}${filtered ? " found" : ""}`}>
            <form action="/admin/assistant/faqs" className="flex flex-wrap items-center gap-2 border-b px-5 py-3">
              <div className="relative min-w-52 flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input
                  name="q"
                  defaultValue={params.q}
                  placeholder="Search questions and answers…"
                  aria-label="Search FAQs"
                  className="h-8 w-full rounded-lg border border-input bg-transparent pr-2.5 pl-8 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
              <select name="category" defaultValue={params.category ?? ""} aria-label="Category" className={cn(selectClassName, "w-40")}>
                <option value="">All categories</option>
                {data.categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select name="status" defaultValue={params.status ?? ""} aria-label="Status" className={cn(selectClassName, "w-36")}>
                <option value="">Any status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <button type="submit" className={buttonVariants({ size: "sm", variant: "outline" })}>
                Filter
              </button>
              {filtered ? (
                <Link href="/admin/assistant/faqs" className={buttonVariants({ size: "sm", variant: "ghost" })}>
                  Clear
                </Link>
              ) : null}
            </form>
            <AssistantFaqsTable faqs={data.rows} categories={data.categories} filtered={filtered} />
            {pages > 1 ? (
              <nav aria-label="FAQ pages" className="flex items-center justify-between border-t px-5 py-3 text-sm">
                <span className="text-muted-foreground">
                  Page {page} of {pages}
                </span>
                <div className="flex gap-2">
                  {page > 1 ? (
                    <Link href={href(page - 1)} className={buttonVariants({ size: "sm", variant: "outline" })}>
                      Previous
                    </Link>
                  ) : null}
                  {page < pages ? (
                    <Link href={href(page + 1)} className={buttonVariants({ size: "sm", variant: "outline" })}>
                      Next
                    </Link>
                  ) : null}
                </div>
              </nav>
            ) : null}
          </Panel>
        </>
      )}
    </div>
  )
}

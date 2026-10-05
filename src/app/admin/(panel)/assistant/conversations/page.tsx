import type { Metadata } from "next"
import Link from "next/link"
import { MessagesSquare, Search } from "lucide-react"

import { AssistantMigrationNotice } from "@/components/admin/assistant/assistant-status"
import { selectClassName } from "@/components/admin/form-controls"
import { EmptyState, formatDate, PageHeader, Panel, Pill, ProblemNotice, Table, Td, Th } from "@/components/admin/ui"
import { buttonVariants } from "@/components/ui/button"
import { ASSISTANT_PAGE_SIZE, listConversations } from "@/lib/admin/assistant-queries"
import { requireAdmin } from "@/lib/admin/auth"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Hosting Assistant conversations" }

type Params = { q?: string; lead?: string; page?: string }

export default async function AssistantConversationsPage({ searchParams }: { searchParams: Promise<Params> }) {
  await requireAdmin("assistant.manage")
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const { data, problem } = await listConversations({ q: params.q, lead: params.lead, page })
  const pages = Math.max(1, Math.ceil(data.total / ASSISTANT_PAGE_SIZE))
  const filtered = Boolean(params.q || params.lead)
  const href = (nextPage: number) => {
    const query = new URLSearchParams()
    if (params.q) query.set("q", params.q)
    if (params.lead) query.set("lead", params.lead)
    if (nextPage > 1) query.set("page", String(nextPage))
    const qs = query.toString()
    return `/admin/assistant/conversations${qs ? `?${qs}` : ""}`
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Conversations"
        description="Every chat on the website (dashboard previews aren't stored). Open one to read the full transcript."
        breadcrumbs={[{ label: "Hosting Assistant", href: "/admin/assistant" }, { label: "Conversations" }]}
      />
      {problem === "assistant-missing" ? (
        <AssistantMigrationNotice />
      ) : (
        <>
          <ProblemNotice problem={problem} />
          <Panel bodyClassName="p-0" title={`${data.total} ${data.total === 1 ? "conversation" : "conversations"}${filtered ? " found" : ""}`}>
            <form action="/admin/assistant/conversations" className="flex flex-wrap items-center gap-2 border-b px-5 py-3">
              <div className="relative min-w-52 flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input
                  name="q"
                  defaultValue={params.q}
                  placeholder="Visitor ID, or the lead's name, email or phone…"
                  aria-label="Search conversations"
                  className="h-8 w-full rounded-lg border border-input bg-transparent pr-2.5 pl-8 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
              <select name="lead" defaultValue={params.lead ?? ""} aria-label="Lead generated" className={cn(selectClassName, "w-44")}>
                <option value="">All conversations</option>
                <option value="yes">Lead generated</option>
                <option value="no">No lead</option>
              </select>
              <button type="submit" className={buttonVariants({ size: "sm", variant: "outline" })}>
                Filter
              </button>
              {filtered ? (
                <Link href="/admin/assistant/conversations" className={buttonVariants({ size: "sm", variant: "ghost" })}>
                  Clear
                </Link>
              ) : null}
            </form>
            {data.rows.length ? (
              <Table>
                <thead>
                  <tr>
                    <Th>Visitor ID</Th>
                    <Th>Started</Th>
                    <Th>Last activity</Th>
                    <Th>Messages</Th>
                    <Th>Lead generated</Th>
                    <Th className="text-right">Details</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/30">
                      <Td>
                        <code className="font-mono text-xs">{row.visitor_id.slice(0, 14)}</code>
                      </Td>
                      <Td className="text-muted-foreground">{formatDate(row.started_at)}</Td>
                      <Td className="text-muted-foreground">{formatDate(row.last_activity_at)}</Td>
                      <Td className="tabular-nums">{row.message_count}</Td>
                      <Td>
                        {row.lead ? (
                          <span className="text-sm">
                            <Pill className="mr-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">Yes</Pill>
                            {row.lead.name}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">No</span>
                        )}
                      </Td>
                      <Td>
                        <Link href={`/admin/assistant/conversations/${row.id}`} className="text-sm font-medium text-primary hover:underline">
                          View
                        </Link>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <EmptyState icon={MessagesSquare} title={filtered ? "No conversations match" : "No conversations yet"} description={filtered ? undefined : "Chats appear here once the assistant is switched on and visitors use it."} />
            )}
            {pages > 1 ? (
              <nav aria-label="Conversation pages" className="flex items-center justify-between border-t px-5 py-3 text-sm">
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

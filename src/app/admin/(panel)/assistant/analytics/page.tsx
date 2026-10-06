import type { Metadata } from "next"
import Link from "next/link"

import { AssistantMigrationNotice } from "@/components/admin/assistant/assistant-status"
import { PageHeader, Panel, ProblemNotice } from "@/components/admin/ui"
import { getAssistantAnalytics } from "@/lib/admin/assistant-queries"
import { requireAdmin } from "@/lib/admin/auth"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Hosting Assistant analytics" }

const PERIODS = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "all", label: "All time" },
]

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

function TopList({ title, rows, empty }: { title: string; rows: { label: string; count: number }[]; empty: string }) {
  const max = Math.max(1, ...rows.map((row) => row.count))
  return (
    <Panel title={title}>
      {rows.length ? (
        <ol className="flex flex-col gap-2.5">
          {rows.map((row) => (
            <li key={row.label} className="text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate" title={row.label}>
                  {row.label}
                </span>
                <span className="shrink-0 font-medium tabular-nums">{row.count}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-muted" aria-hidden>
                <div className="h-full rounded-full bg-primary/70" style={{ width: `${(row.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-muted-foreground">{empty}</p>
      )}
    </Panel>
  )
}

export default async function AssistantAnalyticsPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  await requireAdmin("assistant.manage")
  const { period: raw } = await searchParams
  const period = PERIODS.some((p) => p.value === raw) ? (raw as string) : "30"
  const { data, problem } = await getAssistantAnalytics(period === "all" ? null : Number(period))
  const rate = data.conversations ? (data.leads / data.conversations) * 100 : 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Analytics"
        description="How visitors use the assistant. Computed from stored conversations (dashboard previews are excluded)."
        breadcrumbs={[{ label: "Hosting Assistant", href: "/admin/assistant" }, { label: "Analytics" }]}
      />
      {problem === "assistant-missing" ? (
        <AssistantMigrationNotice />
      ) : (
        <>
          <ProblemNotice problem={problem} />
          <nav aria-label="Period" className="flex flex-wrap gap-1.5">
            {PERIODS.map((p) => (
              <Link
                key={p.value}
                href={`/admin/assistant/analytics${p.value === "30" ? "" : `?period=${p.value}`}`}
                aria-current={p.value === period ? "page" : undefined}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm transition-colors",
                  p.value === period ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                {p.label}
              </Link>
            ))}
          </nav>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Total conversations" value={data.conversations.toLocaleString("en-IN")} />
            <Stat label="Total leads generated" value={data.leads.toLocaleString("en-IN")} />
            <Stat label="Conversion rate" value={`${rate.toFixed(1)}%`} hint="Conversations that produced a lead" />
            <Stat label="Unanswered questions" value={data.unanswered.toLocaleString("en-IN")} hint={`${data.messages.toLocaleString("en-IN")} messages in total`} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <TopList title="Most asked questions" rows={data.topQuestions} empty="No FAQ answers yet." />
            <TopList title="Most clicked quick actions" rows={data.topQuickActions} empty="No quick actions clicked yet." />
            <TopList title="Most recommended plans" rows={data.topPlans} empty="No recommendations yet." />
            <TopList title="Most used conversation flows" rows={data.topFlows} empty="No conversation flows started yet." />
            <TopList title="Questions without an answer" rows={data.topUnanswered} empty="Nothing unanswered — or no questions yet. Add FAQs for anything that shows up here." />
          </div>
        </>
      )}
    </div>
  )
}

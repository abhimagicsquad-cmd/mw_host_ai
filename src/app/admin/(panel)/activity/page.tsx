import type { Metadata } from "next"
import Link from "next/link"
import { Activity } from "lucide-react"

import { EmptyState, formatDate, PageHeader, Panel, Pill, ProblemNotice, Table, Td, Th } from "@/components/admin/ui"
import { buttonVariants } from "@/components/ui/button"
import { requireAdmin } from "@/lib/admin/auth"
import { ACTIVITY_PAGE_SIZE, listActivity } from "@/lib/admin/queries"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Activity logs" }

const CATEGORIES = [
  { value: "", label: "All activity" },
  { value: "auth", label: "Logins" },
  { value: "security", label: "Two-factor & security" },
  { value: "page", label: "Page updates" },
  { value: "content", label: "Content updates" },
  { value: "media", label: "Media" },
  { value: "seo", label: "SEO" },
  { value: "menu", label: "Menus" },
  { value: "user", label: "User changes" },
  { value: "lead", label: "Leads" },
  { value: "assistant", label: "Hosting Assistant" },
  { value: "custom_code", label: "Custom Code" },
  { value: "settings", label: "Settings" },
  { value: "system", label: "System" },
]

const TONES: Record<string, string> = {
  "auth.login_failed": "bg-destructive/10 text-destructive",
  "page.deleted": "bg-destructive/10 text-destructive",
  "media.deleted": "bg-destructive/10 text-destructive",
  "user.deleted": "bg-destructive/10 text-destructive",
  "user.deactivated": "bg-destructive/10 text-destructive",
  "lead.deleted": "bg-destructive/10 text-destructive",
  "assistant.disabled": "bg-destructive/10 text-destructive",
  "assistant.enabled": "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "assistant.lead_captured": "bg-primary/10 text-primary",
  "custom_code.disabled": "bg-destructive/10 text-destructive",
  "custom_code.reset": "bg-destructive/10 text-destructive",
  "custom_code.enabled": "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "custom_code.restored": "bg-primary/10 text-primary",
  "user.activated": "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "page.published": "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "auth.login": "bg-primary/10 text-primary",
  "security.2fa_failed": "bg-destructive/10 text-destructive",
  "security.2fa_disabled": "bg-destructive/10 text-destructive",
  "security.2fa_reset_admin": "bg-destructive/10 text-destructive",
  "security.2fa_reset_super_admin": "bg-destructive/10 text-destructive",
  "security.2fa_reset_editor": "bg-destructive/10 text-destructive",
  "security.recovery_code_used": "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
  "security.2fa_enabled": "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "security.2fa_verified": "bg-primary/10 text-primary",
}

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ category?: string; page?: string }> }) {
  await requireAdmin("activity.view")
  const { category = "", page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const validCategory = CATEGORIES.some((c) => c.value === category) ? category : ""
  const { data, problem } = await listActivity({ category: validCategory || undefined, page })
  const pages = Math.max(1, Math.ceil(data.total / ACTIVITY_PAGE_SIZE))
  const href = (next: { category?: string; page?: number }) => {
    const params = new URLSearchParams()
    const c = next.category ?? validCategory
    if (c) params.set("category", c)
    if ((next.page ?? 1) > 1) params.set("page", String(next.page))
    const query = params.toString()
    return `/admin/activity${query ? `?${query}` : ""}`
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Activity logs" description="Audit trail of sign-ins and every change made in the admin." />
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <Link
            key={c.value}
            href={href({ category: c.value, page: 1 })}
            aria-current={c.value === validCategory ? "page" : undefined}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              c.value === validCategory ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {c.label}
          </Link>
        ))}
      </div>
      <ProblemNotice problem={problem} />
      <Panel title={`${data.total} events`} bodyClassName="p-0">
        {data.rows.length ? (
          <Table>
            <thead>
              <tr>
                <Th>When</Th>
                <Th>User</Th>
                <Th>Event</Th>
                <Th>Details</Th>
                <Th className="text-right">IP address</Th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr key={row.id}>
                  <Td className="whitespace-nowrap text-muted-foreground">{formatDate(row.created_at)}</Td>
                  <Td className="font-medium">{row.username ?? "—"}</Td>
                  <Td>
                    <Pill className={TONES[row.action]}>{row.action}</Pill>
                  </Td>
                  <Td>{row.description}</Td>
                  <Td className="font-mono text-xs text-muted-foreground">{row.ip_address ?? "—"}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState icon={Activity} title="No activity recorded" />
        )}
      </Panel>
      {pages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground tabular-nums">
            Page {page} of {pages}
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link href={href({ page: page - 1 })} className={buttonVariants({ variant: "outline", size: "sm" })}>
                Previous
              </Link>
            ) : null}
            {page < pages ? (
              <Link href={href({ page: page + 1 })} className={buttonVariants({ variant: "outline", size: "sm" })}>
                Next
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

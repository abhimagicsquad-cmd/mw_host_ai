import Link from "next/link"
import type { ReactNode } from "react"
import { AlertTriangle, DatabaseZap, type LucideIcon } from "lucide-react"

import type { Problem } from "@/lib/admin/queries"
import type { PageStatus } from "@/lib/cms/types"
import { cn } from "@/lib/utils"

/** Server-safe presentational pieces shared by every admin screen. */

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
}: {
  title: string
  description?: ReactNode
  actions?: ReactNode
  breadcrumbs?: { label: string; href?: string }[]
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {breadcrumbs?.length ? (
          <nav aria-label="Breadcrumb" className="mb-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
              <span key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                {index > 0 ? <span aria-hidden>/</span> : null}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-foreground">
                    {crumb.label}
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}
        <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={cn("rounded-xl border bg-card text-card-foreground shadow-xs", className)}>
      {title || actions ? (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
          <div>
            {title ? <h2 className="text-sm font-semibold">{title}</h2> : null}
            {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
          </div>
          {actions}
        </div>
      ) : null}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  )
}

export function StatusBadge({ status }: { status: PageStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        status === "published"
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
      )}
    >
      <span className={cn("size-1.5 rounded-full", status === "published" ? "bg-emerald-500" : "bg-amber-500")} aria-hidden />
      {status === "published" ? "Published" : "Draft"}
    </span>
  )
}

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground", className)}>{children}</span>
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" aria-hidden />
      </span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {description ? <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}

/** Shown in place of a screen's data when the database isn't reachable or migrated yet. */
export function ProblemNotice({ problem }: { problem: Problem }) {
  if (!problem) return null
  if (problem === "missing" || problem === "unconfigured") {
    return (
      <div className="flex gap-3 rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
        <DatabaseZap className="mt-0.5 size-5 shrink-0" aria-hidden />
        <div>
          <p className="font-semibold">{problem === "missing" ? "CMS database tables not found" : "Supabase is not configured"}</p>
          <p className="mt-1">
            {problem === "missing" ? (
              <>
                Run <code className="rounded bg-amber-100 px-1 dark:bg-amber-500/20">supabase/migrations/0004_create_cms.sql</code> in the
                Supabase SQL editor once, then reload this page. The website keeps serving its existing content until then.
              </>
            ) : (
              <>Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment, then redeploy.</>
            )}
          </p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
      <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
      <p>Couldn&apos;t load data: {problem}</p>
    </div>
  )
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">{children}</table>
    </div>
  )
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return <th className={cn("border-b bg-muted/40 px-4 py-2.5 text-xs font-medium tracking-wide text-muted-foreground uppercase", className)}>{children}</th>
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn("border-b px-4 py-3 align-middle last:text-right", className)}>{children}</td>
}

export function formatDate(value: string | null | undefined, withTime = true) {
  if (!value) return "—"
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "Asia/Kolkata",
  }).format(new Date(value))
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const PAGE_TYPE_LABELS: Record<string, string> = {
  home: "Home",
  service: "Service",
  product: "Product",
  category: "Category",
  static: "Static",
  landing: "Landing",
  blog: "Blog post",
}

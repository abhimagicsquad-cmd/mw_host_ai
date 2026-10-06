import type { Metadata } from "next"
import Link from "next/link"
import {
  Activity,
  ArrowUpRight,
  FilePlus2,
  FileText,
  HardDrive,
  Image as ImageIcon,
  Inbox,
  KeyRound,
  type LucideIcon,
  Menu,
  Newspaper,
  Search,
  Upload,
} from "lucide-react"

import { LeadsChart } from "@/components/admin/leads-chart"
import { SystemTools } from "@/components/admin/system-tools"
import { EmptyState, formatBytes, formatDate, PAGE_TYPE_LABELS, PageHeader, Panel, ProblemNotice, StatusBadge } from "@/components/admin/ui"
import { buttonVariants } from "@/components/ui/button"
import { requireAdmin } from "@/lib/admin/auth"
import { can } from "@/lib/admin/permissions"
import { getDashboardData } from "@/lib/admin/queries"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Dashboard" }

function StatTile({ label, value, detail, icon: Icon, href }: { label: string; value: string; detail?: string; icon: LucideIcon; href?: string }) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4.5" aria-hidden />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {detail ? <p className="mt-1 text-xs text-muted-foreground">{detail}</p> : null}
    </>
  )
  const className = "block rounded-xl border bg-card p-5 shadow-xs transition-colors"
  return href ? (
    <Link href={href} className={cn(className, "hover:border-primary/40")}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  )
}

const ACTION_LABELS: Record<string, string> = {
  auth: "Login",
  security: "Security",
  page: "Page",
  content: "Content",
  media: "Media",
  seo: "SEO",
  menu: "Menu",
  user: "User",
  lead: "Lead",
  assistant: "Assistant",
  custom_code: "Custom code",
  settings: "Settings",
  system: "System",
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const admin = await requireAdmin()
  const { denied } = await searchParams
  const data = await getDashboardData()
  const { totals } = data
  const canForms = can(admin.role, "forms.view")

  const quickActions = [
    { label: "New page", href: "/admin/pages/new", icon: FilePlus2, show: can(admin.role, "pages.edit") },
    { label: "Edit home page", href: "/admin/content/home", icon: FileText, show: true },
    { label: "Upload media", href: "/admin/media/upload", icon: Upload, show: can(admin.role, "media.manage") },
    { label: "Manage SEO", href: "/admin/seo/titles", icon: Search, show: can(admin.role, "seo.manage") },
    { label: "Header menu", href: "/admin/menus/header", icon: Menu, show: can(admin.role, "menus.manage") },
    { label: "View leads", href: "/admin/forms/leads", icon: Inbox, show: canForms },
  ].filter((action) => action.show)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Welcome back, ${admin.full_name?.split(" ")[0] || admin.username}`}
        description="Here's what's happening across the MagicWorks Host website."
        actions={
          can(admin.role, "pages.edit") ? (
            <Link href="/admin/pages/new" className={buttonVariants({ size: "lg" })}>
              <FilePlus2 />
              New page
            </Link>
          ) : null
        }
      />

      {denied ? (
        <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          Your role doesn&apos;t have access to that section.
        </p>
      ) : null}
      {admin.must_change_password ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-admin-secondary/40 bg-admin-secondary/10 px-4 py-3 text-sm">
          <p className="flex items-center gap-2">
            <KeyRound className="size-4 text-admin-secondary" aria-hidden />
            You&apos;re using the default password. Change it before sharing admin access.
          </p>
          <Link href="/admin/profile" className={buttonVariants({ size: "sm" })}>
            Change password
          </Link>
        </div>
      ) : null}
      {admin.isBootstrap ? (
        <p className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          You&apos;re signed in with the temporary bootstrap login. It stops working as soon as the CMS migration seeds the first admin user.
        </p>
      ) : null}
      <ProblemNotice problem={data.problem} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Total pages" value={String(totals.pages)} detail={`${totals.published} published · ${totals.drafts} drafts`} icon={FileText} href="/admin/pages" />
        <StatTile label="Total blogs" value={String(totals.blogs)} detail="Posts managed in the CMS" icon={Newspaper} href="/admin/content/blog" />
        <StatTile label="Media files" value={String(totals.media)} detail={`${formatBytes(totals.mediaBytes)} stored`} icon={ImageIcon} href="/admin/media/images" />
        {canForms ? (
          <StatTile label="Leads (30 days)" value={String(totals.leads30d)} detail={`${totals.leadsTotal} all time`} icon={Inbox} href="/admin/forms/leads" />
        ) : (
          <StatTile label="Admin users" value={String(totals.users)} icon={KeyRound} />
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Website statistics"
          description={canForms ? "Leads captured by site forms per day, last 30 days" : "Content overview"}
        >
          {canForms ? <LeadsChart data={data.leadsByDay} /> : null}
          <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-4", canForms && "mt-6 border-t pt-5")}>
            {[
              { label: "Published", value: totals.published },
              { label: "Drafts", value: totals.drafts },
              { label: "Admin users", value: totals.users },
              { label: "Storage used", value: formatBytes(totals.mediaBytes) },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums">{item.value}</p>
              </div>
            ))}
          </div>
          {data.pagesByType.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {data.pagesByType.map((row) => (
                <span key={row.type} className="rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                  {PAGE_TYPE_LABELS[row.type]} <span className="font-semibold text-foreground tabular-nums">{row.count}</span>
                </span>
              ))}
            </div>
          ) : null}
        </Panel>

        <Panel title="Quick actions">
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col gap-2 rounded-lg border p-3 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-muted/50"
              >
                <action.icon className="size-4.5 text-admin-secondary" aria-hidden />
                {action.label}
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          title="Recent updates"
          description="Pages edited most recently"
          actions={
            <Link href="/admin/pages" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              All pages <ArrowUpRight className="size-3.5" />
            </Link>
          }
          bodyClassName="p-0"
        >
          {data.recentPages.length ? (
            <ul className="divide-y">
              {data.recentPages.map((page) => (
                <li key={page.id}>
                  <Link href={`/admin/pages/${page.id}`} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/40">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <FileText className="size-4 text-muted-foreground" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{page.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {page.path} · {formatDate(page.updated_at)}
                      </span>
                    </span>
                    <StatusBadge status={page.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={FileText} title="No CMS pages yet" description="Create your first page to get started." />
          )}
        </Panel>

        <Panel
          title="Recent activity"
          actions={
            can(admin.role, "activity.view") ? (
              <Link href="/admin/activity" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                Activity log <ArrowUpRight className="size-3.5" />
              </Link>
            ) : null
          }
          bodyClassName="p-0"
        >
          {data.recentActivity.length ? (
            <ul className="divide-y">
              {data.recentActivity.map((entry) => (
                <li key={entry.id} className="flex items-start gap-3 px-5 py-3">
                  <span className="mt-0.5 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {ACTION_LABELS[entry.action.split(".")[0]] ?? "Event"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm">{entry.description}</span>
                    <span className="block text-xs text-muted-foreground">
                      {entry.username ?? "System"} · {formatDate(entry.created_at)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Activity} title="No activity yet" />
          )}
        </Panel>
      </div>

      {can(admin.role, "system.cache") ? <SystemTools /> : null}

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <HardDrive className="size-3.5" aria-hidden />
        Content is stored in Supabase; every save refreshes the live website automatically.
      </p>
    </div>
  )
}

"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"
import { DownloadCloud, ExternalLink, Loader2, MonitorSmartphone, Pencil, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { importAllContentAction, type ImportReport, publishPagesAction } from "@/lib/admin/actions/migration"
import { importMenusAndSettingsAction } from "@/lib/admin/actions/settings"
import type { AuditRow, LiveSource, SharedAuditRow } from "@/lib/admin/audit"
import { CONTENT_GROUPS, type ContentGroup } from "@/lib/cms/groups"
import type { ActionState } from "@/lib/cms/types"
import { cn } from "@/lib/utils"

import { checkboxClassName, ConfirmDialog, FormMessage, selectClassName } from "./form-controls"
import { Panel, StatusBadge } from "./ui"

const LIVE_TONE: Record<LiveSource, string> = {
  CMS: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  Sanity: "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  "Sanity + built-in": "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  "Built-in": "bg-muted text-muted-foreground",
}

function LivePill({ live }: { live: LiveSource }) {
  return <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap", LIVE_TONE[live])}>{live}</span>
}

const Yes = () => <span className="text-emerald-600 dark:text-emerald-400">✓</span>
const No = () => <span className="text-muted-foreground/50">—</span>

export function MigrationCenter({
  rows,
  shared,
  functional,
  warnings,
  canImport,
  canPublish,
}: {
  rows: AuditRow[]
  shared: SharedAuditRow[]
  functional: { path: string; label: string; note: string }[]
  warnings: string[]
  canImport: boolean
  canPublish: boolean
}) {
  const router = useRouter()
  const [group, setGroup] = useState<ContentGroup | "all">("all")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [report, setReport] = useState<ImportReport | ActionState>()
  const [pending, startTransition] = useTransition()
  const [confirmPublish, setConfirmPublish] = useState(false)
  const [confirmMenus, setConfirmMenus] = useState(false)

  const visible = useMemo(() => rows.filter((row) => group === "all" || row.group === group), [rows, group])
  const drafts = visible.filter((row) => row.cms?.status === "draft")
  const stats = {
    total: rows.length,
    inCms: rows.filter((row) => row.cms).length,
    live: rows.filter((row) => row.live === "CMS").length,
    drafts: rows.filter((row) => row.cms?.status === "draft").length,
    notImported: rows.filter((row) => !row.cms).length,
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Content pages", value: stats.total },
          { label: "In the CMS", value: stats.inCms },
          { label: "Live from CMS", value: stats.live },
          { label: "Drafts to review", value: stats.drafts },
          { label: "Not imported yet", value: stats.notImported },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border bg-card p-4 shadow-xs">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{item.value}</p>
          </div>
        ))}
      </div>

      {canImport ? (
        <Panel title="1. Import existing content" description="Copies every page into the CMS as a draft — visitors keep seeing the current site">
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Content comes from Sanity where it exists, otherwise from the website&apos;s built-in text. Pages already in the CMS are never overwritten, so this is safe to
              run again. Pricing plans are copied too, as a draft.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={pending || stats.notImported === 0}
                onClick={() =>
                  startTransition(async () => {
                    const result = await importAllContentAction()
                    setReport(result)
                    if (!result.error) router.refresh()
                  })
                }
              >
                {pending ? <Loader2 className="animate-spin" /> : <DownloadCloud />}
                {stats.notImported === 0 ? "Everything is imported" : `Import ${stats.notImported} pages as drafts`}
              </Button>
            </div>
            <FormMessage state={report} />
            {"warnings" in (report ?? {}) && (report as ImportReport).warnings?.length ? (
              <ul className="list-disc pl-5 text-xs text-muted-foreground">
                {(report as ImportReport).warnings!.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </Panel>
      ) : null}

      <Panel
        title="2. Review, preview and publish"
        description="Preview opens the real page with the draft content. Publishing switches that page to the CMS immediately."
        bodyClassName="p-0"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select aria-label="Filter by group" className={cn(selectClassName, "w-48")} value={group} onChange={(e) => setGroup(e.target.value as ContentGroup | "all")}>
              <option value="all">All groups</option>
              {(Object.keys(CONTENT_GROUPS) as ContentGroup[]).map((key) => (
                <option key={key} value={key}>
                  {CONTENT_GROUPS[key].title}
                </option>
              ))}
            </select>
            {canPublish ? (
              <Button size="sm" disabled={!selected.size} onClick={() => setConfirmPublish(true)}>
                <Send />
                Publish selected ({selected.size})
              </Button>
            ) : null}
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                <th className="w-10 px-4 py-2.5">
                  {canPublish && drafts.length ? (
                    <input
                      type="checkbox"
                      aria-label="Select all drafts"
                      className={checkboxClassName}
                      checked={drafts.every((row) => selected.has(row.cms!.id))}
                      onChange={(e) => setSelected(e.target.checked ? new Set(drafts.map((row) => row.cms!.id)) : new Set())}
                    />
                  ) : null}
                </th>
                <th className="px-4 py-2.5">Page</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5 text-center">Sanity</th>
                <th className="px-4 py-2.5 text-center">Built-in</th>
                <th className="px-4 py-2.5">CMS</th>
                <th className="px-4 py-2.5">Live now from</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.path} className="border-b hover:bg-muted/30">
                  <td className="px-4 py-2.5">
                    {canPublish && row.cms?.status === "draft" ? (
                      <input type="checkbox" aria-label={`Select ${row.path}`} className={checkboxClassName} checked={selected.has(row.cms.id)} onChange={() => toggle(row.cms!.id)} />
                    ) : null}
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="font-medium">{row.label}</p>
                    <p className="font-mono text-xs text-muted-foreground">{row.path}</p>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{row.kind}</td>
                  <td className="px-4 py-2.5 text-center">{row.sanity ? <Yes /> : <No />}</td>
                  <td className="px-4 py-2.5 text-center">{row.hardcoded ? <Yes /> : <No />}</td>
                  <td className="px-4 py-2.5">{row.cms ? <StatusBadge status={row.cms.status} /> : <span className="text-xs text-muted-foreground">Not imported</span>}</td>
                  <td className="px-4 py-2.5">
                    <LivePill live={row.live} />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      {row.cms ? (
                        <>
                          <a
                            href={`/admin/preview?path=${encodeURIComponent(row.path)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-label={`Preview ${row.path}`}
                            title="Preview draft on the website"
                          >
                            <MonitorSmartphone className="size-4" />
                          </a>
                          <Link href={`/admin/pages/${row.cms.id}`} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Edit ${row.path}`}>
                            <Pencil className="size-4" />
                          </Link>
                        </>
                      ) : null}
                      <a
                        href={row.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label={`Open live ${row.path}`}
                        title="Open the live page"
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Shared content" description="Not pages, but used across the site" bodyClassName="p-0">
        <ul className="divide-y">
          {shared.map((item) => (
            <li key={item.label} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
              <span className="min-w-60 flex-1 font-medium">{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.note}</span>
              <span className="text-xs">{item.sanity ? "In Sanity" : "Not in Sanity"}</span>
              <span className="text-xs text-muted-foreground">{item.cms === "draft" ? "CMS draft" : item.cms ? "In CMS" : "Not in CMS"}</span>
              <LivePill live={item.live} />
              <Link href={item.href} className="text-xs font-medium text-primary hover:underline">
                Manage
              </Link>
            </li>
          ))}
        </ul>
        {canImport ? (
          <div className="flex flex-wrap items-center gap-3 border-t px-5 py-3">
            <Button variant="outline" size="sm" onClick={() => setConfirmMenus(true)}>
              Copy menus & site settings from Sanity
            </Button>
            <span className="text-xs text-muted-foreground">These have no draft stage — the copy is identical to what Sanity serves, and goes live when copied.</span>
          </div>
        ) : null}
      </Panel>

      <Panel title="Functional pages" description="Built-in tools; their SEO is managed under SEO" bodyClassName="p-0">
        <ul className="divide-y">
          {functional.map((item) => (
            <li key={item.path} className="flex flex-wrap items-center gap-3 px-5 py-2.5 text-sm">
              <span className="font-mono text-xs">{item.path}</span>
              <span className="flex-1">{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.note}</span>
            </li>
          ))}
        </ul>
      </Panel>

      {warnings.length ? (
        <Panel title="Importer notes">
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </Panel>
      ) : null}

      <ConfirmDialog
        open={confirmPublish}
        onOpenChange={setConfirmPublish}
        title={`Publish ${selected.size} pages?`}
        description="Each selected page switches to its CMS content on the live website immediately. Unpublish any page later to fall back to Sanity / built-in content."
        confirmLabel="Publish now"
        action={async () => {
          const result = await publishPagesAction([...selected])
          if (!result.error) setSelected(new Set())
          setReport(result)
          return result
        }}
      />
      <ConfirmDialog
        open={confirmMenus}
        onOpenChange={setConfirmMenus}
        title="Copy menus and site settings from Sanity?"
        description="The header menu, footer menu and site settings are copied into the CMS and used by the website straight away. The content is identical to what Sanity serves now; existing CMS values are kept."
        confirmLabel="Copy now"
        action={async () => {
          const result = await importMenusAndSettingsAction()
          setReport(result)
          return result
        }}
      />
    </div>
  )
}

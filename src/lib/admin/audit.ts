import "server-only"

import { CONTENT_GROUPS, type ContentGroup, contentGroupForPath } from "@/lib/cms/groups"
import { buildMigrationPlan, type MigrationSource } from "@/lib/cms/migration"
import { templateForPath, templates } from "@/lib/cms/templates"
import type { PageRow } from "@/lib/cms/types"

export type LiveSource = "CMS" | "Sanity" | "Sanity + built-in" | "Built-in"

export type AuditRow = {
  path: string
  label: string
  group: ContentGroup
  kind: string
  sanity: boolean
  hardcoded: boolean
  cms: { id: string; status: PageRow["status"] } | null
  live: LiveSource
  note?: string
}

export type SharedAuditRow = { label: string; href: string; cms: "published" | "draft" | "live" | null; sanity: boolean; live: LiveSource; note: string }

function liveFromSource(source: MigrationSource): LiveSource {
  return source === "sanity" ? "Sanity" : source === "sanity+hardcoded" ? "Sanity + built-in" : "Built-in"
}

/** Built-in routes that are functional tools rather than content — only their SEO is managed. */
const FUNCTIONAL = [
  { path: "/domain/search", label: "Domain search", note: "Search tool" },
  { path: "/search", label: "Site search", note: "Search results" },
  { path: "/order/[plan]", label: "Checkout", note: "Uses Pricing Plans" },
  { path: "/tools/*", label: "Calculators (3)", note: "Interactive tools" },
  { path: "/sitemap-page", label: "HTML sitemap", note: "Generated from routes" },
  { path: "/knowledge-base/category/*", label: "KB category pages", note: "Generated from the Knowledge base page" },
  { path: "/blog/category/*", label: "Blog category pages", note: "Generated from the Blog home" },
]

/**
 * Where every page's content comes from right now, and its CMS migration status. The
 * migration plan says what built-in sources exist (Sanity has been retired); the pages table says what is
 * already in the CMS and whether it is live.
 */
export async function getContentAudit(cmsPages: PageRow[], pricing: { exists: boolean; published: boolean }, menus: { header: boolean; footer: boolean }, settingsSaved: boolean) {
  const plan = await buildMigrationPlan()
  const byPath = new Map(cmsPages.map((page) => [page.path, page]))

  const rows: AuditRow[] = plan.pages.map((planned) => {
    const page = byPath.get(planned.path)
    const template = templateForPath(planned.path)
    return {
      path: planned.path,
      label: planned.title,
      group: contentGroupForPath(planned.path),
      kind: template ? templates[template].label : "Page builder",
      sanity: planned.source !== "hardcoded",
      hardcoded: planned.source !== "sanity",
      cms: page ? { id: page.id, status: page.status } : null,
      live: page?.status === "published" ? "CMS" : liveFromSource(planned.source),
      note: planned.notes[0],
    }
  })
  // Pages created directly in the CMS (no Sanity/built-in original).
  for (const page of cmsPages) {
    if (plan.pages.some((planned) => planned.path === page.path)) continue
    rows.push({
      path: page.path,
      label: page.title,
      group: contentGroupForPath(page.path),
      kind: templateForPath(page.path) ? templates[templateForPath(page.path)!].label : "Page builder",
      sanity: false,
      hardcoded: false,
      cms: { id: page.id, status: page.status },
      live: page.status === "published" ? "CMS" : "Built-in",
      note: page.status === "published" ? "Created in the CMS" : "New CMS draft (not live yet)",
    })
  }

  const shared: SharedAuditRow[] = [
    {
      label: "Pricing plans",
      href: "/admin/content/pricing",
      cms: pricing.exists ? (pricing.published ? "published" : "draft") : null,
      sanity: false,
      live: pricing.published ? "CMS" : "Built-in",
      note: `${plan.pricing.plans.length} plans`,
    },
    {
      label: "Header menu",
      href: "/admin/menus/header",
      cms: menus.header ? "live" : null,
      sanity: false,
      live: menus.header ? "CMS" : "Built-in",
      note: "Saving in the CMS goes live immediately",
    },
    {
      label: "Footer menu",
      href: "/admin/menus/footer",
      cms: menus.footer ? "live" : null,
      sanity: false,
      live: menus.footer ? "CMS" : "Built-in",
      note: "Saving in the CMS goes live immediately",
    },
    {
      label: "Site settings (contact details, header button, social links)",
      href: "/admin/settings/general",
      cms: settingsSaved ? "live" : null,
      sanity: false,
      live: settingsSaved ? "CMS" : "Built-in",
      note: "Empty CMS fields keep the built-in value",
    },
  ]

  const groupOrder = Object.keys(CONTENT_GROUPS)
  rows.sort((a, b) => groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group) || a.path.localeCompare(b.path))
  return { rows, shared, functional: FUNCTIONAL, warnings: plan.warnings }
}

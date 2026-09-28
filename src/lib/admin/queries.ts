import "server-only"

import { cmsAdminDb, isMissingTableError } from "@/lib/cms/db"
import type {
  ActivityLogRow,
  GeneralSettings,
  LeadRow,
  MediaFolder,
  MediaRow,
  MenuLocation,
  PageRow,
  PageSectionRow,
  PageStatus,
  PageType,
  SafeUser,
  SeoRow,
  WebsiteSettings,
} from "@/lib/cms/types"

/**
 * Admin reads. Each returns `{ data, problem }` — `problem` is "missing" when the CMS
 * migration hasn't been applied (screens show a setup notice instead of crashing),
 * "unconfigured" when Supabase env vars are absent, or an error message.
 */
export type Problem = "missing" | "unconfigured" | string | null
export type Result<T> = { data: T; problem: Problem }

function problemOf(error: { code?: string; message?: string } | null): Problem {
  if (!error) return null
  return isMissingTableError(error) ? "missing" : (error.message ?? "Unknown error")
}

function unconfigured<T>(data: T): Result<T> {
  return { data, problem: "unconfigured" }
}

export async function listPages(filter: { status?: PageStatus; type?: PageType; q?: string } = {}): Promise<Result<PageRow[]>> {
  if (!cmsAdminDb) return unconfigured([])
  let query = cmsAdminDb.from("pages").select("*").order("updated_at", { ascending: false }).limit(500)
  if (filter.status) query = query.eq("status", filter.status)
  if (filter.type) query = query.eq("page_type", filter.type)
  if (filter.q) query = query.or(`title.ilike.%${filter.q.replace(/[%,()]/g, "")}%,path.ilike.%${filter.q.replace(/[%,()]/g, "")}%`)
  const { data, error } = await query
  return { data: (data as PageRow[]) ?? [], problem: problemOf(error) }
}

export async function getPageWithSections(id: string): Promise<Result<(PageRow & { sections: PageSectionRow[] }) | null>> {
  if (!cmsAdminDb) return unconfigured(null)
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { data: null, problem: null }
  const { data, error } = await cmsAdminDb.from("pages").select("*, sections:page_sections(*)").eq("id", id).maybeSingle()
  if (data) (data.sections as PageSectionRow[]).sort((a, b) => a.position - b.position)
  return { data: (data as (PageRow & { sections: PageSectionRow[] }) | null) ?? null, problem: problemOf(error) }
}

export async function getPageByPath(path: string): Promise<Result<PageRow | null>> {
  if (!cmsAdminDb) return unconfigured(null)
  const { data, error } = await cmsAdminDb.from("pages").select("*").eq("path", path).maybeSingle()
  return { data: (data as PageRow | null) ?? null, problem: problemOf(error) }
}

export async function listMedia(filter: { folder?: MediaFolder } = {}): Promise<Result<MediaRow[]>> {
  if (!cmsAdminDb) return unconfigured([])
  let query = cmsAdminDb.from("media").select("*").order("created_at", { ascending: false }).limit(1000)
  if (filter.folder) query = query.eq("folder", filter.folder)
  const { data, error } = await query
  return { data: (data as MediaRow[]) ?? [], problem: problemOf(error) }
}

export async function listSeo(): Promise<Result<SeoRow[]>> {
  if (!cmsAdminDb) return unconfigured([])
  const { data, error } = await cmsAdminDb.from("seo").select("*").order("path")
  return { data: (data as SeoRow[]) ?? [], problem: problemOf(error) }
}

export async function getSeo(path: string): Promise<Result<SeoRow | null>> {
  if (!cmsAdminDb) return unconfigured(null)
  const { data, error } = await cmsAdminDb.from("seo").select("*").eq("path", path).maybeSingle()
  return { data: (data as SeoRow | null) ?? null, problem: problemOf(error) }
}

export async function getMenu(location: MenuLocation): Promise<Result<unknown[] | null>> {
  if (!cmsAdminDb) return unconfigured(null)
  const { data, error } = await cmsAdminDb.from("menus").select("items").eq("location", location).maybeSingle()
  return { data: Array.isArray(data?.items) ? (data.items as unknown[]) : null, problem: problemOf(error) }
}

const SAFE_USER_COLUMNS = "id, username, email, full_name, role, is_active, must_change_password, last_login_at, created_at, updated_at"

export async function listUsers(): Promise<Result<SafeUser[]>> {
  if (!cmsAdminDb) return unconfigured([])
  const { data, error } = await cmsAdminDb.from("users").select(SAFE_USER_COLUMNS).order("created_at")
  return { data: (data as SafeUser[]) ?? [], problem: problemOf(error) }
}

export async function getUser(id: string): Promise<Result<SafeUser | null>> {
  if (!cmsAdminDb) return unconfigured(null)
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { data: null, problem: null }
  const { data, error } = await cmsAdminDb.from("users").select(SAFE_USER_COLUMNS).eq("id", id).maybeSingle()
  return { data: (data as SafeUser | null) ?? null, problem: problemOf(error) }
}

export async function getSettings(): Promise<Result<{ general: GeneralSettings; website: WebsiteSettings }>> {
  const empty = { general: {}, website: {} }
  if (!cmsAdminDb) return unconfigured(empty)
  const { data, error } = await cmsAdminDb.from("settings").select("key, value")
  const map = Object.fromEntries((data ?? []).map((row) => [row.key, row.value ?? {}]))
  return { data: { general: map.general ?? {}, website: map.website ?? {} }, problem: problemOf(error) }
}

export const ACTIVITY_PAGE_SIZE = 50

export async function listActivity(filter: { category?: string; page?: number } = {}): Promise<Result<{ rows: ActivityLogRow[]; total: number }>> {
  if (!cmsAdminDb) return unconfigured({ rows: [], total: 0 })
  const page = Math.max(1, filter.page ?? 1)
  let query = cmsAdminDb
    .from("activity_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * ACTIVITY_PAGE_SIZE, page * ACTIVITY_PAGE_SIZE - 1)
  if (filter.category) query = query.like("action", `${filter.category}.%`)
  const { data, error, count } = await query
  return { data: { rows: (data as ActivityLogRow[]) ?? [], total: count ?? 0 }, problem: problemOf(error) }
}

export async function listLeads(limit = 500): Promise<Result<LeadRow[]>> {
  if (!cmsAdminDb) return unconfigured([])
  const { data, error } = await cmsAdminDb.from("leads").select("*").order("created_at", { ascending: false }).limit(limit)
  return { data: (data as LeadRow[]) ?? [], problem: problemOf(error) }
}

export type NewsletterRow = { id: string; created_at: string; email: string; source: string | null; page_url: string | null }
export type OrderRow = {
  id: string
  created_at: string
  order_ref: string
  plan_name: string
  billing_label: string
  amount: string
  name: string
  email: string
  phone: string
  status: string
}

export async function listNewsletter(): Promise<Result<NewsletterRow[]>> {
  if (!cmsAdminDb) return unconfigured([])
  const { data, error } = await cmsAdminDb.from("newsletter_subscribers").select("*").order("created_at", { ascending: false }).limit(500)
  return { data: (data as NewsletterRow[]) ?? [], problem: problemOf(error) }
}

export async function listOrders(): Promise<Result<OrderRow[]>> {
  if (!cmsAdminDb) return unconfigured([])
  const { data, error } = await cmsAdminDb.from("orders").select("*").order("created_at", { ascending: false }).limit(500)
  return { data: (data as OrderRow[]) ?? [], problem: problemOf(error) }
}

async function countRows(table: string) {
  if (!cmsAdminDb) return { count: 0, problem: "unconfigured" as Problem }
  const { count, error } = await cmsAdminDb.from(table).select("id", { count: "exact", head: true })
  return { count: count ?? 0, problem: problemOf(error) }
}

export type DashboardData = {
  totals: { pages: number; published: number; drafts: number; blogs: number; media: number; mediaBytes: number; users: number; leads30d: number; leadsTotal: number }
  pagesByType: { type: PageType; count: number }[]
  recentPages: PageRow[]
  recentActivity: ActivityLogRow[]
  leadsByDay: { date: string; count: number }[]
  problem: Problem
}

export async function getDashboardData(): Promise<DashboardData> {
  const since = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
  since.setUTCHours(0, 0, 0, 0)

  const empty: DashboardData = {
    totals: { pages: 0, published: 0, drafts: 0, blogs: 0, media: 0, mediaBytes: 0, users: 0, leads30d: 0, leadsTotal: 0 },
    pagesByType: [],
    recentPages: [],
    recentActivity: [],
    leadsByDay: [],
    problem: "unconfigured",
  }
  if (!cmsAdminDb) return empty

  const [pages, media, users, activity, leadsRecent, leadsTotal] = await Promise.all([
    cmsAdminDb.from("pages").select("*").order("updated_at", { ascending: false }).limit(1000),
    cmsAdminDb.from("media").select("size_bytes").limit(5000),
    countRows("users"),
    cmsAdminDb.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(8),
    cmsAdminDb.from("leads").select("created_at").gte("created_at", since.toISOString()).limit(5000),
    countRows("leads"),
  ])

  const pageRows = (pages.data as PageRow[]) ?? []
  const byType = new Map<PageType, number>()
  for (const page of pageRows) byType.set(page.page_type, (byType.get(page.page_type) ?? 0) + 1)

  const dayCounts = new Map<string, number>()
  for (let i = 0; i < 30; i++) dayCounts.set(new Date(since.getTime() + i * 86_400_000).toISOString().slice(0, 10), 0)
  for (const lead of leadsRecent.data ?? []) {
    const day = String(lead.created_at).slice(0, 10)
    if (dayCounts.has(day)) dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1)
  }

  return {
    totals: {
      pages: pageRows.filter((p) => p.page_type !== "blog").length,
      published: pageRows.filter((p) => p.status === "published").length,
      drafts: pageRows.filter((p) => p.status === "draft").length,
      blogs: pageRows.filter((p) => p.page_type === "blog").length,
      media: media.data?.length ?? 0,
      mediaBytes: (media.data ?? []).reduce((sum, row) => sum + Number(row.size_bytes ?? 0), 0),
      users: users.count,
      leads30d: leadsRecent.data?.length ?? 0,
      leadsTotal: leadsTotal.count,
    },
    pagesByType: [...byType.entries()].map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count),
    recentPages: pageRows.slice(0, 6),
    recentActivity: (activity.data as ActivityLogRow[]) ?? [],
    leadsByDay: [...dayCounts.entries()].map(([date, count]) => ({ date, count })),
    problem: problemOf(pages.error) ?? problemOf(media.error) ?? problemOf(activity.error),
  }
}

import "server-only"

import { toFaq, toPlan } from "@/lib/assistant/server"
import type { AssistantFaq, AssistantPlan } from "@/lib/assistant/types"
import { cmsAdminDb, isMissingTableError } from "@/lib/cms/db"

import type { Problem, Result } from "./queries"

export const ASSISTANT_PAGE_SIZE = 20

const problemOf = (error: { code?: string; message?: string } | null): Problem =>
  !error ? null : isMissingTableError(error) ? "assistant-missing" : (error.message ?? "Unknown error")

/** Strips PostgREST filter syntax from a search term. */
const term = (q?: string) => (q ?? "").replace(/[%,()*\\]/g, " ").trim().slice(0, 80)

export async function listAssistantFaqs(filter: { q?: string; category?: string; status?: string; page?: number }): Promise<
  Result<{ rows: AssistantFaq[]; total: number; categories: string[] }>
> {
  const empty = { rows: [], total: 0, categories: [] }
  if (!cmsAdminDb) return { data: empty, problem: "unconfigured" }
  const page = Math.max(1, filter.page ?? 1)
  let query = cmsAdminDb
    .from("chatbot_faqs")
    .select("id, question, answer, category, keywords, status", { count: "exact" })
    .order("category")
    .order("sort_order")
    .order("question")
    .range((page - 1) * ASSISTANT_PAGE_SIZE, page * ASSISTANT_PAGE_SIZE - 1)
  const q = term(filter.q)
  if (q) query = query.or(`question.ilike.%${q}%,answer.ilike.%${q}%`)
  if (filter.category) query = query.eq("category", filter.category)
  if (filter.status === "published" || filter.status === "draft") query = query.eq("status", filter.status)
  const [{ data, count, error }, cats] = await Promise.all([query, cmsAdminDb.from("chatbot_faqs").select("category").limit(2000)])
  return {
    data: {
      rows: ((data ?? []) as Parameters<typeof toFaq>[0][]).map(toFaq),
      total: count ?? 0,
      categories: [...new Set(((cats.data ?? []) as { category: string }[]).map((row) => row.category))].sort(),
    },
    problem: problemOf(error),
  }
}

export async function listAssistantPlans(): Promise<Result<AssistantPlan[]>> {
  if (!cmsAdminDb) return { data: [], problem: "unconfigured" }
  const { data, error } = await cmsAdminDb.from("chatbot_plans").select("*").order("category").order("sort_order").order("name")
  return { data: ((data ?? []) as Parameters<typeof toPlan>[0][]).map(toPlan), problem: problemOf(error) }
}

export type ConversationRow = {
  id: string
  visitor_id: string
  started_at: string
  last_activity_at: string
  message_count: number
  lead_id: string | null
  page_url: string | null
  lead: { name: string; email: string; phone: string } | null
}

export async function listConversations(filter: { q?: string; lead?: string; page?: number }): Promise<Result<{ rows: ConversationRow[]; total: number }>> {
  if (!cmsAdminDb) return { data: { rows: [], total: 0 }, problem: "unconfigured" }
  const page = Math.max(1, filter.page ?? 1)
  let query = cmsAdminDb
    .from("chatbot_conversations")
    .select("id, visitor_id, started_at, last_activity_at, message_count, lead_id, page_url, lead:leads(name, email, phone)", { count: "exact" })
    .order("last_activity_at", { ascending: false })
    .range((page - 1) * ASSISTANT_PAGE_SIZE, page * ASSISTANT_PAGE_SIZE - 1)
  if (filter.lead === "yes") query = query.not("lead_id", "is", null)
  if (filter.lead === "no") query = query.is("lead_id", null)
  const q = term(filter.q)
  if (q) {
    // Search the visitor id, or the name/email/phone of the lead a conversation produced.
    const { data: leads } = await cmsAdminDb.from("leads").select("id").or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`).limit(200)
    const leadIds = ((leads ?? []) as { id: string }[]).map((lead) => lead.id)
    query = leadIds.length ? query.or(`visitor_id.ilike.%${q}%,lead_id.in.(${leadIds.join(",")})`) : query.ilike("visitor_id", `%${q}%`)
  }
  const { data, count, error } = await query
  return { data: { rows: (data ?? []) as unknown as ConversationRow[], total: count ?? 0 }, problem: problemOf(error) }
}

export type MessageRow = { id: number; role: "visitor" | "assistant"; kind: string; body: string; metadata: Record<string, unknown> | null; created_at: string }

export async function getConversation(id: string): Promise<Result<{ conversation: ConversationRow; messages: MessageRow[] } | null>> {
  if (!cmsAdminDb) return { data: null, problem: "unconfigured" }
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { data: null, problem: null }
  const [conversation, messages] = await Promise.all([
    cmsAdminDb.from("chatbot_conversations").select("id, visitor_id, started_at, last_activity_at, message_count, lead_id, page_url, lead:leads(name, email, phone)").eq("id", id).maybeSingle(),
    cmsAdminDb.from("chatbot_messages").select("id, role, kind, body, metadata, created_at").eq("conversation_id", id).order("id").limit(1000),
  ])
  if (!conversation.data) return { data: null, problem: problemOf(conversation.error) }
  return { data: { conversation: conversation.data as unknown as ConversationRow, messages: (messages.data ?? []) as MessageRow[] }, problem: problemOf(messages.error) }
}

export type AssistantAnalytics = {
  conversations: number
  leads: number
  messages: number
  unanswered: number
  topQuestions: { label: string; count: number }[]
  topQuickActions: { label: string; count: number }[]
  topPlans: { label: string; count: number }[]
  topUnanswered: { label: string; count: number }[]
}

const top = (counts: Map<string, number>, limit = 10) =>
  [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([label, count]) => ({ label, count }))
const bump = (counts: Map<string, number>, key: string | undefined) => {
  if (key) counts.set(key, (counts.get(key) ?? 0) + 1)
}

/** Totals and top lists for the last `days` days (all time when null). Computed from stored messages. */
export async function getAssistantAnalytics(days: number | null): Promise<Result<AssistantAnalytics>> {
  const empty: AssistantAnalytics = { conversations: 0, leads: 0, messages: 0, unanswered: 0, topQuestions: [], topQuickActions: [], topPlans: [], topUnanswered: [] }
  if (!cmsAdminDb) return { data: empty, problem: "unconfigured" }
  // "All time" is simply everything since the epoch.
  const since = days ? new Date(Date.now() - days * 86_400_000).toISOString() : new Date(0).toISOString()

  const [conversations, leads, messages, events] = await Promise.all([
    cmsAdminDb.from("chatbot_conversations").select("id", { count: "exact", head: true }).gte("started_at", since),
    cmsAdminDb.from("chatbot_conversations").select("id", { count: "exact", head: true }).not("lead_id", "is", null).gte("started_at", since),
    cmsAdminDb.from("chatbot_messages").select("id", { count: "exact", head: true }).gte("created_at", since),
    cmsAdminDb
      .from("chatbot_messages")
      .select("kind, body, metadata")
      .in("kind", ["faq_answer", "quick_action", "recommendation", "fallback"])
      .gte("created_at", since)
      .order("id", { ascending: false })
      .limit(20000),
  ])
  const error = conversations.error ?? events.error
  if (error) return { data: empty, problem: problemOf(error) }

  const questions = new Map<string, number>()
  const actions = new Map<string, number>()
  const plans = new Map<string, number>()
  const unanswered = new Map<string, number>()
  let fallbackCount = 0
  for (const row of (events.data ?? []) as { kind: string; body: string; metadata: Record<string, unknown> | null }[]) {
    const meta = row.metadata ?? {}
    if (row.kind === "faq_answer") bump(questions, typeof meta.question === "string" ? meta.question : undefined)
    else if (row.kind === "quick_action") bump(actions, typeof meta.label === "string" ? meta.label : row.body)
    else if (row.kind === "recommendation") bump(plans, typeof meta.recommendedPlan === "string" ? meta.recommendedPlan : typeof meta.category === "string" ? `${meta.category} (no plan configured)` : undefined)
    else if (row.kind === "fallback") {
      fallbackCount++
      bump(unanswered, typeof meta.question === "string" ? meta.question.toLowerCase() : undefined)
    }
  }
  return {
    data: {
      conversations: conversations.count ?? 0,
      leads: leads.count ?? 0,
      messages: messages.count ?? 0,
      unanswered: fallbackCount,
      topQuestions: top(questions),
      topQuickActions: top(actions),
      topPlans: top(plans),
      topUnanswered: top(unanswered),
    },
    problem: null,
  }
}

/** True once supabase/migrations/0006_create_hosting_assistant.sql has run. */
export async function assistantTablesReady(): Promise<boolean> {
  if (!cmsAdminDb) return false
  const { error } = await cmsAdminDb.from("chatbot_conversations").select("id").limit(1)
  return !error
}

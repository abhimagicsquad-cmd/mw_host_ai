import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"

import { cmsAdminDb, cmsPublicDb, isMissingTableError } from "@/lib/cms/db"
import { getCmsAssistantSettingsValue } from "@/lib/cms/content"

import type { KnowledgeBase } from "./engine"
import { ASSISTANT_SETTINGS_KEY, parseAssistantSettings } from "./settings"
import { isPlanCategory, type AssistantFaq, type AssistantPlan, type AssistantSettings, type LoggedMessage } from "./types"

/** Website read: cached under the "cms" tag, so a dashboard save is live on the next request. */
export async function getLiveAssistantSettings(): Promise<AssistantSettings> {
  return parseAssistantSettings(await getCmsAssistantSettingsValue())
}

/** Dashboard read: always fresh. */
export async function getAdminAssistantSettings(): Promise<{ settings: AssistantSettings; saved: boolean }> {
  if (!cmsAdminDb) return { settings: parseAssistantSettings(null), saved: false }
  const { data } = await cmsAdminDb.from("settings").select("value").eq("key", ASSISTANT_SETTINGS_KEY).maybeSingle()
  return { settings: parseAssistantSettings(data?.value ?? null), saved: Boolean(data) }
}

type FaqRow = { id: string; question: string; answer: string; category: string; keywords: string[] | null; status: string }
type PlanRow = {
  id: string
  name: string
  category: string
  currency: string
  monthly_price: number | string | null
  yearly_price: number | string | null
  features: string[] | null
  is_popular: boolean
  cta_url: string | null
  sort_order: number
  is_active: boolean
}

export const toFaq = (row: FaqRow): AssistantFaq => ({
  id: row.id,
  question: row.question,
  answer: row.answer,
  category: row.category,
  keywords: row.keywords ?? [],
  status: row.status === "draft" ? "draft" : "published",
})

const price = (value: number | string | null) => (value === null || value === "" ? null : Number(value))

export const toPlan = (row: PlanRow): AssistantPlan => ({
  id: row.id,
  name: row.name,
  category: isPlanCategory(row.category) ? row.category : "shared",
  currency: row.currency === "USD" ? "USD" : "INR",
  monthlyPrice: price(row.monthly_price),
  yearlyPrice: price(row.yearly_price),
  features: row.features ?? [],
  isPopular: row.is_popular,
  ctaUrl: row.cta_url,
  sortOrder: row.sort_order,
  isActive: row.is_active,
})

/**
 * Published FAQs and active plans plus settings. `live` reads through the website cache;
 * `admin` (dashboard preview) reads fresh. Missing tables (migration 0006 not run) give empty lists.
 */
export async function loadKnowledgeBase(mode: "live" | "admin", settings?: AssistantSettings): Promise<KnowledgeBase> {
  const db: SupabaseClient | null = mode === "live" ? cmsPublicDb : cmsAdminDb
  const resolved = settings ?? (mode === "live" ? await getLiveAssistantSettings() : (await getAdminAssistantSettings()).settings)
  if (!db) return { settings: resolved, faqs: [], plans: [] }
  const [faqs, plans] = await Promise.all([
    db.from("chatbot_faqs").select("id, question, answer, category, keywords, status").eq("status", "published").order("sort_order").limit(1000),
    db.from("chatbot_plans").select("*").eq("is_active", true).order("sort_order").limit(200),
  ])
  return {
    settings: resolved,
    faqs: faqs.error ? [] : ((faqs.data ?? []) as FaqRow[]).map(toFaq),
    plans: plans.error ? [] : ((plans.data ?? []) as PlanRow[]).map(toPlan),
  }
}

// --- Conversation storage -------------------------------------------------------------------

const MAX_MESSAGES_PER_CONVERSATION = 300

export type ConversationHandle = { id: string; messageCount: number } | null

/**
 * Finds the visitor's conversation (it must belong to the same visitor id) or starts a new one.
 * Returns null when storage isn't available (no DB or migration 0006 not run) — the chat still works.
 */
export async function openConversation(
  visitorId: string,
  conversationId: string | null | undefined,
  pageUrl?: string,
  /** Rate limit for new conversations: `allowed` is checked first, `record` runs only once one is created. */
  limiter?: { allowed: () => boolean; record: () => void }
): Promise<ConversationHandle | "full" | "limited"> {
  if (!cmsAdminDb) return null
  if (conversationId) {
    const { data, error } = await cmsAdminDb.from("chatbot_conversations").select("id, message_count, visitor_id").eq("id", conversationId).maybeSingle()
    if (isMissingTableError(error)) return null
    if (data && data.visitor_id === visitorId) {
      return data.message_count >= MAX_MESSAGES_PER_CONVERSATION ? "full" : { id: data.id, messageCount: data.message_count }
    }
  }
  if (limiter && !limiter.allowed()) return "limited"
  const { data, error } = await cmsAdminDb
    .from("chatbot_conversations")
    .insert({ visitor_id: visitorId, page_url: pageUrl?.slice(0, 500) || null })
    .select("id")
    .single()
  if (error) {
    if (!isMissingTableError(error)) console.error("[assistant] could not start a conversation", error.message)
    return null
  }
  limiter?.record()
  return { id: data.id, messageCount: 0 }
}

/** Appends messages and bumps the conversation's counters. Best effort: never throws. */
export async function storeMessages(conversation: { id: string; messageCount: number }, messages: LoggedMessage[]) {
  if (!cmsAdminDb || !messages.length) return
  try {
    const { error } = await cmsAdminDb.from("chatbot_messages").insert(
      messages.map((message) => ({
        conversation_id: conversation.id,
        role: message.role,
        kind: message.kind.slice(0, 40),
        body: message.body.slice(0, 4000),
        metadata: message.metadata ?? null,
      }))
    )
    if (error) throw error
    await cmsAdminDb
      .from("chatbot_conversations")
      .update({ message_count: conversation.messageCount + messages.length, last_activity_at: new Date().toISOString() })
      .eq("id", conversation.id)
  } catch (error) {
    console.error("[assistant] could not store messages", error)
  }
}

/** Links a lead from /api/leads to the conversation it came from (same visitor only). */
export async function linkLeadToConversation(conversationId: string, visitorId: string, leadId: string | null, summary: string) {
  if (!cmsAdminDb) return false
  try {
    const { data, error } = await cmsAdminDb
      .from("chatbot_conversations")
      .update({ ...(leadId ? { lead_id: leadId } : {}), last_activity_at: new Date().toISOString() })
      .eq("id", conversationId)
      .eq("visitor_id", visitorId)
      .select("id, message_count")
      .maybeSingle()
    if (error || !data) return false
    await storeMessages({ id: data.id, messageCount: data.message_count }, [{ role: "visitor", kind: "lead_captured", body: summary, metadata: { leadId } }])
    return true
  } catch {
    return false
  }
}

// --- Abuse prevention -----------------------------------------------------------------------

const windows = new Map<string, number[]>()

function recentHits(key: string, windowMs: number) {
  const now = Date.now()
  if (windows.size > 5000) {
    for (const [k, hits] of windows) if (hits.every((t) => now - t > windowMs)) windows.delete(k)
  }
  return (windows.get(key) ?? []).filter((t) => now - t < windowMs)
}

/**
 * In-memory sliding-window limiter (per server instance, like /api/leads). `key` is e.g.
 * "msg:<ip>"; records a hit and returns true when the caller is over `max` hits in `windowMs`.
 */
export function overLimit(key: string, max: number, windowMs: number) {
  const hits = recentHits(key, windowMs)
  hits.push(Date.now())
  windows.set(key, hits)
  return hits.length > max
}

/** For limits on things that may not happen: check with `underLimit`, then `recordHit` once it did. */
export function underLimit(key: string, max: number, windowMs: number) {
  return recentHits(key, windowMs).length < max
}

export function recordHit(key: string) {
  const hits = windows.get(key) ?? []
  hits.push(Date.now())
  windows.set(key, hits)
}

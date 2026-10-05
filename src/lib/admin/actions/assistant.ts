"use server"

import { z } from "zod"

import { dedicatedPages } from "@/constants/dedicated-pages-data"
import { domainPages } from "@/constants/domain-pages-data"
import { emailPages } from "@/constants/email-pages-data"
import { hostingPages } from "@/constants/hosting-pages-data"
import { kbGuides } from "@/constants/kb-guides"
import { serviceAnswers } from "@/constants/service-answers"
import { serviceLandings } from "@/constants/service-landing-data"
import { sslPages } from "@/constants/ssl-pages-data"
import { logActivity } from "@/lib/admin/activity"
import { actorId, authorizeAction } from "@/lib/admin/auth"
import { respond, tokens } from "@/lib/assistant/engine"
import { loadKnowledgeBase } from "@/lib/assistant/server"
import { ASSISTANT_SETTINGS_KEY, parseAssistantSettings } from "@/lib/assistant/settings"
import { isPlanCategory, PLAN_CATEGORIES, type AssistantEvent, type AssistantResponse, type AssistantSettings } from "@/lib/assistant/types"
import { getCmsPricingPlans } from "@/lib/cms/content"
import { cmsAdminDb, isMissingTableError } from "@/lib/cms/db"
import type { ActionState } from "@/lib/cms/types"
import { leadApiPayloadSchema } from "@/schemas/lead-form.schema"

import { refreshWebsite, toActionError } from "./utils"

function db() {
  if (!cmsAdminDb) throw new Error("The CMS database is not configured.")
  return cmsAdminDb
}

const MIGRATION_ERROR: ActionState = {
  error: "The Hosting Assistant tables don't exist yet. Run supabase/migrations/0006_create_hosting_assistant.sql in the Supabase SQL editor, then try again.",
}

/** Turns a missing-table error into the migration hint; anything else goes through toActionError. */
const fail = (error: unknown): ActionState => (isMissingTableError(error as { code?: string; message?: string }) ? MIGRATION_ERROR : toActionError(error))

async function currentSettings(): Promise<AssistantSettings> {
  const { data, error } = await db().from("settings").select("value").eq("key", ASSISTANT_SETTINGS_KEY).maybeSingle()
  if (error) throw error
  return parseAssistantSettings(data?.value ?? null)
}

async function writeSettings(settings: AssistantSettings, userId: string | null) {
  const { error } = await db()
    .from("settings")
    .upsert({ key: ASSISTANT_SETTINGS_KEY, value: settings, updated_by: userId, updated_at: new Date().toISOString() }, { onConflict: "key" })
  if (error) throw error
  // The widget and its knowledge are read through the website cache.
  refreshWebsite()
}

// --- On / off ------------------------------------------------------------------------------

export async function setAssistantEnabledAction(enabled: boolean): Promise<ActionState> {
  try {
    const admin = await authorizeAction("assistant.manage")
    if (typeof enabled !== "boolean") return { error: "Invalid status." }
    const settings = await currentSettings()
    await writeSettings({ ...settings, enabled }, actorId(admin))
    await logActivity({
      admin,
      action: enabled ? "assistant.enabled" : "assistant.disabled",
      entityType: "assistant",
      description: enabled ? "Hosting Assistant Enabled" : "Hosting Assistant Disabled",
    })
    return { ok: true, message: enabled ? "Hosting Assistant is live on the website." : "Hosting Assistant is hidden from the website." }
  } catch (error) {
    return fail(error)
  }
}

// --- Settings sections ---------------------------------------------------------------------

type Section = "general" | "quickActions" | "starters" | "flow"

const SECTION_LABELS: Record<Section, string> = {
  general: "settings",
  quickActions: "quick actions",
  starters: "conversation starters",
  flow: "recommendation flow",
}

/**
 * Saves one part of the assistant's configuration (the on/off status is never changed here).
 * The payload is validated by the same parser the website uses; items that don't validate are
 * reported instead of silently dropped.
 */
export async function saveAssistantSectionAction(section: Section, payload: string): Promise<ActionState> {
  try {
    const admin = await authorizeAction("assistant.manage")
    if (!(section in SECTION_LABELS)) return { error: "Unknown section." }
    let submitted: Record<string, unknown>
    try {
      submitted = JSON.parse(payload) as Record<string, unknown>
    } catch {
      return { error: "Invalid data." }
    }
    const current = await currentSettings()

    let next: AssistantSettings
    if (section === "general") {
      const { quickActions, starters, flow, enabled } = current
      next = { ...parseAssistantSettings({ ...submitted, quickActions, starters, flow }), enabled }
      const pages = Array.isArray(submitted.pages) ? submitted.pages : []
      if (pages.length !== next.pages.length) return { error: "Each page must be a path starting with “/” (use * at the end for a section, e.g. /hosting/*)." }
      if (submitted.visibility === "selected" && !next.pages.length) return { error: "Add at least one page, or choose “Show on all pages”." }
    } else {
      const items = submitted[section === "flow" ? "steps" : section]
      const merged = section === "flow" ? { ...current, flow: submitted } : { ...current, [section]: items }
      next = { ...parseAssistantSettings(merged), enabled: current.enabled }
      if (!Array.isArray(items)) return { error: "Invalid data." }
      if (section === "flow") {
        // Every submitted question and answer must survive validation, and the flow needs a question.
        const submittedOptions = items.reduce((n: number, step) => n + (Array.isArray((step as { options?: unknown[] })?.options) ? (step as { options: unknown[] }).options.length : 0), 0)
        const keptOptions = next.flow.steps.reduce((n, step) => n + step.options.length, 0)
        if (!items.length) return { error: "The recommendation flow needs at least one question." }
        if (next.flow.steps.length !== items.length || keptOptions !== submittedOptions) {
          return { error: "Every question needs text, and every answer needs a label." }
        }
      } else if (next[section].length !== items.length) {
        return { error: "Every item needs a label, an action and (except “recommendation”) a value — links must start with / or https://." }
      }
      const ids = section === "flow" ? next.flow.steps.map((s) => s.id) : (next[section] as { id: string }[]).map((item) => item.id)
      if (new Set(ids).size !== ids.length) return { error: "Two items share the same id. Remove one and try again." }
      if (section === "starters") {
        const unknown = next.starters.find((starter) => starter.actionId && !next.quickActions.some((action) => action.id === starter.actionId))
        if (unknown) return { error: `“${unknown.text}” runs a quick action that no longer exists. Pick another or “Answer as a question”.` }
      }
    }

    await writeSettings(next, actorId(admin))
    await logActivity({ admin, action: "assistant.settings_updated", entityType: "assistant", description: `Updated Hosting Assistant ${SECTION_LABELS[section]}` })
    return { ok: true, message: `Saved — live on the website now${next.enabled ? "" : " (once the assistant is switched on)"}.` }
  } catch (error) {
    return fail(error)
  }
}

// --- Plans ---------------------------------------------------------------------------------

const money = z
  .string()
  .trim()
  .transform((value) => value.replace(/[,₹$\s]/g, ""))
  .refine((value) => value === "" || /^\d{1,9}(\.\d{1,2})?$/.test(value), "Enter a price like 299 or 299.50, or leave it empty.")
  .transform((value) => (value === "" ? null : Number(value)))

const planSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  name: z.string().trim().min(1, "Plan name is required.").max(120),
  category: z.string().refine(isPlanCategory, "Choose a category."),
  currency: z.enum(["INR", "USD"]),
  monthly_price: money,
  yearly_price: money,
  features: z.string().max(4000).transform((value) => value.split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 15)),
  cta_url: z
    .string()
    .trim()
    .max(1000)
    .refine((value) => value === "" || /^(\/(?!\/)|https:\/\/)/.test(value), "Links must start with / or https://."),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
  is_popular: z.string().optional().transform((value) => value === "on"),
  is_active: z.string().optional().transform((value) => value === "on"),
})

export async function savePlanAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await authorizeAction("assistant.manage")
    const parsed = planSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      return { error: issue?.message, fieldErrors: { [String(issue?.path[0])]: issue?.message ?? "" } }
    }
    const { id, ...fields } = parsed.data
    const row = { ...fields, cta_url: fields.cta_url || null, updated_at: new Date().toISOString() }
    const { data, error } = id
      ? await db().from("chatbot_plans").update(row).eq("id", id).select("id, name").single()
      : await db().from("chatbot_plans").insert(row).select("id, name").single()
    if (error) throw error
    await logActivity({
      admin,
      action: id ? "assistant.plan_updated" : "assistant.plan_created",
      entityType: "assistant_plan",
      entityId: data.id,
      description: `${id ? "Updated" : "Added"} Hosting Assistant plan “${data.name}”`,
    })
    refreshWebsite()
    return { ok: true, message: id ? "Plan saved." : "Plan added." }
  } catch (error) {
    return fail(error)
  }
}

export async function deletePlanAction(id: string): Promise<ActionState> {
  try {
    const admin = await authorizeAction("assistant.manage")
    const { data, error } = await db().from("chatbot_plans").delete().eq("id", id).select("id, name").single()
    if (error) throw error
    await logActivity({ admin, action: "assistant.plan_deleted", entityType: "assistant_plan", entityId: id, description: `Deleted Hosting Assistant plan “${data.name}”` })
    refreshWebsite()
    return { ok: true, message: "Plan deleted." }
  } catch (error) {
    return fail(error)
  }
}

/** Saves a new display order: `ids` in the order they should appear (within their categories). */
export async function reorderPlansAction(ids: string[]): Promise<ActionState> {
  try {
    const admin = await authorizeAction("assistant.manage")
    if (!Array.isArray(ids) || ids.length > 200 || !ids.every((id) => typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id))) return { error: "Invalid order." }
    const results = await Promise.all(ids.map((id, index) => db().from("chatbot_plans").update({ sort_order: (index + 1) * 10 }).eq("id", id)))
    const failed = results.find((result) => result.error)
    if (failed?.error) throw failed.error
    await logActivity({ admin, action: "assistant.plan_updated", entityType: "assistant_plan", description: `Reordered Hosting Assistant plans (${ids.length})` })
    refreshWebsite()
    return { ok: true, message: "Order saved." }
  } catch (error) {
    return fail(error)
  }
}

/** Monthly figure from a Pricing Plans price string such as "₹145" with suffix "/mo". */
function parsePrice(price: string | undefined) {
  const match = price?.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/)
  return match ? Number(match[1]) : null
}

const PRICING_SERVICE_TO_CATEGORY: Record<string, (typeof PLAN_CATEGORIES)[number]["value"]> = {
  "shared-hosting": "shared",
  "wordpress-hosting": "wordpress",
  "vps-hosting": "vps",
  "cloud-hosting": "cloud",
}

/**
 * Copies the website's published Content → Pricing Plans (shared, WordPress, VPS, cloud) into the
 * assistant, so its recommendations quote the same prices. Existing assistant plans with the same
 * name and category are updated, others are added; nothing is deleted.
 */
export async function importPlansFromPricingAction(): Promise<ActionState> {
  try {
    const admin = await authorizeAction("assistant.manage")
    const pricing = (await getCmsPricingPlans()) ?? []
    const candidates = pricing.filter((plan) => plan.service && PRICING_SERVICE_TO_CATEGORY[plan.service])
    if (!candidates.length) return { error: "No published hosting plans were found in Content → Pricing Plans." }

    const { data: existing, error: readError } = await db().from("chatbot_plans").select("id, name, category")
    if (readError) throw readError
    let added = 0
    let updated = 0
    for (const [index, plan] of candidates.entries()) {
      const category = PRICING_SERVICE_TO_CATEGORY[plan.service as string]
      const perMonth = /mo|month/i.test(plan.priceSuffix ?? "")
      const yearlyCycle = plan.billingCycles?.find((cycle) => cycle.cycle === "annually")
      const row = {
        name: plan.name.slice(0, 120),
        category,
        currency: plan.region === "usa" || plan.price.includes("$") ? "USD" : "INR",
        monthly_price: perMonth ? parsePrice(plan.price) : null,
        yearly_price: yearlyCycle ? parsePrice(yearlyCycle.totalPrice) : !perMonth ? parsePrice(plan.price) : null,
        features: (plan.features ?? []).slice(0, 15),
        is_popular: Boolean(plan.featured),
        cta_url: plan.cta?.href && /^(\/(?!\/)|https:\/\/)/.test(plan.cta.href) ? plan.cta.href : null,
        sort_order: (index + 1) * 10,
        is_active: true,
        updated_at: new Date().toISOString(),
      }
      const match = (existing ?? []).find((p) => p.name === row.name && p.category === category)
      const { error } = match ? await db().from("chatbot_plans").update(row).eq("id", match.id) : await db().from("chatbot_plans").insert(row)
      if (error) throw error
      if (match) updated++
      else added++
    }
    await logActivity({ admin, action: "assistant.plans_imported", entityType: "assistant_plan", description: `Imported website pricing into the Hosting Assistant (${added} added, ${updated} updated)` })
    refreshWebsite()
    return { ok: true, message: `Imported from Pricing Plans: ${added} added, ${updated} updated.` }
  } catch (error) {
    return fail(error)
  }
}

// --- FAQs ----------------------------------------------------------------------------------

const faqSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  question: z.string().trim().min(3, "Question is required.").max(300),
  answer: z.string().trim().min(1, "Answer is required.").max(4000),
  category: z
    .string()
    .trim()
    .toLowerCase()
    .max(40)
    .transform((value) => value.replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "") || "general"),
  keywords: z.string().max(1000).transform((value) => [...new Set(value.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean))].slice(0, 20)),
  status: z.enum(["published", "draft"]),
})

export async function saveFaqAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await authorizeAction("assistant.manage")
    const parsed = faqSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      return { error: issue?.message, fieldErrors: { [String(issue?.path[0])]: issue?.message ?? "" } }
    }
    const { id, ...fields } = parsed.data
    const row = { ...fields, updated_at: new Date().toISOString() }
    const { data, error } = id
      ? await db().from("chatbot_faqs").update(row).eq("id", id).select("id, question").single()
      : await db().from("chatbot_faqs").insert(row).select("id, question").single()
    if (error) throw error
    await logActivity({
      admin,
      action: id ? "assistant.faq_updated" : "assistant.faq_created",
      entityType: "assistant_faq",
      entityId: data.id,
      description: `${id ? "Updated" : "Added"} Hosting Assistant FAQ “${data.question}”`,
    })
    refreshWebsite()
    return { ok: true, message: id ? "FAQ saved." : "FAQ added." }
  } catch (error) {
    return fail(error)
  }
}

export async function deleteFaqAction(id: string): Promise<ActionState> {
  try {
    const admin = await authorizeAction("assistant.manage")
    const { data, error } = await db().from("chatbot_faqs").delete().eq("id", id).select("id, question").single()
    if (error) throw error
    await logActivity({ admin, action: "assistant.faq_deleted", entityType: "assistant_faq", entityId: id, description: `Deleted Hosting Assistant FAQ “${data.question}”` })
    refreshWebsite()
    return { ok: true, message: "FAQ deleted." }
  } catch (error) {
    return fail(error)
  }
}

/** Keywords for an imported FAQ: the question's meaningful words, longest first. */
const keywordsFor = (question: string) => [...tokens(question)].filter((word) => word.length > 2).sort((a, b) => b.length - a.length).slice(0, 6)

/**
 * Seeds the FAQ list from the questions already answered on the website (product pages,
 * service pages and Knowledge Base guides), so the assistant starts from published copy rather
 * than invented answers. Questions that already exist are skipped. Imported FAQs are drafts
 * until reviewed, unless `publish` is set.
 */
export async function importWebsiteFaqsAction(publish: boolean): Promise<ActionState> {
  try {
    const admin = await authorizeAction("assistant.manage")
    type Source = { question: string; answer: unknown; category: string }
    const sources: Source[] = [
      ...hostingPages.flatMap((page) => page.faqs.map((faq) => ({ ...faq, category: page.slug.includes("wordpress") ? "wordpress" : "hosting" }))),
      ...dedicatedPages.flatMap((page) => page.faqs.map((faq) => ({ ...faq, category: "dedicated" }))),
      ...domainPages.flatMap((page) => page.faqs.map((faq) => ({ ...faq, category: "domains" }))),
      ...emailPages.flatMap((page) => page.faqs.map((faq) => ({ ...faq, category: "email" }))),
      ...sslPages.flatMap((page) => page.faqs.map((faq) => ({ ...faq, category: "ssl" }))),
      ...serviceLandings.flatMap((page) => page.faqs.map((faq) => ({ ...faq, category: page.slug.replace(/-hosting$|^website-/, "") || "services" }))),
      ...Object.values(serviceAnswers).map((entry) => ({ question: entry.question, answer: entry.answer, category: entry.topic })),
      ...kbGuides.flatMap((guide) => guide.faqs.map((faq) => ({ ...faq, category: guide.categorySlug }))),
    ]
    // Only plain-text answers can be stored; skip duplicates by question.
    const seen = new Set<string>()
    const usable = sources.filter((s): s is Source & { answer: string } => {
      const key = s.question.trim().toLowerCase()
      if (typeof s.answer !== "string" || !s.answer.trim() || seen.has(key)) return false
      seen.add(key)
      return true
    })

    const { data: existing, error: readError } = await db().from("chatbot_faqs").select("question").limit(5000)
    if (readError) throw readError
    const have = new Set(((existing ?? []) as { question: string }[]).map((row) => row.question.trim().toLowerCase()))
    const rows = usable
      .filter((s) => !have.has(s.question.trim().toLowerCase()))
      .map((s, index) => ({
        question: s.question.trim().slice(0, 300),
        answer: s.answer.trim().slice(0, 4000),
        category: s.category.toLowerCase().replace(/[^a-z0-9-]+/g, "-").slice(0, 40) || "general",
        keywords: keywordsFor(s.question),
        status: publish ? "published" : "draft",
        sort_order: (index + 1) * 10,
      }))
    if (rows.length) {
      const { error } = await db().from("chatbot_faqs").insert(rows)
      if (error) throw error
    }
    await logActivity({ admin, action: "assistant.faqs_imported", entityType: "assistant_faq", description: `Imported ${rows.length} website FAQs into the Hosting Assistant${publish ? " (published)" : " (as drafts)"}` })
    refreshWebsite()
    return { ok: true, message: rows.length ? `Imported ${rows.length} FAQs${publish ? "" : " as drafts — review and publish them"}.` : "Every website FAQ is already in the list." }
  } catch (error) {
    return fail(error)
  }
}

// --- Dashboard preview ---------------------------------------------------------------------

/**
 * The dashboard preview's transport: same engine and data as the website (read fresh, ignoring
 * the on/off switch), but nothing is stored, so previews never appear in Conversations/Analytics.
 */
export async function previewAssistantAction(event: AssistantEvent): Promise<AssistantResponse> {
  try {
    await authorizeAction("assistant.manage")
    const kb = await loadKnowledgeBase("admin")
    const result = await respond(event, kb)
    return { conversationId: null, replies: result.replies, ...(result.flowAnswers ? { flowAnswers: result.flowAnswers } : {}) }
  } catch (error) {
    return { conversationId: null, replies: [], error: toActionError(error).error ?? "Preview failed." }
  }
}

/** Validates a preview enquiry exactly like /api/leads would, without saving or emailing it. */
export async function previewLeadAction(lead: { name: string; email: string; phone: string; requirement: string; service: string }): Promise<{ ok: boolean; message: string }> {
  await authorizeAction("assistant.manage")
  const parsed = leadApiPayloadSchema.safeParse({ ...lead, message: lead.requirement, source: "hosting-assistant" })
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form." }
  return { ok: true, message: "Preview only — on the website this enquiry is saved to Leads and emailed to your team." }
}

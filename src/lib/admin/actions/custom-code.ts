"use server"

import { logActivity } from "@/lib/admin/activity"
import { actorId, authorizeAction, type CurrentAdmin } from "@/lib/admin/auth"
import { cmsAdminDb } from "@/lib/cms/db"
import type { ActionState } from "@/lib/cms/types"
import { BUILT_IN_TRACKING, getSectionHistory, resolveSections } from "@/lib/custom-code/server"
import {
  defaultSectionState,
  DRAFT_KEY,
  HISTORY_LIMIT,
  historyKey,
  isSectionId,
  SECTION_META,
  SETTINGS_KEY,
  type HistoryEntry,
  type SectionId,
  type SectionState,
} from "@/lib/custom-code/types"
import { validateSection } from "@/lib/custom-code/validate"

import { refreshWebsite, toActionError } from "./utils"

function db() {
  if (!cmsAdminDb) throw new Error("The CMS database is not configured.")
  return cmsAdminDb
}

async function readSections(key: string): Promise<Record<string, unknown>> {
  const { data, error } = await db().from("settings").select("value").eq("key", key).maybeSingle()
  if (error) throw error
  return ((data?.value as { sections?: Record<string, unknown> } | null)?.sections ?? {}) as Record<string, unknown>
}

async function upsert(key: string, value: unknown, admin: CurrentAdmin) {
  const { error } = await db().from("settings").upsert({ key, value, updated_by: actorId(admin), updated_at: new Date().toISOString() }, { onConflict: "key" })
  if (error) throw error
}

/** Validates a section, plus a syntax check for Custom JavaScript (compiled, never run). */
function check(section: SectionId, raw: unknown): { state?: SectionState; error?: string } {
  const result = validateSection(section, raw)
  if (result.error || !result.state) return result
  if (section === "js") {
    const code = (result.state as { code: string }).code
    try {
      // Compiling only — the function is never called. A syntax error would break the script on every page.
      new Function(code)
    } catch (error) {
      return { error: `Custom JavaScript has a syntax error: ${error instanceof Error ? error.message : "check the code"}.` }
    }
  }
  return result
}

/**
 * Makes `state` the live version of a section: updates `custom_code`, records the version
 * (newest first, last 20 kept), drops any preview draft of the section, logs the action and
 * clears the website cache so it's live on the next request.
 */
async function publish(admin: CurrentAdmin, section: SectionId, state: SectionState, note: string, action: Parameters<typeof logActivity>[0]["action"], description: string) {
  const live = await readSections(SETTINGS_KEY)
  await upsert(SETTINGS_KEY, { sections: { ...live, [section]: state } }, admin)

  const versions = await getSectionHistory(section)
  const entry: HistoryEntry = { id: crypto.randomUUID(), savedAt: new Date().toISOString(), savedBy: admin.username, note, state }
  await upsert(historyKey(section), { versions: [entry, ...versions].slice(0, HISTORY_LIMIT) }, admin)

  const drafts = await readSections(DRAFT_KEY)
  if (section in drafts) {
    const rest = { ...drafts }
    delete rest[section]
    await upsert(DRAFT_KEY, { sections: rest }, admin)
  }

  await logActivity({ admin, action, entityType: "custom_code", entityId: section, description, metadata: { section } })
  refreshWebsite()
}

const label = (section: SectionId) => SECTION_META[section].label
const invalid: ActionState = { error: "Unknown section." }

/** Save (publish) a section's content and enabled state. */
export async function saveCustomCodeAction(section: SectionId, payload: string): Promise<ActionState> {
  try {
    const admin = await authorizeAction("code.manage")
    if (!isSectionId(section)) return invalid
    let raw: unknown
    try {
      raw = JSON.parse(payload)
    } catch {
      return { error: "Invalid data." }
    }
    const result = check(section, raw)
    if (result.error || !result.state) return { error: result.error }

    const current = resolveSections({ sections: await readSections(SETTINGS_KEY) })[section]
    const onlyToggled = JSON.stringify({ ...current, enabled: result.state.enabled }) === JSON.stringify(result.state) && current.enabled !== result.state.enabled
    if (JSON.stringify(current) === JSON.stringify(result.state)) return { ok: true, message: "No changes to save." }

    if (onlyToggled) {
      const on = result.state.enabled
      await publish(admin, section, result.state, on ? "Enabled" : "Disabled", on ? "custom_code.enabled" : "custom_code.disabled", `${label(section)} ${on ? "Enabled" : "Disabled"}`)
    } else {
      await publish(admin, section, result.state, "Updated", "custom_code.updated", `${label(section)} Updated`)
    }
    return { ok: true, message: `${label(section)} saved — live on the website now${result.state.enabled ? "" : " (disabled, so nothing is output)"}.` }
  } catch (error) {
    return toActionError(error)
  }
}

/** Turn a section on or off without changing its content. */
export async function setCustomCodeEnabledAction(section: SectionId, enabled: boolean): Promise<ActionState> {
  try {
    const admin = await authorizeAction("code.manage")
    if (!isSectionId(section) || typeof enabled !== "boolean") return invalid
    const current = resolveSections({ sections: await readSections(SETTINGS_KEY) })[section]
    if (current.enabled === enabled) return { ok: true, message: `${label(section)} is already ${enabled ? "enabled" : "disabled"}.` }
    await publish(admin, section, { ...current, enabled }, enabled ? "Enabled" : "Disabled", enabled ? "custom_code.enabled" : "custom_code.disabled", `${label(section)} ${enabled ? "Enabled" : "Disabled"}`)
    return { ok: true, message: enabled ? `${label(section)} enabled — live on the website now.` : `${label(section)} disabled — nothing from it is output on the website.` }
  } catch (error) {
    return toActionError(error)
  }
}

/** Back to the default (empty code, or the built-in tracking IDs). Kept in history, so it can be undone. */
export async function resetCustomCodeAction(section: SectionId): Promise<ActionState> {
  try {
    const admin = await authorizeAction("code.manage")
    if (!isSectionId(section)) return invalid
    await publish(admin, section, defaultSectionState(section, BUILT_IN_TRACKING), "Reset to default", "custom_code.reset", `${label(section)} Reset`)
    return { ok: true, message: `${label(section)} reset. The previous version is in the history if you need it back.` }
  } catch (error) {
    return toActionError(error)
  }
}

/** Make a version from the history live again (recorded as a new version). */
export async function restoreCustomCodeVersionAction(section: SectionId, versionId: string): Promise<ActionState> {
  try {
    const admin = await authorizeAction("code.manage")
    if (!isSectionId(section)) return invalid
    const version = (await getSectionHistory(section)).find((entry) => entry.id === versionId)
    if (!version) return { error: "That version is no longer in the history." }
    const result = check(section, version.state)
    if (result.error || !result.state) return { error: `That version can't be restored: ${result.error}` }
    const when = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(version.savedAt))
    await publish(admin, section, result.state, `Restored version from ${when}`, "custom_code.restored", `${label(section)}: Previous Version Restored (from ${when})`)
    return { ok: true, message: `Version from ${when} restored — live on the website now.` }
  } catch (error) {
    return toActionError(error)
  }
}

/**
 * Stores unsaved editor content as a preview draft (not live). The dashboard then opens the
 * website in preview mode (/admin/preview), where drafts replace the live code for this admin only.
 */
export async function previewCustomCodeAction(section: SectionId, payload: string): Promise<ActionState> {
  try {
    const admin = await authorizeAction("code.manage")
    if (!isSectionId(section)) return invalid
    let raw: unknown
    try {
      raw = JSON.parse(payload)
    } catch {
      return { error: "Invalid data." }
    }
    const result = check(section, raw)
    if (result.error || !result.state) return { error: result.error }
    const drafts = await readSections(DRAFT_KEY)
    await upsert(DRAFT_KEY, { sections: { ...drafts, [section]: result.state } }, admin)
    await logActivity({ admin, action: "custom_code.previewed", entityType: "custom_code", entityId: section, description: `${label(section)} Previewed (draft, not published)`, metadata: { section } })
    return { ok: true, message: "Preview draft ready." }
  } catch (error) {
    return toActionError(error)
  }
}

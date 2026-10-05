import "server-only"

import { analyticsConfig } from "@/lib/analytics"
import { getCmsCustomCodeValue, isCmsPreview } from "@/lib/cms/content"
import { cmsAdminDb } from "@/lib/cms/db"

import { DRAFT_KEY, defaultSectionState, historyKey, SECTION_IDS, SETTINGS_KEY, type HistoryEntry, type SectionId, type SectionStateMap } from "./types"
import { validateSection } from "./validate"

/** The IDs the site shipped with before the Custom Code Manager — the Tracking Scripts defaults. */
export const BUILT_IN_TRACKING = { clarityId: analyticsConfig.clarityId, ga4Id: analyticsConfig.ga4Id }

/** Fills every section from stored data, falling back to defaults for missing or invalid ones. */
export function resolveSections(stored: unknown): SectionStateMap {
  const sections = stored && typeof stored === "object" ? ((stored as { sections?: Record<string, unknown> }).sections ?? {}) : {}
  const out = {} as Record<SectionId, unknown>
  for (const id of SECTION_IDS) {
    const raw = sections[id]
    // Stored data was validated on save; re-validating keeps the website safe from hand-edited rows.
    const checked = raw ? validateSection(id, raw) : null
    out[id] = checked?.state ?? defaultSectionState(id, BUILT_IN_TRACKING)
  }
  return out as SectionStateMap
}

/**
 * What the website renders. Live data comes through the cached settings read (cleared by every
 * dashboard save, so changes are immediate). In preview mode an admin's unsaved drafts are
 * layered on top, read fresh.
 */
export async function getSiteCustomCode(): Promise<SectionStateMap> {
  const live = await getCmsCustomCodeValue()
  if (!(await isCmsPreview()) || !cmsAdminDb) return resolveSections(live)
  const { data } = await cmsAdminDb.from("settings").select("value").eq("key", DRAFT_KEY).maybeSingle()
  const drafts = (data?.value as { sections?: Record<string, unknown> } | null)?.sections ?? {}
  const base = (live as { sections?: Record<string, unknown> } | null)?.sections ?? {}
  return resolveSections({ sections: { ...base, ...drafts } })
}

/** Dashboard read: always fresh. */
export async function getAdminCustomCode(): Promise<{ sections: SectionStateMap; saved: Partial<Record<SectionId, boolean>>; drafts: Partial<Record<SectionId, boolean>> }> {
  if (!cmsAdminDb) return { sections: resolveSections(null), saved: {}, drafts: {} }
  const { data } = await cmsAdminDb.from("settings").select("key, value").in("key", [SETTINGS_KEY, DRAFT_KEY])
  const byKey = Object.fromEntries((data ?? []).map((row) => [row.key as string, row.value as { sections?: Record<string, unknown> }]))
  const live = byKey[SETTINGS_KEY]?.sections ?? {}
  const draft = byKey[DRAFT_KEY]?.sections ?? {}
  return {
    sections: resolveSections({ sections: live }),
    saved: Object.fromEntries(SECTION_IDS.map((id) => [id, id in live])),
    drafts: Object.fromEntries(SECTION_IDS.map((id) => [id, id in draft])),
  }
}

export async function getSectionHistory(section: SectionId): Promise<HistoryEntry[]> {
  if (!cmsAdminDb) return []
  const { data } = await cmsAdminDb.from("settings").select("value").eq("key", historyKey(section)).maybeSingle()
  const versions = (data?.value as { versions?: HistoryEntry[] } | null)?.versions
  return Array.isArray(versions) ? versions : []
}

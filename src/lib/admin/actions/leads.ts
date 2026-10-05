"use server"

import { logActivities, logActivity } from "@/lib/admin/activity"
import { authorizeAction } from "@/lib/admin/auth"
import { cmsAdminDb } from "@/lib/cms/db"
import { isLeadStatus, LEAD_STATUS_LABELS, type LeadStatus } from "@/lib/cms/lead-status"
import type { ActionState } from "@/lib/cms/types"

import { BULK_LIMIT, BULK_SELECTION_ERROR, parseBulkIds, plural, toActionError } from "./utils"

function db() {
  if (!cmsAdminDb) throw new Error("The CMS database is not configured.")
  return cmsAdminDb
}

/** PostgREST / Postgres errors for a column that doesn't exist yet. */
function isMissingStatusColumn(error: { code?: string; message?: string } | null) {
  if (!error) return false
  return error.code === "42703" || error.code === "PGRST204" || /column[^.]*\bstatus\b.*(does not exist|schema cache)/i.test(error.message ?? "")
}

const STATUS_MIGRATION_ERROR: ActionState = {
  error: "Lead status isn't set up yet. Run supabase/migrations/0005_add_lead_status.sql in the Supabase SQL editor, then try again.",
}

const who = (lead: { name: string; email: string }) => `${lead.name} <${lead.email}>`

/** Moves several leads to one pipeline status. Leads already in that status are left untouched. */
export async function bulkSetLeadStatusAction(leadIds: string[], status: LeadStatus): Promise<ActionState> {
  try {
    const admin = await authorizeAction("forms.view")
    const ids = parseBulkIds(leadIds)
    if (!ids) return BULK_SELECTION_ERROR
    if (!isLeadStatus(status)) return { error: "Unknown lead status." }

    const { data: current, error: readError } = await db().from("leads").select("id, name, email, status").in("id", ids)
    if (isMissingStatusColumn(readError)) return STATUS_MIGRATION_ERROR
    if (readError) throw readError
    const changing = (current ?? []).filter((lead) => lead.status !== status)
    const label = LEAD_STATUS_LABELS[status]
    if (!changing.length) return { ok: true, message: `All selected leads are already “${label}”.` }

    const { error } = await db().from("leads").update({ status }).in("id", changing.map((lead) => lead.id))
    if (isMissingStatusColumn(error)) return STATUS_MIGRATION_ERROR
    if (error) throw error

    await logActivities(
      changing.map((lead) => ({
        admin,
        action: "lead.status_changed" as const,
        entityType: "lead",
        entityId: lead.id,
        description: `Marked lead ${who(lead)} as “${label}” — bulk action`,
        metadata: { bulk: true, batchSize: changing.length, from: lead.status ?? null, to: status },
      }))
    )
    return { ok: true, message: `Marked ${plural(changing.length, "lead")} as “${label}”.` }
  } catch (error) {
    return toActionError(error)
  }
}

/** Permanently deletes several leads. */
export async function bulkDeleteLeadsAction(leadIds: string[]): Promise<ActionState> {
  try {
    const admin = await authorizeAction("forms.view")
    const ids = parseBulkIds(leadIds)
    if (!ids) return BULK_SELECTION_ERROR

    const { data, error } = await db().from("leads").delete().in("id", ids).select("id, name, email")
    if (error) throw error
    const deleted = data ?? []
    await logActivities(
      deleted.map((lead) => ({
        admin,
        action: "lead.deleted" as const,
        entityType: "lead",
        entityId: lead.id,
        description: `Deleted lead ${who(lead)} — bulk action`,
        metadata: { bulk: true, batchSize: deleted.length },
      }))
    )
    const missing = ids.length - deleted.length
    return { ok: true, message: `Deleted ${plural(deleted.length, "lead")}.${missing ? ` ${plural(missing, "lead")} had already been removed.` : ""}` }
  } catch (error) {
    return toActionError(error)
  }
}

/**
 * Records a CSV export in the activity log. The file itself is built in the browser from the
 * rows already on screen; this only checks the permission and writes the audit entry.
 */
export async function logLeadExportAction(leadIds: string[]): Promise<ActionState> {
  try {
    const admin = await authorizeAction("forms.view")
    const ids = Array.isArray(leadIds) ? leadIds.filter((id) => typeof id === "string").slice(0, BULK_LIMIT) : []
    await logActivity({
      admin,
      action: "lead.exported",
      entityType: "lead",
      description: `Exported ${plural(ids.length, "lead")} to CSV`,
      metadata: { count: ids.length, ids },
    })
    return { ok: true, message: `Exported ${plural(ids.length, "lead")} to CSV.` }
  } catch (error) {
    return toActionError(error)
  }
}

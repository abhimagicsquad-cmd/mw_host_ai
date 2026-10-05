"use server"

import { redirect } from "next/navigation"
import { z } from "zod"

import { logActivities, logActivity } from "@/lib/admin/activity"
import { authorizeAction } from "@/lib/admin/auth"
import { hashPassword, validatePasswordStrength } from "@/lib/admin/password"
import { setSessionCookie } from "@/lib/admin/session-cookie"
import { cmsAdminDb } from "@/lib/cms/db"
import type { ActionState, AdminRole } from "@/lib/cms/types"

import { BULK_SELECTION_ERROR, parseBulkIds, plural, toActionError } from "./utils"

const baseSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(50)
    .regex(/^[a-zA-Z0-9._-]+$/, "Username may only contain letters, numbers, dots, dashes and underscores"),
  full_name: z.string().trim().max(100).optional().transform((v) => v || null),
  email: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => v || null)
    .refine((v) => !v || z.email().safeParse(v).success, "Enter a valid email"),
  role: z.enum(["super_admin", "admin", "editor"]),
  is_active: z.string().optional().transform((v) => v === "on"),
  must_change_password: z.string().optional().transform((v) => v === "on"),
  password: z.string().optional(),
})

function db() {
  if (!cmsAdminDb) throw new Error("The CMS database is not configured.")
  return cmsAdminDb
}

function fieldError(issue: z.core.$ZodIssue | undefined): ActionState {
  return { error: issue?.message, fieldErrors: { [String(issue?.path[0])]: issue?.message ?? "" } }
}

async function countActiveSuperAdmins(excludeId?: string) {
  let query = db().from("users").select("id", { count: "exact", head: true }).eq("role", "super_admin").eq("is_active", true)
  if (excludeId) query = query.neq("id", excludeId)
  const { count } = await query
  return count ?? 0
}

export async function createUserAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await authorizeAction("users.manage")
    const parsed = baseSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return fieldError(parsed.error.issues[0])
    const { password, ...fields } = parsed.data

    const strength = validatePasswordStrength(password ?? "")
    if (strength) return { error: strength, fieldErrors: { password: strength } }

    const { data, error } = await db()
      .from("users")
      .insert({ ...fields, password_hash: await hashPassword(password!) })
      .select("id")
      .single()
    if (error) throw error

    await logActivity({ admin, action: "user.created", entityType: "user", entityId: data.id, description: `Created ${fields.role} user “${fields.username}”` })
  } catch (error) {
    return toActionError(error)
  }
  redirect("/admin/users?created=1")
}

export async function updateUserAction(userId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await authorizeAction("users.manage")
    const parsed = baseSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return fieldError(parsed.error.issues[0])
    const { password, ...fields } = parsed.data

    if (userId === admin.id && (fields.role !== "super_admin" || !fields.is_active)) {
      return { error: "You can't demote or deactivate your own account." }
    }
    const { data: existing } = await db().from("users").select("role, is_active").eq("id", userId).single()
    if (existing?.role === "super_admin" && existing.is_active && (fields.role !== "super_admin" || !fields.is_active)) {
      if ((await countActiveSuperAdmins(userId)) === 0) return { error: "At least one active Super Admin is required." }
    }

    const update: Record<string, unknown> = { ...fields, updated_at: new Date().toISOString() }
    if (password) {
      const strength = validatePasswordStrength(password)
      if (strength) return { error: strength, fieldErrors: { password: strength } }
      update.password_hash = await hashPassword(password)
    }

    const { error } = await db().from("users").update(update).eq("id", userId)
    if (error) throw error
    // A password reset revokes that user's sessions; keep the admin's own browser signed in.
    if (userId === admin.id && typeof update.password_hash === "string") {
      await setSessionCookie({ sub: admin.id, username: fields.username, role: fields.role as AdminRole, passwordHash: update.password_hash })
    }

    await logActivity({
      admin,
      action: "user.updated",
      entityType: "user",
      entityId: userId,
      description: `Updated user “${fields.username}”${password ? " (password reset)" : ""}`,
      metadata: { role: fields.role, is_active: fields.is_active },
    })
    return { ok: true, message: "User saved." }
  } catch (error) {
    return toActionError(error)
  }
}

export async function deleteUserAction(userId: string): Promise<ActionState> {
  try {
    const admin = await authorizeAction("users.manage")
    if (userId === admin.id) return { error: "You can't delete your own account." }

    const { data: existing, error: readError } = await db().from("users").select("username, role").eq("id", userId).single()
    if (readError) throw readError
    if (existing.role === "super_admin" && (await countActiveSuperAdmins(userId)) === 0) {
      return { error: "At least one active Super Admin is required." }
    }

    const { error } = await db().from("users").delete().eq("id", userId)
    if (error) throw error
    await logActivity({ admin, action: "user.deleted", entityType: "user", entityId: userId, description: `Deleted user “${existing.username}”` })
    return { ok: true, message: "User deleted." }
  } catch (error) {
    return toActionError(error)
  }
}

/**
 * Activates or deactivates several admin users. A deactivated user is signed out on their next
 * request (every request re-checks `is_active`). Your own account is never changed here, and at
 * least one active Super Admin must remain.
 */
export async function bulkSetUsersActiveAction(userIds: string[], active: boolean): Promise<ActionState> {
  try {
    const admin = await authorizeAction("users.manage")
    const ids = parseBulkIds(userIds)
    if (!ids) return BULK_SELECTION_ERROR
    if (typeof active !== "boolean") return { error: "Unknown user status." }
    if (ids.includes(admin.id)) return { error: "You can't change your own account in a bulk action. Deselect yourself and try again." }

    const { data: current, error: readError } = await db().from("users").select("id, username, role, is_active").in("id", ids)
    if (readError) throw readError
    const changing = (current ?? []).filter((user) => user.is_active !== active)
    if (!changing.length) return { ok: true, message: `All selected users are already ${active ? "active" : "deactivated"}.` }

    if (!active && changing.some((user) => user.role === "super_admin")) {
      const { count, error: countError } = await db()
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("role", "super_admin")
        .eq("is_active", true)
        .not("id", "in", `(${changing.map((user) => user.id).join(",")})`)
      if (countError) throw countError
      if (!count) return { error: "At least one active Super Admin is required." }
    }

    const { error } = await db()
      .from("users")
      .update({ is_active: active, updated_at: new Date().toISOString() })
      .in("id", changing.map((user) => user.id))
    if (error) throw error

    await logActivities(
      changing.map((user) => ({
        admin,
        action: active ? ("user.activated" as const) : ("user.deactivated" as const),
        entityType: "user",
        entityId: user.id,
        description: `${active ? "Activated" : "Deactivated"} user “${user.username}” — bulk action`,
        metadata: { bulk: true, batchSize: changing.length, role: user.role },
      }))
    )
    const skipped = ids.length - changing.length
    return {
      ok: true,
      message: `${active ? "Activated" : "Deactivated"} ${plural(changing.length, "user")}.${skipped ? ` ${plural(skipped, "user")} already ${active ? "active" : "deactivated"}.` : ""}`,
    }
  } catch (error) {
    return toActionError(error)
  }
}

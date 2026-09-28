"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

import { logActivity, getClientIp } from "@/lib/admin/activity"
import { authorizeAction, getCurrentAdmin, isBootstrapLoginAllowed } from "@/lib/admin/auth"
import { hashPassword, validatePasswordStrength, verifyPassword } from "@/lib/admin/password"
import { clearLoginFailures, isLoginThrottled, recordLoginFailure } from "@/lib/admin/rate-limit"
import { isSessionSigningConfigured, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, signSession } from "@/lib/admin/session"
import { cmsAdminDb, isMissingTableError } from "@/lib/cms/db"
import type { ActionState, AdminRole } from "@/lib/cms/types"

import { toActionError } from "./utils"

const loginSchema = z.object({
  username: z.string().trim().min(1, "Enter your username").max(100),
  password: z.string().min(1, "Enter your password").max(200),
  next: z.string().optional(),
})

const INVALID = "Invalid username or password."

function safeNext(next: string | undefined) {
  return next && next.startsWith("/admin/") && !next.startsWith("//") && !next.includes("\\") ? next : "/admin/dashboard"
}

async function setSessionCookie(payload: { sub: string; username: string; role: AdminRole }) {
  const store = await cookies()
  store.set(SESSION_COOKIE, await signSession(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? INVALID }
  const { username, password, next } = parsed.data

  if (!(await isSessionSigningConfigured())) {
    return { error: "Admin login is not configured on this server (set ADMIN_SESSION_SECRET or SUPABASE_SERVICE_ROLE_KEY)." }
  }

  const throttleKey = `${(await getClientIp()) ?? "unknown"}:${username.toLowerCase()}`
  if (isLoginThrottled(throttleKey)) return { error: "Too many failed attempts. Try again in 15 minutes." }

  const fail = async (reason: string) => {
    recordLoginFailure(throttleKey)
    await logActivity({ username, action: "auth.login_failed", entityType: "auth", description: `Failed login for "${username}"`, metadata: { reason } })
    return { error: INVALID }
  }

  // Break-glass env login — only while the users table is missing or empty.
  if (
    process.env.ADMIN_BOOTSTRAP_USERNAME &&
    username.toLowerCase() === process.env.ADMIN_BOOTSTRAP_USERNAME.toLowerCase() &&
    (await isBootstrapLoginAllowed())
  ) {
    if (password !== process.env.ADMIN_BOOTSTRAP_PASSWORD) return fail("bad_password")
    clearLoginFailures(throttleKey)
    await setSessionCookie({ sub: "bootstrap", username, role: "super_admin" })
    redirect(safeNext(next))
  }

  if (!cmsAdminDb) return { error: "The CMS database is not configured (missing Supabase environment variables)." }

  const escaped = username.replace(/[\\%_]/g, (c) => `\\${c}`)
  const { data: user, error } = await cmsAdminDb
    .from("users")
    .select("id, username, role, password_hash, is_active")
    .ilike("username", escaped)
    .maybeSingle()

  if (error) {
    if (isMissingTableError(error)) {
      return { error: "The CMS database tables don't exist yet. Run supabase/migrations/0004_create_cms.sql in the Supabase SQL editor." }
    }
    console.error("[admin/login] lookup failed", error)
    return { error: "Sign-in is temporarily unavailable. Please try again." }
  }

  if (!user) {
    // Burn comparable time so response timing doesn't reveal which usernames exist.
    await hashPassword(password)
    return fail("unknown_user")
  }
  if (!(await verifyPassword(password, user.password_hash))) return fail("bad_password")
  if (!user.is_active) return fail("inactive")

  clearLoginFailures(throttleKey)
  await setSessionCookie({ sub: user.id, username: user.username, role: user.role as AdminRole })
  await cmsAdminDb.from("users").update({ last_login_at: new Date().toISOString() }).eq("id", user.id)
  await logActivity({
    admin: { id: user.id, username: user.username, role: user.role as AdminRole, email: null, full_name: null, must_change_password: false, isBootstrap: false },
    action: "auth.login",
    entityType: "auth",
    description: `${user.username} signed in`,
  })

  redirect(safeNext(next))
}

export async function logoutAction() {
  const admin = await getCurrentAdmin()
  if (admin) await logActivity({ admin, action: "auth.logout", entityType: "auth", description: `${admin.username} signed out` })
  const store = await cookies()
  store.delete({ name: SESSION_COOKIE, path: "/admin" })
  redirect("/admin/login")
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string(),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { message: "New passwords don't match", path: ["confirmPassword"] })

export async function changeOwnPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await authorizeAction()
    if (admin.isBootstrap || !cmsAdminDb) return { error: "The bootstrap login has no stored password to change." }

    const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return { error: parsed.error.issues[0]?.message }
    const strength = validatePasswordStrength(parsed.data.newPassword)
    if (strength) return { error: strength }

    const { data: user } = await cmsAdminDb.from("users").select("password_hash").eq("id", admin.id).single()
    if (!user || !(await verifyPassword(parsed.data.currentPassword, user.password_hash))) {
      return { error: "Current password is incorrect." }
    }

    const { error } = await cmsAdminDb
      .from("users")
      .update({ password_hash: await hashPassword(parsed.data.newPassword), must_change_password: false, updated_at: new Date().toISOString() })
      .eq("id", admin.id)
    if (error) throw error

    await logActivity({ admin, action: "auth.password_changed", entityType: "user", entityId: admin.id, description: `${admin.username} changed their password` })
    return { ok: true, message: "Password updated." }
  } catch (error) {
    return toActionError(error)
  }
}

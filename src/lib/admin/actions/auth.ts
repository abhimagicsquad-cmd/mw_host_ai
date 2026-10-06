"use server"

import { timingSafeEqual } from "node:crypto"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

import { logActivity, getClientIp } from "@/lib/admin/activity"
import { authorizeAction, getCurrentAdmin, isBootstrapLoginAllowed, loadUserForAuth } from "@/lib/admin/auth"
import { hashPassword, validatePasswordStrength, verifyPassword } from "@/lib/admin/password"
import { clearLoginFailures, isLoginThrottled, recordLoginFailure } from "@/lib/admin/rate-limit"
import { safeAdminPath } from "@/lib/admin/safe-redirect"
import { isSessionSigningConfigured, SESSION_COOKIE } from "@/lib/admin/session"
import { clearPendingTwoFactorCookie, getTrustedDeviceCookie, setPendingTwoFactorCookie, setSessionCookie } from "@/lib/admin/session-cookie"
import { completeSignIn } from "@/lib/admin/sign-in"
import { twoFactorFingerprint } from "@/lib/admin/two-factor"
import { isTrustedDevice } from "@/lib/admin/two-factor-store"
import { cmsAdminDb, isMissingTableError } from "@/lib/cms/db"
import type { ActionState, AdminRole } from "@/lib/cms/types"

import { toActionError } from "./utils"

const loginSchema = z.object({
  username: z.string().trim().min(1, "Enter your username").max(100),
  password: z.string().min(1, "Enter your password").max(200),
  next: z.string().optional(),
})

const INVALID = "Invalid username or password."

/** Constant-time string comparison (for the env bootstrap password). */
function safeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? INVALID }
  const { username, password, next } = parsed.data

  if (!(await isSessionSigningConfigured())) {
    return { error: "Admin login is not configured on this server (set ADMIN_SESSION_SECRET or SUPABASE_SERVICE_ROLE_KEY)." }
  }

  const ip = await getClientIp()
  if (await isLoginThrottled(ip, username)) return { error: "Too many failed attempts. Try again in 15 minutes." }

  const fail = async (reason: string) => {
    recordLoginFailure(ip, username)
    await logActivity({ username, action: "auth.login_failed", entityType: "auth", description: `Failed login for "${username}"`, metadata: { reason } })
    return { error: INVALID }
  }

  // Break-glass env login — only while the users table is missing or empty.
  if (
    process.env.ADMIN_BOOTSTRAP_USERNAME &&
    username.toLowerCase() === process.env.ADMIN_BOOTSTRAP_USERNAME.toLowerCase() &&
    (await isBootstrapLoginAllowed())
  ) {
    if (!safeEqual(password, process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "")) return fail("bad_password")
    clearLoginFailures(ip, username)
    await setSessionCookie({ sub: "bootstrap", username, role: "super_admin" })
    redirect(safeAdminPath(next))
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

  clearLoginFailures(ip, username)
  const account = { id: user.id as string, username: user.username as string, role: user.role as AdminRole, password_hash: user.password_hash as string }

  // Step 2: with 2FA on, the password alone only earns a short-lived "enter your code" token —
  // unless this browser is a device the user chose to trust (30 days).
  const { user: withTwoFactor } = await loadUserForAuth(account.id)
  if (withTwoFactor?.totp_enabled_at && withTwoFactor.totp_secret_encrypted) {
    const mfa = twoFactorFingerprint(withTwoFactor.totp_enabled_at, withTwoFactor.totp_secret_encrypted)
    if (await isTrustedDevice(account.id, await getTrustedDeviceCookie())) {
      await completeSignIn(account, { method: "password+trusted_device", mfa })
      redirect(safeAdminPath(next))
    }
    await setPendingTwoFactorCookie({ sub: account.id, username: account.username, role: account.role, passwordHash: account.password_hash, next })
    redirect("/mwh-admin-login")
  }

  // No 2FA yet: super admins and admins are signed in but held on My Account → Security
  // until they set it up (enforced by requireAdmin / authorizeAction on every page and action).
  await completeSignIn(account, { method: "password" })
  redirect(safeAdminPath(next))
}

export async function logoutAction() {
  await clearPendingTwoFactorCookie()
  const admin = await getCurrentAdmin()
  if (admin) await logActivity({ admin, action: "auth.logout", entityType: "auth", description: `${admin.username} signed out` })
  const store = await cookies()
  store.delete({ name: SESSION_COOKIE, path: "/admin" })
  redirect("/mwh-admin-login")
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

    const passwordHash = await hashPassword(parsed.data.newPassword)
    const { error } = await cmsAdminDb
      .from("users")
      .update({ password_hash: passwordHash, must_change_password: false, updated_at: new Date().toISOString() })
      .eq("id", admin.id)
    if (error) throw error
    // The new hash revokes every other session; re-issue this browser's so it stays signed in
    // (keeping its two-factor binding).
    const { user: current } = await loadUserForAuth(admin.id)
    const mfa = current?.totp_enabled_at && current.totp_secret_encrypted ? twoFactorFingerprint(current.totp_enabled_at, current.totp_secret_encrypted) : undefined
    await setSessionCookie({ sub: admin.id, username: admin.username, role: admin.role, passwordHash, mfa })

    await logActivity({ admin, action: "auth.password_changed", entityType: "user", entityId: admin.id, description: `${admin.username} changed their password` })
    return { ok: true, message: "Password updated." }
  } catch (error) {
    return toActionError(error)
  }
}

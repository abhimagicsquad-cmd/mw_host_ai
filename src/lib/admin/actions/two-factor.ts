"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { logActivity } from "@/lib/admin/activity"
import { authorizeAction, loadUserForAuth, SECURITY_PATH } from "@/lib/admin/auth"
import { verifyPassword } from "@/lib/admin/password"
import { safeAdminPath } from "@/lib/admin/safe-redirect"
import { clearPendingTwoFactorCookie, clearTrustedDeviceCookie, getPendingTwoFactor, getTrustedDeviceCookie, setSessionCookie, setTrustedDeviceCookie } from "@/lib/admin/session-cookie"
import { credentialVersion } from "@/lib/admin/session"
import { completeSignIn } from "@/lib/admin/sign-in"
import { encryptSecret, generateTotpSecret, isTwoFactorConfigured, isTwoFactorRequired, twoFactorFingerprint } from "@/lib/admin/two-factor"
import {
  addTrustedDevice,
  checkSetupCode,
  checkUserCode,
  clearTwoFactor,
  getTwoFactorRecord,
  pendingSecret,
  removeTrustedDevices,
  replaceRecoveryCodes,
} from "@/lib/admin/two-factor-store"
import { cmsAdminDb } from "@/lib/cms/db"
import type { ActionState, AdminRole } from "@/lib/cms/types"

import { toActionError } from "./utils"

/** ActionState plus the recovery codes, which leave the server exactly once (after they're made). */
export type TwoFactorActionState = ActionState & { recoveryCodes?: string[] }

const codeSchema = z.object({ code: z.string().trim().min(6, "Enter the code from your app").max(20) })
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function db() {
  if (!cmsAdminDb) throw new Error("The CMS database is not configured.")
  return cmsAdminDb
}

/** Re-issues this browser's session bound to the user's new 2FA enrolment (or to none). */
async function reissueSession(userId: string) {
  const { user } = await loadUserForAuth(userId)
  if (!user) return
  const mfa = user.totp_enabled_at && user.totp_secret_encrypted ? twoFactorFingerprint(user.totp_enabled_at, user.totp_secret_encrypted) : undefined
  await setSessionCookie({ sub: user.id, username: user.username, role: user.role, passwordHash: user.password_hash, mfa })
}

/** Signed-in user for the Security page — allowed while required 2FA is still being set up. */
async function securityUser() {
  const admin = await authorizeAction(undefined, { allowTwoFactorSetup: true })
  if (admin.isBootstrap) throw new Error("The temporary bootstrap login can't use two-factor authentication.")
  if (admin.twoFactor.storageMissing) throw new Error("Two-factor storage isn't set up yet — run supabase/migrations/0007_admin_two_factor.sql in the Supabase SQL editor.")
  if (!isTwoFactorConfigured()) throw new Error("Two-factor encryption key is not configured (set ADMIN_2FA_ENCRYPTION_KEY).")
  return admin
}

// ---------------------------------------------------------------------------------------
// Sign-in, step 2
// ---------------------------------------------------------------------------------------

const loginCodeSchema = z.object({ code: z.string().trim().min(6, "Enter your authentication code").max(20), remember: z.string().optional() })

export async function verifyLoginCodeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const pending = await getPendingTwoFactor()
  if (!pending) {
    await clearPendingTwoFactorCookie()
    return { error: "Your sign-in timed out. Enter your username and password again." }
  }
  const parsed = loginCodeSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  // The account must still be active, with the same password and 2FA on.
  const { user } = await loadUserForAuth(pending.sub)
  if (!user || !user.is_active || pending.cv !== (await credentialVersion(user.password_hash)) || !user.totp_enabled_at || !user.totp_secret_encrypted) {
    await clearPendingTwoFactorCookie()
    return { error: "Your sign-in is no longer valid. Enter your username and password again." }
  }

  const result = await checkUserCode(parsed.data.code, { userId: user.id, username: user.username, context: "sign-in", allowRecovery: true })
  if (!result.ok) return { error: result.error }

  const account = { id: user.id, username: user.username, role: user.role as AdminRole, password_hash: user.password_hash }
  const mfa = twoFactorFingerprint(user.totp_enabled_at, user.totp_secret_encrypted)
  await logActivity({
    userId: user.id,
    username: user.username,
    action: "security.2fa_verified",
    entityType: "user",
    entityId: user.id,
    description: `${user.username} passed two-factor verification (${result.method === "totp" ? "authenticator code" : "recovery code"})`,
    metadata: { method: result.method, context: "sign-in" },
  })

  if (parsed.data.remember === "on") {
    const device = await addTrustedDevice(user.id)
    await setTrustedDeviceCookie(device.id, device.token)
    await logActivity({
      userId: user.id,
      username: user.username,
      action: "security.trusted_device_added",
      entityType: "user",
      entityId: user.id,
      description: `${user.username} trusted a device for 30 days (${device.label})`,
      metadata: { deviceId: device.id, label: device.label },
    })
  }

  await completeSignIn(account, { method: result.method === "totp" ? "password+totp" : "password+recovery_code", mfa })
  // Sign-ins with a recovery code land on Security, where the remaining codes are shown.
  redirect(result.method === "recovery" ? `${SECURITY_PATH}?recovery=used` : safeAdminPath(pending.next))
}

export async function cancelTwoFactorLoginAction() {
  await clearPendingTwoFactorCookie()
  redirect("/mwh-admin-login")
}

// ---------------------------------------------------------------------------------------
// Setup (and replacing the secret)
// ---------------------------------------------------------------------------------------

/** Starts setup: a fresh secret is stored (encrypted) as pending; 2FA stays off until a code from it is verified. */
export async function startTwoFactorSetupAction(): Promise<ActionState> {
  try {
    const admin = await securityUser()
    if (admin.twoFactor.enabled) return { error: "Two-factor authentication is already on. Use “Regenerate secret” to move to a new app." }
    await storePendingSecret(admin.id)
    revalidatePath(SECURITY_PATH)
    return { ok: true }
  } catch (error) {
    return toActionError(error)
  }
}

/** Replacing the secret (new phone / app): proves the current factor first. */
export async function startSecretRegenerationAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await securityUser()
    if (!admin.twoFactor.enabled) return { error: "Two-factor authentication is off — enable it instead." }
    const parsed = codeSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return { error: parsed.error.issues[0]?.message }
    const check = await checkUserCode(parsed.data.code, { userId: admin.id, username: admin.username, context: "regenerate secret", allowRecovery: true })
    if (!check.ok) return { error: check.error }
    await storePendingSecret(admin.id)
    revalidatePath(SECURITY_PATH)
    return { ok: true }
  } catch (error) {
    return toActionError(error)
  }
}

async function storePendingSecret(userId: string) {
  const { error } = await db()
    .from("users")
    .update({ totp_pending_secret_encrypted: encryptSecret(generateTotpSecret()), totp_pending_created_at: new Date().toISOString() })
    .eq("id", userId)
  if (error) throw error
}

export async function cancelTwoFactorSetupAction(): Promise<ActionState> {
  try {
    const admin = await securityUser()
    const { error } = await db().from("users").update({ totp_pending_secret_encrypted: null, totp_pending_created_at: null }).eq("id", admin.id)
    if (error) throw error
    revalidatePath(SECURITY_PATH)
    return { ok: true }
  } catch (error) {
    return toActionError(error)
  }
}

/**
 * Verifies a code from the pending secret, then activates it: first-time setup turns 2FA on
 * and issues 10 recovery codes; regeneration swaps the secret (and signs out other sessions
 * and trusted devices). This browser's session is re-issued so it stays signed in.
 */
export async function confirmTwoFactorSetupAction(_prev: TwoFactorActionState, formData: FormData): Promise<TwoFactorActionState> {
  try {
    const admin = await securityUser()
    const parsed = codeSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return { error: parsed.error.issues[0]?.message }

    const record = await getTwoFactorRecord(admin.id)
    const secret = pendingSecret(record)
    if (!record || !secret) return { error: "This setup has expired. Start again to get a new QR code." }

    const rotating = admin.twoFactor.enabled
    const check = await checkSetupCode(parsed.data.code, secret, { userId: admin.id, username: admin.username, context: rotating ? "confirm new secret" : "setup" })
    if (!check.ok) return { error: check.error }

    const now = new Date().toISOString()
    const { error } = await db()
      .from("users")
      .update({
        totp_secret_encrypted: record.totp_pending_secret_encrypted,
        totp_pending_secret_encrypted: null,
        totp_pending_created_at: null,
        totp_enabled_at: now,
        // The code just used can't be used again to sign in.
        totp_last_used_step: check.step ?? null,
        totp_last_verified_at: now,
        updated_at: now,
      })
      .eq("id", admin.id)
    if (error) throw error

    let recoveryCodes: string[] | undefined
    if (rotating) {
      const removed = await removeTrustedDevices(admin.id)
      await clearTrustedDeviceCookie()
      await logActivity({
        admin,
        action: "security.2fa_secret_regenerated",
        entityType: "user",
        entityId: admin.id,
        description: `${admin.username} moved two-factor authentication to a new secret${removed ? ` (${removed} trusted device${removed === 1 ? "" : "s"} removed)` : ""}`,
      })
    } else {
      recoveryCodes = await replaceRecoveryCodes(admin.id)
      await logActivity({ admin, action: "security.2fa_enabled", entityType: "user", entityId: admin.id, description: `${admin.username} turned on two-factor authentication` })
    }
    await reissueSession(admin.id)
    revalidatePath("/admin", "layout")
    return {
      ok: true,
      message: rotating ? "Your authenticator app now uses the new secret. Other sessions and trusted devices were signed out." : "Two-factor authentication is on.",
      recoveryCodes,
    }
  } catch (error) {
    return toActionError(error)
  }
}

// ---------------------------------------------------------------------------------------
// Recovery codes, disabling
// ---------------------------------------------------------------------------------------

export async function regenerateRecoveryCodesAction(_prev: TwoFactorActionState, formData: FormData): Promise<TwoFactorActionState> {
  try {
    const admin = await securityUser()
    if (!admin.twoFactor.enabled) return { error: "Turn on two-factor authentication first." }
    const parsed = codeSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return { error: parsed.error.issues[0]?.message }
    // Only an authenticator code here: a recovery code can't be used to mint new recovery codes.
    const check = await checkUserCode(parsed.data.code, { userId: admin.id, username: admin.username, context: "regenerate recovery codes" })
    if (!check.ok) return { error: check.error }

    const recoveryCodes = await replaceRecoveryCodes(admin.id)
    await logActivity({
      admin,
      action: "security.recovery_codes_regenerated",
      entityType: "user",
      entityId: admin.id,
      description: `${admin.username} generated new recovery codes (the old ones no longer work)`,
    })
    revalidatePath(SECURITY_PATH)
    return { ok: true, message: "New recovery codes generated. The old codes no longer work.", recoveryCodes }
  } catch (error) {
    return toActionError(error)
  }
}

const disableSchema = z.object({ password: z.string().min(1, "Enter your password").max(200), code: z.string().trim().min(6, "Enter the code from your app").max(20) })

/** Optional roles only (editors). Needs the password and a current code. */
export async function disableTwoFactorAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await securityUser()
    if (isTwoFactorRequired(admin.role)) return { error: "Two-factor authentication is required for your role and can't be turned off." }
    if (!admin.twoFactor.enabled) return { error: "Two-factor authentication is already off." }
    const parsed = disableSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return { error: parsed.error.issues[0]?.message }

    const { data: user } = await db().from("users").select("password_hash").eq("id", admin.id).single()
    if (!user || !(await verifyPassword(parsed.data.password, user.password_hash))) return { error: "Password is incorrect." }
    const check = await checkUserCode(parsed.data.code, { userId: admin.id, username: admin.username, context: "disable", allowRecovery: true })
    if (!check.ok) return { error: check.error }

    await clearTwoFactor(admin.id)
    await clearTrustedDeviceCookie()
    await logActivity({ admin, action: "security.2fa_disabled", entityType: "user", entityId: admin.id, description: `${admin.username} turned off two-factor authentication` })
    await reissueSession(admin.id)
    revalidatePath("/admin", "layout")
    return { ok: true, message: "Two-factor authentication is off." }
  } catch (error) {
    return toActionError(error)
  }
}

// ---------------------------------------------------------------------------------------
// Trusted devices
// ---------------------------------------------------------------------------------------

export async function removeTrustedDeviceAction(deviceId: string): Promise<ActionState> {
  try {
    const admin = await securityUser()
    if (!UUID.test(deviceId)) return { error: "Unknown device." }
    const removed = await removeTrustedDevices(admin.id, deviceId)
    if (!removed) return { error: "That device was already removed." }
    if ((await getTrustedDeviceCookie())?.deviceId === deviceId) await clearTrustedDeviceCookie()
    await logActivity({ admin, action: "security.trusted_device_removed", entityType: "user", entityId: admin.id, description: `${admin.username} removed a trusted device`, metadata: { deviceId } })
    revalidatePath(SECURITY_PATH)
    return { ok: true, message: "Device removed. It will ask for a code at the next sign-in." }
  } catch (error) {
    return toActionError(error)
  }
}

export async function removeAllTrustedDevicesAction(): Promise<ActionState> {
  try {
    const admin = await securityUser()
    const removed = await removeTrustedDevices(admin.id)
    await clearTrustedDeviceCookie()
    if (removed) {
      await logActivity({
        admin,
        action: "security.trusted_device_removed",
        entityType: "user",
        entityId: admin.id,
        description: `${admin.username} removed all trusted devices (${removed})`,
        metadata: { count: removed },
      })
    }
    revalidatePath(SECURITY_PATH)
    return { ok: true, message: removed ? `Removed ${removed} device${removed === 1 ? "" : "s"}.` : "No trusted devices to remove." }
  } catch (error) {
    return toActionError(error)
  }
}

// ---------------------------------------------------------------------------------------
// Super admin: reset another user's 2FA
// ---------------------------------------------------------------------------------------

/**
 * Clears another user's 2FA (lost phone): secret, recovery codes and trusted devices. Their
 * sessions end; a super admin or admin must set 2FA up again at their next sign-in.
 */
export async function resetUserTwoFactorAction(userId: string): Promise<ActionState> {
  try {
    const admin = await authorizeAction("users.manage")
    if (!UUID.test(userId)) return { error: "Unknown user." }
    if (userId === admin.id) return { error: "You can't reset your own two-factor authentication — use My Account → Security." }

    const { data: target, error } = await db().from("users").select("id, username, role, totp_enabled_at").eq("id", userId).maybeSingle()
    if (error) throw error
    if (!target) return { error: "User not found." }

    await clearTwoFactor(userId)
    const role = target.role as AdminRole
    await logActivity({
      admin,
      action: role === "super_admin" ? "security.2fa_reset_super_admin" : role === "admin" ? "security.2fa_reset_admin" : "security.2fa_reset_editor",
      entityType: "user",
      entityId: userId,
      description: `${admin.username} reset two-factor authentication for ${target.username} (${role.replace("_", " ")})`,
      metadata: { targetUsername: target.username, targetRole: role, wasEnabled: Boolean(target.totp_enabled_at) },
    })
    revalidatePath("/admin/users")
    revalidatePath(`/admin/users/${userId}`)
    return {
      ok: true,
      message: isTwoFactorRequired(role)
        ? `${target.username}'s two-factor authentication was reset. They must set it up again at their next sign-in.`
        : `${target.username}'s two-factor authentication was reset.`,
    }
  } catch (error) {
    return toActionError(error)
  }
}

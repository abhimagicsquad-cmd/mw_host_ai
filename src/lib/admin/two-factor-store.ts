import "server-only"

import { headers } from "next/headers"

import { cmsAdminDb } from "@/lib/cms/db"

import { getClientIp, logActivity } from "./activity"
import { isTwoFactorThrottled, recordTwoFactorFailure, clearTwoFactorFailures } from "./rate-limit"
import {
  decryptSecret,
  describeDevice,
  generateDeviceToken,
  generateRecoveryCodes,
  hashDeviceToken,
  hashRecoveryCode,
  looksLikeRecoveryCode,
  looksLikeTotp,
  PENDING_SETUP_MINUTES,
  safeEqualStrings,
  TRUSTED_DEVICE_DAYS,
  verifyTotp,
} from "./two-factor"

/** Database side of 2FA (users' TOTP columns, admin_recovery_codes, admin_trusted_devices). */

export type TwoFactorRecord = {
  totp_secret_encrypted: string | null
  totp_pending_secret_encrypted: string | null
  totp_pending_created_at: string | null
  totp_enabled_at: string | null
  totp_last_used_step: number | null
  totp_last_verified_at: string | null
}

function db() {
  if (!cmsAdminDb) throw new Error("The CMS database is not configured.")
  return cmsAdminDb
}

export async function getTwoFactorRecord(userId: string): Promise<TwoFactorRecord | null> {
  const { data, error } = await db()
    .from("users")
    .select("totp_secret_encrypted, totp_pending_secret_encrypted, totp_pending_created_at, totp_enabled_at, totp_last_used_step, totp_last_verified_at")
    .eq("id", userId)
    .maybeSingle()
  if (error) throw error
  return data as TwoFactorRecord | null
}

/** The secret being set up, while it's still fresh (a stale half-finished setup is discarded). */
export function pendingSecret(record: TwoFactorRecord | null): string | null {
  if (!record?.totp_pending_secret_encrypted || !record.totp_pending_created_at) return null
  if (Date.now() - Date.parse(record.totp_pending_created_at) > PENDING_SETUP_MINUTES * 60_000) return null
  return decryptSecret(record.totp_pending_secret_encrypted)
}

/**
 * Accepts a TOTP code for `step` only if no code from that step or a later one was used before
 * — one conditional update, so two concurrent requests can't both use the same code.
 */
async function claimStep(userId: string, step: number): Promise<boolean> {
  const { data, error } = await db()
    .from("users")
    .update({ totp_last_used_step: step, totp_last_verified_at: new Date().toISOString() })
    .eq("id", userId)
    .or(`totp_last_used_step.is.null,totp_last_used_step.lt.${step}`)
    .select("id")
  if (error) throw error
  return (data?.length ?? 0) > 0
}

export type CodeCheck =
  | { ok: true; method: "totp" | "recovery"; step?: number; recoveryCodesLeft?: number }
  | { ok: false; error: string; throttled?: boolean }

type CodeContext = { userId: string; username: string; context: string; allowRecovery?: boolean }

const THROTTLED = "Too many incorrect codes. Wait 15 minutes, then try again."

/**
 * Checks a code against the user's ACTIVE secret (or, when allowed, a recovery code — which
 * is then used up). Throttled per account and IP; every failure is logged as security.2fa_failed.
 */
export async function checkUserCode(input: string, { userId, username, context, allowRecovery = false }: CodeContext): Promise<CodeCheck> {
  const ip = await getClientIp()
  if (await isTwoFactorThrottled(ip, username)) return { ok: false, error: THROTTLED, throttled: true }

  const record = await getTwoFactorRecord(userId)
  const secret = record?.totp_enabled_at && record.totp_secret_encrypted ? decryptSecret(record.totp_secret_encrypted) : null
  if (!record || !secret) return { ok: false, error: "Two-factor authentication is not set up for this account." }

  if (looksLikeTotp(input)) {
    const step = verifyTotp(secret, input, record.totp_last_used_step)
    if (step !== null && (await claimStep(userId, step))) {
      clearTwoFactorFailures(username)
      return { ok: true, method: "totp" }
    }
  } else if (allowRecovery && looksLikeRecoveryCode(input)) {
    const { data, error } = await db()
      .from("admin_recovery_codes")
      .update({ used_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("code_hash", hashRecoveryCode(input))
      .is("used_at", null)
      .select("id")
    if (error) throw error
    if (data?.length) {
      clearTwoFactorFailures(username)
      await db().from("users").update({ totp_last_verified_at: new Date().toISOString() }).eq("id", userId)
      const left = await countRecoveryCodes(userId)
      await logActivity({
        userId,
        username,
        action: "security.recovery_code_used",
        entityType: "user",
        entityId: userId,
        description: `${username} used a recovery code (${left} left)`,
        metadata: { context, remaining: left },
      })
      return { ok: true, method: "recovery", recoveryCodesLeft: left }
    }
  }

  return failure(userId, username, context)
}

/** Checks a code against a secret being set up (not yet active). Throttled and logged like the rest. */
export async function checkSetupCode(input: string, secret: string, { userId, username, context }: CodeContext): Promise<CodeCheck> {
  const ip = await getClientIp()
  if (await isTwoFactorThrottled(ip, username)) return { ok: false, error: THROTTLED, throttled: true }
  const step = verifyTotp(secret, input)
  if (step !== null) {
    clearTwoFactorFailures(username)
    return { ok: true, method: "totp", step }
  }
  return failure(userId, username, context)
}

async function failure(userId: string, username: string, context: string): Promise<CodeCheck> {
  recordTwoFactorFailure(username)
  await logActivity({
    userId,
    username,
    action: "security.2fa_failed",
    entityType: "user",
    entityId: userId,
    description: `Incorrect two-factor code for ${username} (${context})`,
    metadata: { context },
  })
  return { ok: false, error: "That code isn't valid. Check your authenticator app and try again." }
}

// ---------------------------------------------------------------------------------------
// Recovery codes
// ---------------------------------------------------------------------------------------

/** Replaces the user's recovery codes; returns the new codes in plaintext — shown once, never stored. */
export async function replaceRecoveryCodes(userId: string): Promise<string[]> {
  const codes = generateRecoveryCodes()
  const { error: deleteError } = await db().from("admin_recovery_codes").delete().eq("user_id", userId)
  if (deleteError) throw deleteError
  const { error } = await db()
    .from("admin_recovery_codes")
    .insert(codes.map((code) => ({ user_id: userId, code_hash: hashRecoveryCode(code) })))
  if (error) throw error
  return codes
}

export async function countRecoveryCodes(userId: string): Promise<number> {
  const { count } = await db().from("admin_recovery_codes").select("id", { count: "exact", head: true }).eq("user_id", userId).is("used_at", null)
  return count ?? 0
}

export type RecoveryCodeStatus = { id: string; used_at: string | null; created_at: string }

export async function listRecoveryCodeStatus(userId: string): Promise<RecoveryCodeStatus[]> {
  const { data, error } = await db().from("admin_recovery_codes").select("id, used_at, created_at").eq("user_id", userId).order("created_at").order("id")
  if (error) throw error
  return (data as RecoveryCodeStatus[]) ?? []
}

// ---------------------------------------------------------------------------------------
// Trusted devices
// ---------------------------------------------------------------------------------------

export type TrustedDevice = { id: string; label: string | null; ip_address: string | null; created_at: string; last_used_at: string; expires_at: string }

export async function listTrustedDevices(userId: string): Promise<TrustedDevice[]> {
  const { data, error } = await db()
    .from("admin_trusted_devices")
    .select("id, label, ip_address, created_at, last_used_at, expires_at")
    .eq("user_id", userId)
    .gt("expires_at", new Date().toISOString())
    .order("last_used_at", { ascending: false })
  if (error) throw error
  return (data as TrustedDevice[]) ?? []
}

/** Registers this browser; returns the id and the token for the cookie (only its hash is stored). */
export async function addTrustedDevice(userId: string): Promise<{ id: string; token: string; label: string }> {
  const h = await headers()
  const token = generateDeviceToken()
  const label = describeDevice(h.get("user-agent"))
  // Expired devices are swept whenever a new one is added.
  await db().from("admin_trusted_devices").delete().eq("user_id", userId).lt("expires_at", new Date().toISOString())
  const { data, error } = await db()
    .from("admin_trusted_devices")
    .insert({
      user_id: userId,
      token_hash: hashDeviceToken(token),
      label,
      ip_address: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      expires_at: new Date(Date.now() + TRUSTED_DEVICE_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select("id")
    .single()
  if (error) throw error
  return { id: data.id as string, token, label }
}

/** Whether the device cookie belongs to this user and is still trusted (and marks it used). */
export async function isTrustedDevice(userId: string, cookie: { deviceId: string; token: string } | null): Promise<boolean> {
  if (!cookie) return false
  const { data } = await db()
    .from("admin_trusted_devices")
    .select("id, token_hash, expires_at")
    .eq("id", cookie.deviceId)
    .eq("user_id", userId)
    .maybeSingle()
  if (!data || Date.parse(data.expires_at as string) < Date.now()) return false
  if (!safeEqualStrings(data.token_hash as string, hashDeviceToken(cookie.token))) return false
  await db().from("admin_trusted_devices").update({ last_used_at: new Date().toISOString() }).eq("id", data.id)
  return true
}

export async function removeTrustedDevices(userId: string, deviceId?: string): Promise<number> {
  let query = db().from("admin_trusted_devices").delete().eq("user_id", userId)
  if (deviceId) query = query.eq("id", deviceId)
  const { data, error } = await query.select("id")
  if (error) throw error
  return data?.length ?? 0
}

/** Turns 2FA off completely: secret, half-finished setup, recovery codes and trusted devices. */
export async function clearTwoFactor(userId: string) {
  const { error } = await db()
    .from("users")
    .update({
      totp_secret_encrypted: null,
      totp_pending_secret_encrypted: null,
      totp_pending_created_at: null,
      totp_enabled_at: null,
      totp_last_used_step: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
  if (error) throw error
  await db().from("admin_recovery_codes").delete().eq("user_id", userId)
  await db().from("admin_trusted_devices").delete().eq("user_id", userId)
}

import "server-only"

import { cookies } from "next/headers"

import type { AdminRole } from "@/lib/cms/types"

import {
  credentialVersion,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  signPendingTwoFactor,
  signSession,
  TWO_FACTOR_PENDING_COOKIE,
  TWO_FACTOR_PENDING_MAX_AGE_SECONDS,
  verifyPendingTwoFactor,
} from "./session"
import { TRUSTED_DEVICE_DAYS } from "./two-factor"

const secure = process.env.NODE_ENV === "production"

/**
 * Issues the admin session cookie. Pass `passwordHash` for CMS users so the session carries
 * its credential version (a later password change then revokes it), and `mfa` when the
 * sign-in passed two-factor authentication.
 */
export async function setSessionCookie(payload: { sub: string; username: string; role: AdminRole; passwordHash?: string; mfa?: string }) {
  const { passwordHash, mfa, ...claims } = payload
  const store = await cookies()
  store.set(
    SESSION_COOKIE,
    await signSession({ ...claims, ...(passwordHash ? { cv: await credentialVersion(passwordHash) } : {}), ...(mfa ? { mfa } : {}) }),
    { httpOnly: true, secure, sameSite: "lax", path: "/admin", maxAge: SESSION_MAX_AGE_SECONDS }
  )
}

// The pending-2FA cookie only travels to the login page, where the code is entered.
const PENDING_PATH = "/mwh-admin-login"

export async function setPendingTwoFactorCookie(payload: { sub: string; username: string; role: AdminRole; passwordHash: string; next?: string }) {
  const store = await cookies()
  const { passwordHash, ...claims } = payload
  store.set(TWO_FACTOR_PENDING_COOKIE, await signPendingTwoFactor({ ...claims, cv: await credentialVersion(passwordHash) }), {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: PENDING_PATH,
    maxAge: TWO_FACTOR_PENDING_MAX_AGE_SECONDS,
  })
}

export async function getPendingTwoFactor() {
  return verifyPendingTwoFactor((await cookies()).get(TWO_FACTOR_PENDING_COOKIE)?.value)
}

export async function clearPendingTwoFactorCookie() {
  ;(await cookies()).delete({ name: TWO_FACTOR_PENDING_COOKIE, path: PENDING_PATH })
}

/**
 * "Remember this device": `<device id>.<random token>`; only a keyed hash of the token is
 * stored. SameSite=Strict and httpOnly. Path "/" so the Security page can mark this device;
 * on its own it grants nothing — the password is still required.
 */
export const TRUSTED_DEVICE_COOKIE = "mwh_admin_device"

export async function setTrustedDeviceCookie(deviceId: string, token: string) {
  ;(await cookies()).set(TRUSTED_DEVICE_COOKIE, `${deviceId}.${token}`, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: TRUSTED_DEVICE_DAYS * 24 * 60 * 60,
  })
}

export async function getTrustedDeviceCookie(): Promise<{ deviceId: string; token: string } | null> {
  const value = (await cookies()).get(TRUSTED_DEVICE_COOKIE)?.value
  const [deviceId, token] = value?.split(".") ?? []
  return deviceId && token && /^[0-9a-f-]{36}$/i.test(deviceId) ? { deviceId, token } : null
}

export async function clearTrustedDeviceCookie() {
  ;(await cookies()).delete({ name: TRUSTED_DEVICE_COOKIE, path: "/" })
}

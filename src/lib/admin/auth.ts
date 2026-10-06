import "server-only"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"

import { cmsAdminDb, isMissingTableError } from "@/lib/cms/db"
import type { AdminRole, SafeUser } from "@/lib/cms/types"

import { can, type Permission } from "./permissions"
import { credentialVersion, SESSION_COOKIE, verifySession } from "./session"
import { isTwoFactorRequired, twoFactorFingerprint } from "./two-factor"

export type TwoFactorState = {
  enabled: boolean
  /** Super admins and admins must use 2FA; editors may. */
  required: boolean
  enabledAt: string | null
  lastVerifiedAt: string | null
  /** supabase/migrations/0007_admin_two_factor.sql hasn't been run, so 2FA can't be stored yet. */
  storageMissing: boolean
}

export type CurrentAdmin = Pick<SafeUser, "id" | "username" | "email" | "full_name" | "role" | "must_change_password"> & {
  /** True for the env-configured break-glass login (only works while no CMS users exist). */
  isBootstrap: boolean
  twoFactor: TwoFactorState
  /**
   * Required 2FA isn't set up: the user may only use My Account → Security (setup) and sign
   * out. Enforced in requireAdmin / authorizeAction, i.e. on every admin page and action.
   */
  twoFactorSetupRequired: boolean
}

/** Where users who must set up 2FA are held. */
export const SECURITY_PATH = "/admin/account/security"

/**
 * The env break-glass login (ADMIN_BOOTSTRAP_USERNAME / ADMIN_BOOTSTRAP_PASSWORD) exists so
 * the panel is reachable before the CMS migration has created and seeded `users`. It
 * switches itself off permanently once any user row exists.
 */
export async function isBootstrapLoginAllowed(): Promise<boolean> {
  if (!process.env.ADMIN_BOOTSTRAP_USERNAME || !process.env.ADMIN_BOOTSTRAP_PASSWORD) return false
  if (!cmsAdminDb) return true
  const { count, error } = await cmsAdminDb.from("users").select("id", { count: "exact", head: true })
  if (error) return isMissingTableError(error)
  return (count ?? 0) === 0
}

const BASE_COLUMNS = "id, username, email, full_name, role, must_change_password, is_active, password_hash"
const TWO_FACTOR_COLUMNS = "totp_secret_encrypted, totp_enabled_at, totp_last_verified_at"

type UserWithTwoFactor = {
  id: string
  username: string
  email: string | null
  full_name: string | null
  role: AdminRole
  must_change_password: boolean
  is_active: boolean
  password_hash: string
  totp_secret_encrypted?: string | null
  totp_enabled_at?: string | null
  totp_last_verified_at?: string | null
}

/** The user row with its 2FA columns — or without them (storageMissing) before migration 0007 has run. */
export async function loadUserForAuth(id: string): Promise<{ user: UserWithTwoFactor | null; storageMissing: boolean }> {
  if (!cmsAdminDb) return { user: null, storageMissing: false }
  const full = await cmsAdminDb.from("users").select(`${BASE_COLUMNS}, ${TWO_FACTOR_COLUMNS}`).eq("id", id).maybeSingle()
  if (!full.error) return { user: full.data as UserWithTwoFactor | null, storageMissing: false }
  if (!isMissingTableError(full.error) && full.error.code !== "42703") return { user: null, storageMissing: false }
  const base = await cmsAdminDb.from("users").select(BASE_COLUMNS).eq("id", id).maybeSingle()
  return { user: base.error ? null : (base.data as UserWithTwoFactor | null), storageMissing: true }
}

/**
 * Verifies the session cookie AND re-checks the user in the database (so deactivation, role
 * changes, password changes and 2FA resets apply immediately).
 */
export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  const store = await cookies()
  const session = await verifySession(store.get(SESSION_COOKIE)?.value)
  if (!session) return null

  if (session.sub === "bootstrap") {
    if (!(await isBootstrapLoginAllowed())) return null
    // The break-glass login has no stored account to enrol, and only exists while there are
    // no users at all; it switches off as soon as the first (2FA-enforced) user is created.
    return {
      id: "bootstrap",
      username: session.username,
      email: null,
      full_name: "Bootstrap Admin",
      role: "super_admin",
      must_change_password: false,
      isBootstrap: true,
      twoFactor: { enabled: false, required: false, enabledAt: null, lastVerifiedAt: null, storageMissing: false },
      twoFactorSetupRequired: false,
    }
  }

  const { user, storageMissing } = await loadUserForAuth(session.sub)
  if (!user || !user.is_active) return null
  // A password change since sign-in revokes the session.
  if (session.cv && session.cv !== (await credentialVersion(user.password_hash))) return null

  const enabled = Boolean(user.totp_enabled_at && user.totp_secret_encrypted)
  if (enabled) {
    // 2FA is on: only sessions opened with the current enrolment count (a password-only
    // session, or one from before a reset or a new secret, is signed out).
    if (session.mfa !== twoFactorFingerprint(user.totp_enabled_at!, user.totp_secret_encrypted!)) return null
  } else if (session.mfa) {
    // Opened with 2FA that has since been reset or turned off elsewhere: sign in again.
    return null
  }

  const role = user.role as AdminRole
  const required = isTwoFactorRequired(role)
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    full_name: user.full_name,
    role,
    must_change_password: user.must_change_password,
    isBootstrap: false,
    twoFactor: { enabled, required, enabledAt: user.totp_enabled_at ?? null, lastVerifiedAt: user.totp_last_verified_at ?? null, storageMissing },
    twoFactorSetupRequired: required && !enabled,
  }
})

type GateOptions = {
  /** For My Account → Security only: reachable while required 2FA is not set up yet. */
  allowTwoFactorSetup?: boolean
}

/**
 * For admin pages: redirects to login when signed out, to Security when required 2FA isn't
 * set up, or to the dashboard when lacking `permission`.
 */
export async function requireAdmin(permission?: Permission, options: GateOptions = {}): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin()
  if (!admin) redirect("/mwh-admin-login")
  if (admin.twoFactorSetupRequired && !options.allowTwoFactorSetup) redirect(`${SECURITY_PATH}?setup=required`)
  if (permission && !can(admin.role, permission)) redirect("/admin/dashboard?denied=1")
  return admin
}

export class AuthorizationError extends Error {}

/** For server actions: throws instead of redirecting so the form can show the message. */
export async function authorizeAction(permission?: Permission, options: GateOptions = {}): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin()
  if (!admin) throw new AuthorizationError("Your session has expired. Please sign in again.")
  if (admin.twoFactorSetupRequired && !options.allowTwoFactorSetup) {
    throw new AuthorizationError("Set up two-factor authentication (My Account → Security) before using the dashboard.")
  }
  if (permission && !can(admin.role, permission)) throw new AuthorizationError("You don't have permission to do that.")
  return admin
}

/** `users.id` foreign keys can't reference the bootstrap pseudo-user. */
export function actorId(admin: CurrentAdmin): string | null {
  return admin.isBootstrap ? null : admin.id
}

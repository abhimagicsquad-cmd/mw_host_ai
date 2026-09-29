import "server-only"

import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"

import { cmsAdminDb, isMissingTableError } from "@/lib/cms/db"
import type { AdminRole, SafeUser } from "@/lib/cms/types"

import { can, type Permission } from "./permissions"
import { ADMIN_PATH_HEADER, SESSION_COOKIE, verifySession } from "./session"

export type CurrentAdmin = Pick<SafeUser, "id" | "username" | "email" | "full_name" | "role" | "must_change_password"> & {
  /** True for the env-configured break-glass login (only works while no CMS users exist). */
  isBootstrap: boolean
}

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

/** Verifies the session cookie AND re-checks the user in the database (so deactivation/role changes apply immediately). */
export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  const store = await cookies()
  const session = await verifySession(store.get(SESSION_COOKIE)?.value)
  if (!session) return null

  if (session.sub === "bootstrap") {
    if (!(await isBootstrapLoginAllowed())) return null
    return {
      id: "bootstrap",
      username: session.username,
      email: null,
      full_name: "Bootstrap Admin",
      role: "super_admin",
      must_change_password: false,
      isBootstrap: true,
    }
  }

  if (!cmsAdminDb) return null
  const { data, error } = await cmsAdminDb
    .from("users")
    .select("id, username, email, full_name, role, must_change_password, is_active")
    .eq("id", session.sub)
    .maybeSingle()
  if (error || !data || !data.is_active) return null

  return {
    id: data.id,
    username: data.username,
    email: data.email,
    full_name: data.full_name,
    role: data.role as AdminRole,
    must_change_password: data.must_change_password,
    isBootstrap: false,
  }
})

/** For admin pages: redirects to login when signed out, or to the dashboard when lacking `permission`. */
export async function requireAdmin(permission?: Permission): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin()
  if (!admin) redirect("/admin/login")
  // A temporary/default password must be replaced before anything else in the admin is usable.
  if (admin.must_change_password && (await headers()).get(ADMIN_PATH_HEADER) !== "/admin/profile") {
    redirect("/admin/profile?required=1")
  }
  if (permission && !can(admin.role, permission)) redirect("/admin/dashboard?denied=1")
  return admin
}

export class AuthorizationError extends Error {}

/** For server actions: throws instead of redirecting so the form can show the message. */
export async function authorizeAction(permission?: Permission): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin()
  if (!admin) throw new AuthorizationError("Your session has expired. Please sign in again.")
  // Only the permission-less account actions (changing the password) are open until then.
  if (permission && admin.must_change_password) throw new AuthorizationError("Change your temporary password first (Profile).")
  if (permission && !can(admin.role, permission)) throw new AuthorizationError("You don't have permission to do that.")
  return admin
}

/** `users.id` foreign keys can't reference the bootstrap pseudo-user. */
export function actorId(admin: CurrentAdmin): string | null {
  return admin.isBootstrap ? null : admin.id
}

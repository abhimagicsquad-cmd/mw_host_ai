import "server-only"

import { cmsAdminDb } from "@/lib/cms/db"
import type { AdminRole } from "@/lib/cms/types"

import { logActivity } from "./activity"
import { clearPendingTwoFactorCookie, setSessionCookie } from "./session-cookie"

export type SignInMethod = "password" | "password+totp" | "password+recovery_code" | "password+trusted_device"

/**
 * Opens the admin session once every required factor has passed: issues the session cookie
 * (bound to the 2FA enrolment via `mfa` when 2FA was used), records the sign-in time and
 * logs auth.login with the method used.
 */
export async function completeSignIn(
  user: { id: string; username: string; role: AdminRole; password_hash: string },
  { method, mfa }: { method: SignInMethod; mfa?: string }
) {
  await clearPendingTwoFactorCookie()
  await setSessionCookie({ sub: user.id, username: user.username, role: user.role, passwordHash: user.password_hash, mfa })
  await cmsAdminDb?.from("users").update({ last_login_at: new Date().toISOString() }).eq("id", user.id)
  await logActivity({
    userId: user.id,
    username: user.username,
    action: "auth.login",
    entityType: "auth",
    description: `${user.username} signed in${method === "password" ? "" : ` (${method.replace("password+", "").replace("_", " ")})`}`,
    metadata: { method },
  })
}

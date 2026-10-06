import "server-only"

import { cookies } from "next/headers"

import type { AdminRole } from "@/lib/cms/types"

import { credentialVersion, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, signSession } from "./session"

/**
 * Issues the admin session cookie. Pass `passwordHash` for CMS users so the session carries
 * its credential version (a later password change then revokes it).
 */
export async function setSessionCookie(payload: { sub: string; username: string; role: AdminRole; passwordHash?: string }) {
  const { passwordHash, ...claims } = payload
  const store = await cookies()
  store.set(SESSION_COOKIE, await signSession({ ...claims, ...(passwordHash ? { cv: await credentialVersion(passwordHash) } : {}) }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
}

import "server-only"

import { cmsAdminDb } from "@/lib/cms/db"

/**
 * Login throttle, two layers:
 * - in-memory per instance (5 failures per 15 minutes per IP+username) — instant, but it
 *   resets on a serverless cold start and isn't shared between instances;
 * - durable, counted from the `auth.login_failed` rows the audit log already records
 *   (activity_logs.ip_address / username / created_at), so it holds across instances.
 * Lockouts are keyed on the client IP, never on the username alone, so nobody can lock the
 * real admin out from elsewhere by spamming bad passwords for that username.
 */
const WINDOW_MS = 15 * 60 * 1000
const MAX_FAILURES = 5
/** Failures from one IP across all usernames (credential stuffing). */
const MAX_FAILURES_PER_IP = 20

const failures = new Map<string, { count: number; firstAt: number }>()

function isThrottledInMemory(key: string): boolean {
  const entry = failures.get(key)
  if (!entry) return false
  if (Date.now() - entry.firstAt > WINDOW_MS) {
    failures.delete(key)
    return false
  }
  return entry.count >= MAX_FAILURES
}

const escapeLike = (value: string) => value.replace(/[\\%_]/g, (c) => `\\${c}`)

/** Failed sign-ins from `ip` (for `username`, when given) since `since`. */
async function failuresSince(since: string, ip: string, username?: string): Promise<number> {
  if (!cmsAdminDb) return 0
  let query = cmsAdminDb
    .from("activity_logs")
    .select("id", { count: "exact", head: true })
    .eq("action", "auth.login_failed")
    .eq("ip_address", ip)
    .gt("created_at", since)
  if (username) query = query.ilike("username", escapeLike(username))
  const { count, error } = await query
  // Fail open on a lookup error: the in-memory layer and the password hash still apply.
  return error ? 0 : (count ?? 0)
}

/** A successful sign-in resets that user's count, so earlier typos don't linger for 15 minutes. */
async function lastSuccessSince(windowStart: string, username: string): Promise<string> {
  if (!cmsAdminDb) return windowStart
  const { data } = await cmsAdminDb
    .from("activity_logs")
    .select("created_at")
    .eq("action", "auth.login")
    .ilike("username", escapeLike(username))
    .gt("created_at", windowStart)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data?.created_at as string | undefined) ?? windowStart
}

export async function isLoginThrottled(ip: string | null, username: string): Promise<boolean> {
  if (isThrottledInMemory(`${ip ?? "unknown"}:${username.toLowerCase()}`)) return true
  if (!ip) return false
  const windowStart = new Date(Date.now() - WINDOW_MS).toISOString()
  const [forUser, forIp] = await Promise.all([
    lastSuccessSince(windowStart, username).then((since) => failuresSince(since, ip, username)),
    failuresSince(windowStart, ip),
  ])
  return forUser >= MAX_FAILURES || forIp >= MAX_FAILURES_PER_IP
}

export function recordLoginFailure(ip: string | null, username: string) {
  const key = `${ip ?? "unknown"}:${username.toLowerCase()}`
  if (failures.size > 5000) failures.clear() // bound memory under a flood
  const entry = failures.get(key)
  if (!entry || Date.now() - entry.firstAt > WINDOW_MS) {
    failures.set(key, { count: 1, firstAt: Date.now() })
  } else {
    entry.count += 1
  }
}

export function clearLoginFailures(ip: string | null, username: string) {
  failures.delete(`${ip ?? "unknown"}:${username.toLowerCase()}`)
}

/**
 * Two-factor code throttle — same two layers, counted from `security.2fa_failed` rows.
 * Keyed on the ACCOUNT (not just the IP): a 6-digit code has a million values, so an attacker
 * who has the password must not get more than a handful of guesses per 15 minutes from any
 * number of addresses. A successful verification resets the count. Recovery-code and setup
 * attempts count too.
 */
const MAX_2FA_FAILURES = 5
const MAX_2FA_FAILURES_PER_IP = 20
const twoFactorFailures = new Map<string, { count: number; firstAt: number }>()

async function countSince(action: string, since: string, filter: { username?: string; ip?: string }): Promise<number> {
  if (!cmsAdminDb) return 0
  let query = cmsAdminDb.from("activity_logs").select("id", { count: "exact", head: true }).eq("action", action).gt("created_at", since)
  if (filter.username) query = query.ilike("username", escapeLike(filter.username))
  if (filter.ip) query = query.eq("ip_address", filter.ip)
  const { count, error } = await query
  return error ? 0 : (count ?? 0)
}

export async function isTwoFactorThrottled(ip: string | null, username: string): Promise<boolean> {
  const memory = twoFactorFailures.get(username.toLowerCase())
  if (memory && Date.now() - memory.firstAt <= WINDOW_MS && memory.count >= MAX_2FA_FAILURES) return true

  const windowStart = new Date(Date.now() - WINDOW_MS).toISOString()
  const { data } = cmsAdminDb
    ? await cmsAdminDb
        .from("activity_logs")
        .select("created_at")
        .eq("action", "security.2fa_verified")
        .ilike("username", escapeLike(username))
        .gt("created_at", windowStart)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null }
  const since = (data?.created_at as string | undefined) ?? windowStart
  const [forUser, forIp] = await Promise.all([
    countSince("security.2fa_failed", since, { username }),
    ip ? countSince("security.2fa_failed", windowStart, { ip }) : Promise.resolve(0),
  ])
  return forUser >= MAX_2FA_FAILURES || forIp >= MAX_2FA_FAILURES_PER_IP
}

export function recordTwoFactorFailure(username: string) {
  const key = username.toLowerCase()
  if (twoFactorFailures.size > 5000) twoFactorFailures.clear()
  const entry = twoFactorFailures.get(key)
  if (!entry || Date.now() - entry.firstAt > WINDOW_MS) twoFactorFailures.set(key, { count: 1, firstAt: Date.now() })
  else entry.count += 1
}

export function clearTwoFactorFailures(username: string) {
  twoFactorFailures.delete(username.toLowerCase())
}

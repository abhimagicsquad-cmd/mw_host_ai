import type { AdminRole } from "@/lib/cms/types"

/**
 * Stateless admin session: base64url(JSON payload) + "." + base64url(HMAC-SHA256).
 * Uses only Web Crypto so it runs in proxy.ts as well as in server components/actions.
 * The cookie is httpOnly + SameSite=Lax + Secure (in production) and scoped to /admin.
 *
 * Signing key: ADMIN_SESSION_SECRET, or — so a fresh Vercel deploy works without extra
 * setup — a key derived from SUPABASE_SERVICE_ROLE_KEY (server-only, never shipped to the
 * browser). Rotating either secret signs everyone out.
 */

export const SESSION_COOKIE = "mwh_admin_session"
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8 // 8 hours

export type SessionPayload = {
  /** User id, or "bootstrap" for the env-configured break-glass login. */
  sub: string
  username: string
  role: AdminRole
  /**
   * Credential version: a fingerprint of the user's password hash at sign-in. A password
   * change alters it, which revokes every session issued before the change. Absent on
   * bootstrap sessions (and on sessions issued before this field existed — they expire on
   * their own within SESSION_MAX_AGE_SECONDS).
   */
  cv?: string
  /** Expiry, epoch seconds. */
  exp: number
}

/** Short, non-reversible fingerprint of a stored password hash, for `SessionPayload.cv`. */
export async function credentialVersion(passwordHash: string): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(`mwh-cv:${passwordHash}`)))
  return toBase64Url(digest).slice(0, 22)
}

const encoder = new TextEncoder()
let keyPromise: Promise<CryptoKey | null> | null = null

async function getKey(): Promise<CryptoKey | null> {
  if (!keyPromise) {
    keyPromise = (async () => {
      const explicit = process.env.ADMIN_SESSION_SECRET
      const fallback = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (!explicit && !fallback) return null

      const material = explicit
        ? encoder.encode(explicit)
        : new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(`mwh-admin-session:${fallback}`)))
      return crypto.subtle.importKey("raw", material, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"])
    })()
  }
  return keyPromise
}

export async function isSessionSigningConfigured() {
  return (await getKey()) !== null
}

function toBase64Url(bytes: Uint8Array) {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4)
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export async function signSession(payload: Omit<SessionPayload, "exp">): Promise<string> {
  const key = await getKey()
  if (!key) throw new Error("Admin session signing key is not configured")

  const body = toBase64Url(
    encoder.encode(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS }))
  )
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(body)))
  return `${body}.${toBase64Url(signature)}`
}

export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null
  const [body, signature] = token.split(".")
  if (!body || !signature) return null

  const key = await getKey()
  if (!key) return null

  try {
    const valid = await crypto.subtle.verify("HMAC", key, fromBase64Url(signature), encoder.encode(body))
    if (!valid) return null
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as SessionPayload
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

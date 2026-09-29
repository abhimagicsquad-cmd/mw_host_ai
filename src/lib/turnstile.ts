import "server-only"

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

/** True when Cloudflare Turnstile is configured (both keys set). Until then forms rely on the honeypot, fill-time and rate-limit checks. */
export function isTurnstileEnabled() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)
}

/**
 * Verifies a Turnstile token server-side. Returns true when Turnstile isn't configured, so the
 * forms keep working before the keys are added. A Cloudflare outage fails closed (false).
 */
export async function verifyTurnstile(token: unknown, ip?: string): Promise<boolean> {
  if (!isTurnstileEnabled()) return true
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) return false

  const body = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY!, response: token })
  if (ip && ip !== "unknown") body.set("remoteip", ip)

  try {
    const response = await fetch(VERIFY_URL, { method: "POST", body, cache: "no-store", signal: AbortSignal.timeout(5000) })
    const result = (await response.json()) as { success?: boolean }
    return result.success === true
  } catch (error) {
    console.error("[turnstile] verification request failed", error)
    return false
  }
}

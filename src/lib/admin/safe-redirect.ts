/**
 * Turns an untrusted redirect target (a `?path=` / `?next=` value) into a same-origin
 * path, or null. Prefix checks alone aren't enough: URL parsing treats "\" as "/" and
 * drops tabs/newlines, so "/\evil.com" or "/\t/evil.com" resolve to another host. The value
 * is resolved against a placeholder origin and only accepted when it stays on it.
 */
const PLACEHOLDER_ORIGIN = "https://same-origin.invalid"

export function toSameOriginPath(target: string | null | undefined): string | null {
  if (!target || !target.startsWith("/") || target.startsWith("//") || target.includes("\\")) return null
  try {
    const url = new URL(target, PLACEHOLDER_ORIGIN)
    if (url.origin !== PLACEHOLDER_ORIGIN) return null
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return null
  }
}

const isAdminPath = (path: string) => path === "/admin" || path.startsWith("/admin/") || path.startsWith("/admin?")

/** A public-site path for previews: same-origin and outside the admin. */
export function safePreviewPath(target: string | null | undefined): string {
  const path = toSameOriginPath(target)
  return path && !isAdminPath(path) ? path : "/"
}

/** A post-login destination: same-origin and inside the admin. */
export function safeAdminPath(target: string | null | undefined, fallback = "/admin/dashboard"): string {
  const path = toSameOriginPath(target)
  return path && path.startsWith("/admin/") ? path : fallback
}

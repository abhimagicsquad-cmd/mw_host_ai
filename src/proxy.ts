import { type NextRequest, NextResponse } from "next/server"

import { SESSION_COOKIE, verifySession } from "@/lib/admin/session"

const LOGIN_PATH = "/mwh-admin-login"

/**
 * 1. /admin: optimistic gate (below).
 * 2. Public pages: WordPress's URL form ends in "/", so a slash-less page URL 308s to the
 *    same URL with the slash (one hop, query kept). Done here rather than in next.config
 *    because Next matches redirect sources with an optional trailing slash, so a config rule
 *    would also match — and loop on — the slashed URL. The matcher excludes the API, the
 *    admin (and its login page), the /order/ checkout forwarder, Next internals, generated images and
 *    any path with a file extension.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  if (pathname === "/admin" || pathname.startsWith("/admin/") || pathname === LOGIN_PATH) return adminGate(request)
  if (pathname === "/" || pathname.endsWith("/")) return NextResponse.next()
  return NextResponse.redirect(new URL(`${pathname}/${search}`, request.url), 308)
}

/**
 * Optimistic gate for /admin: bounces requests without a validly-signed, unexpired session
 * cookie to the login page (and signed-in users away from the login page). This is only the
 * first layer — every admin layout/page re-verifies the user against the database via
 * `requireAdmin`, and every server action via `authorizeAction`, per the Next.js auth guide.
 */
async function adminGate(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value)
  const isLoginPage = pathname === LOGIN_PATH
  // Leaving draft preview must work even after the admin session has expired.
  if (pathname === "/admin/preview/exit") return NextResponse.next()

  if (!session && !isLoginPage) {
    const loginUrl = new URL(LOGIN_PATH, request.url)
    if (pathname !== "/admin" && pathname !== "/admin/dashboard") loginUrl.searchParams.set("next", `${pathname}${search}`)
    const response = NextResponse.redirect(loginUrl)
    if (request.cookies.has(SESSION_COOKIE)) response.cookies.delete({ name: SESSION_COOKIE, path: "/admin" })
    return response
  }

  // A signed-in user hitting the login page is redirected by the login page itself, after a
  // database check — redirecting here on signature alone would loop for deactivated users.

  const response = NextResponse.next()
  // The admin must never be indexed or cached by shared caches.
  response.headers.set("X-Robots-Tag", "noindex, nofollow")
  response.headers.set("Cache-Control", "private, no-store")
  return response
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/mwh-admin-login",
    "/((?!api|admin|mwh-admin-login|order/|_next|opengraph-image|twitter-image|icon|apple-icon|.*\\.[a-zA-Z0-9]+$).+)",
  ],
}

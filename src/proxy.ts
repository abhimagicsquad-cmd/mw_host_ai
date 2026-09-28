import { type NextRequest, NextResponse } from "next/server"

import { SESSION_COOKIE, verifySession } from "@/lib/admin/session"

/**
 * Optimistic gate for /admin: bounces requests without a validly-signed, unexpired session
 * cookie to /admin/login (and signed-in users away from the login page). This is only the
 * first layer — every admin layout/page re-verifies the user against the database via
 * `requireAdmin`, and every server action via `authorizeAction`, per the Next.js auth guide.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value)
  const isLoginPage = pathname === "/admin/login"

  if (!session && !isLoginPage) {
    const loginUrl = new URL("/admin/login", request.url)
    if (pathname !== "/admin" && pathname !== "/admin/dashboard") loginUrl.searchParams.set("next", `${pathname}${search}`)
    const response = NextResponse.redirect(loginUrl)
    if (request.cookies.has(SESSION_COOKIE)) response.cookies.delete({ name: SESSION_COOKIE, path: "/admin" })
    return response
  }

  // A signed-in user hitting /admin/login is redirected by the login page itself, after a
  // database check — redirecting here on signature alone would loop for deactivated users.

  const response = NextResponse.next()
  // The admin must never be indexed or cached by shared caches.
  response.headers.set("X-Robots-Tag", "noindex, nofollow")
  response.headers.set("Cache-Control", "private, no-store")
  return response
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
}

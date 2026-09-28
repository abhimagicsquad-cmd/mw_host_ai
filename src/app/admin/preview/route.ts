import { draftMode } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

import { getCurrentAdmin } from "@/lib/admin/auth"

/**
 * /admin/preview?path=/hosting/seo-hosting — turns on Next.js draft mode for this browser
 * and opens the page, so CMS drafts render on the real website templates without being
 * published. Admin-only: lives under /admin so the session cookie is sent and proxy.ts
 * guards it, and the session is re-verified here.
 */
export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.redirect(new URL("/admin/login", request.url))

  const requested = request.nextUrl.searchParams.get("path") ?? "/"
  const path = requested.startsWith("/") && !requested.startsWith("//") && !requested.startsWith("/admin") ? requested : "/"

  ;(await draftMode()).enable()
  return NextResponse.redirect(new URL(path, request.url))
}

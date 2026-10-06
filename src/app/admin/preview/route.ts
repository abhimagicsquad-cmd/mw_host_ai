import { draftMode } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

import { getCurrentAdmin, SECURITY_PATH } from "@/lib/admin/auth"
import { safePreviewPath } from "@/lib/admin/safe-redirect"

/**
 * /admin/preview?path=/hosting/seo-hosting — turns on Next.js draft mode for this browser
 * and opens the page, so CMS drafts render on the real website templates without being
 * published. Admin-only: lives under /admin so the session cookie is sent and proxy.ts
 * guards it, and the session is re-verified here.
 */
export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.redirect(new URL("/mwh-admin-login", request.url))
  // Draft content is dashboard functionality: locked until required 2FA is set up.
  if (admin.twoFactorSetupRequired) return NextResponse.redirect(new URL(`${SECURITY_PATH}?setup=required`, request.url))

  // Same-origin, non-admin paths only (rejects "//host", "/\host" and other off-site tricks).
  const path = safePreviewPath(request.nextUrl.searchParams.get("path"))

  ;(await draftMode()).enable()
  return NextResponse.redirect(new URL(path, request.nextUrl.origin))
}

import { draftMode } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

import { safePreviewPath } from "@/lib/admin/safe-redirect"

/** Leaves draft preview and returns to the page the visitor was on (same-origin only). */
export async function GET(request: NextRequest) {
  ;(await draftMode()).disable()

  let target = "/"
  const referer = request.headers.get("referer")
  if (referer) {
    try {
      const url = new URL(referer)
      if (url.origin === request.nextUrl.origin) target = safePreviewPath(`${url.pathname}${url.search}`)
    } catch {
      // Malformed Referer — fall back to the home page.
    }
  }
  return NextResponse.redirect(new URL(target, request.nextUrl.origin))
}

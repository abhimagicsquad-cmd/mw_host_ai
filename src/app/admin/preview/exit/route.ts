import { draftMode } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

/** Leaves draft preview and returns to the page the visitor was on (same-origin only). */
export async function GET(request: NextRequest) {
  ;(await draftMode()).disable()

  const referer = request.headers.get("referer")
  let target = "/"
  if (referer) {
    const url = new URL(referer)
    if (url.origin === request.nextUrl.origin && !url.pathname.startsWith("/admin")) target = `${url.pathname}${url.search}`
  }
  return NextResponse.redirect(new URL(target, request.url))
}

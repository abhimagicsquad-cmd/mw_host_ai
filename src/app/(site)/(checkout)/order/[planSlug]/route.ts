import { type NextRequest, NextResponse } from "next/server"

import { planCheckoutUrl } from "@/lib/billing"

/**
 * /order/<plan> used to be a test-mode checkout. Purchases now happen in the live billing
 * system (WHMCS), so this URL forwards to that plan's cart — or to the contact form for plans
 * that aren't sold online — keeping any old links and bookmarks working.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ planSlug: string }> }) {
  const { planSlug } = await params
  const checkout = planCheckoutUrl(planSlug)
  return NextResponse.redirect(checkout ?? new URL("/contact-us/", request.url), 307)
}

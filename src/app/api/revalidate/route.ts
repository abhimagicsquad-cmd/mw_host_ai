import { revalidateTag } from "next/cache"
import { type NextRequest, NextResponse } from "next/server"
import { parseBody } from "next-sanity/webhook"

/**
 * Sanity's webhook hits this route whenever a document is published. Without it, every
 * `sanityFetch` call (cache: "force-cache", tags: ["sanity"]) stays cached until the next
 * deploy — editors publish in Studio and production never picks it up. `parseBody` verifies
 * the request actually came from Sanity via SANITY_REVALIDATE_SECRET before triggering
 * revalidation.
 *
 * `revalidateTag`'s second argument is a cache-life *profile*, not a "how hard to invalidate"
 * knob — passing a named profile like "max" sets the tag's expiry a year out (its `expire`
 * value), so `areTagsExpired` never trips and stale pages keep being served indefinitely.
 * `{ expire: 0 }` is what actually produces the immediate hard invalidation this route needs.
 */
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(
      request,
      process.env.SANITY_REVALIDATE_SECRET
    )

    if (!isValidSignature) {
      return NextResponse.json({ revalidated: false, message: "Invalid signature" }, { status: 401 })
    }

    if (!body?._type) {
      return NextResponse.json({ revalidated: false, message: "Missing _type in payload" }, { status: 400 })
    }

    revalidateTag("sanity", { expire: 0 })

    return NextResponse.json({ revalidated: true, type: body._type, now: Date.now() })
  } catch (error) {
    console.error("[api/revalidate] failed", error)
    return NextResponse.json({ revalidated: false, message: "Server error" }, { status: 500 })
  }
}

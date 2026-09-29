import { createClient } from "next-sanity"

import { apiVersion, dataset, projectId, token } from "@/sanity/env"

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  token,
})

/**
 * Fetches from Sanity and swallows errors so a missing project/dataset or a network blip
 * degrades to "no CMS content" (pages fall back to their hardcoded defaults) instead of a 500.
 */
export async function sanityFetch<T>(query: string, params: Record<string, unknown> = {}): Promise<T | null> {
  try {
    const result = await client.fetch<T>(query, params, {
      // Tagged for webhook / admin invalidation, plus an hourly revalidate so a missed
      // webhook can't leave stale Sanity content cached indefinitely.
      next: { tags: ["sanity"], revalidate: 3600 },
    })
    return result ?? null
  } catch (error) {
    console.error("[sanity] fetch failed", { query, error })
    return null
  }
}

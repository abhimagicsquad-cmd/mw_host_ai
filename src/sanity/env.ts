export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01"

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET"
)

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID"
)

/**
 * Server-only read token (not `NEXT_PUBLIC_*`, so it's never inlined into the browser bundle).
 * Required because most document types in this dataset aren't readable by the anonymous/public
 * role — only a handful of singleton pages are. Without this, `sanityFetch` silently returns
 * null for everything else and every page falls back to its hardcoded content.
 */
export const token = process.env.SANITY_API_TOKEN

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }
  return v
}

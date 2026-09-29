import type { Testimonial } from "@/types/content"

/**
 * Customer testimonials shown on the site. Only add real quotes from real customers who
 * agreed to be quoted — add them in the CMS (Testimonials section) or here.
 *
 * The site previously shipped three invented testimonials ("Anita Sharma / Craftly Studio",
 * "Rohit Verma / Bharat Retail Co.", "Priya Nair / Nair & Co."), which also exist in Sanity.
 * Presenting invented people as customers is misleading, so they are listed below and
 * filtered out wherever testimonials render, and any section left empty is hidden.
 */
export const testimonials: Testimonial[] = []

export const PLACEHOLDER_TESTIMONIAL_NAMES = new Set(["Anita Sharma", "Rohit Verma", "Priya Nair"])

export function withoutPlaceholderTestimonials<T extends { name: string }>(items: T[]): T[] {
  return items.filter((item) => !PLACEHOLDER_TESTIMONIAL_NAMES.has(item.name.trim()))
}

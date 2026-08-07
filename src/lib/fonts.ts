import { Geist } from "next/font/google"

/**
 * Geist — Vercel's typeface, chosen for a premium, modern SaaS/dev-tool feel.
 * One variable family for both heading and body (weight does the differentiating),
 * the same pattern top-tier SaaS products (Linear, Vercel) use.
 */
export const headingFont = Geist({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
})

export const bodyFont = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
})

import { Geist } from "next/font/google"

/**
 * Geist — the single typeface used across the whole site (headings, body, forms,
 * CMS content, etc.). Loaded once as a variable font; weight does the differentiating.
 * Exposed as `--font-geist` and consumed by the font tokens in globals.css.
 */
export const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
})

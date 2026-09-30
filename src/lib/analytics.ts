import { siteConfig } from "@/constants/site-config"

/**
 * Third-party tracking carried over from the WordPress site (same accounts and ids).
 * Each id can be overridden per environment; set NEXT_PUBLIC_ANALYTICS to "on" to force
 * tracking on (e.g. to verify a preview) or "off" to disable it everywhere.
 */
export const analyticsConfig = {
  googleAdsId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "AW-828608021",
  /** GA4 measurement id — WordPress still used Universal Analytics (retired by Google), so none by default. */
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID || "",
  clarityId: process.env.NEXT_PUBLIC_CLARITY_ID || "r8jorr5igt",
  tidioKey: process.env.NEXT_PUBLIC_TIDIO_KEY || "o2obplaekvmzdvqn1m9yeirzgnt5nhxs",
  mode: process.env.NEXT_PUBLIC_ANALYTICS,
} as const

/** Google Ads conversion actions fired by the WordPress thank-you pages. */
const conversionLabels = {
  lead: process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL || "rcvlCPGX0YADEJWcjosD",
  affiliate: process.env.NEXT_PUBLIC_GOOGLE_ADS_AFFILIATE_LABEL || "cm61CKDk84MDEJWcjosD",
} as const

export type ConversionKind = keyof typeof conversionLabels

/**
 * Tracking runs on the live domain only, so previews and local builds don't pollute the
 * ad/heatmap data, unless NEXT_PUBLIC_ANALYTICS overrides it. Client-side only.
 */
export function isAnalyticsEnabled(): boolean {
  if (analyticsConfig.mode === "off") return false
  if (analyticsConfig.mode === "on") return true
  const liveHost = new URL(siteConfig.url).hostname
  return window.location.hostname === liveHost || window.location.hostname === `www.${liveHost}`
}

type Gtag = (...args: unknown[]) => void

/**
 * Reports a Google Ads conversion. A no-op when tracking is off. gtag loads after hydration,
 * so a conversion fired on page load (thank-you page) waits briefly for it.
 */
export function trackConversion(kind: ConversionKind) {
  if (typeof window === "undefined" || !analyticsConfig.googleAdsId || !isAnalyticsEnabled()) return
  const sendTo = `${analyticsConfig.googleAdsId}/${conversionLabels[kind]}`
  let attempts = 0
  const send = () => {
    const gtag = (window as Window & { gtag?: Gtag }).gtag
    if (gtag) gtag("event", "conversion", { send_to: sendTo })
    else if (++attempts < 40) window.setTimeout(send, 250)
  }
  send()
}

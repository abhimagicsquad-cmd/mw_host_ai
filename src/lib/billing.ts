/**
 * Live billing system (WHMCS) — every purchase, domain search and customer login goes here,
 * exactly as on the current WordPress site. Product ids, billing cycles and promo codes are
 * the ones the WordPress pages link to today (verified against the live WHMCS store).
 *
 * NEXT_PUBLIC_BILLING_URL overrides the base (e.g. if WHMCS moves to a billing subdomain).
 * When the main domain moves to Vercel, /clients/* must keep reaching WHMCS — see
 * `billingRewrites` in next.config.ts and docs/13-launch-readiness.md.
 */
export const BILLING_BASE_URL = (process.env.NEXT_PUBLIC_BILLING_URL || "https://www.magicworkshost.com/clients").replace(/\/$/, "")

export const billingUrls = {
  clientArea: `${BILLING_BASE_URL}/clientarea.php`,
  register: `${BILLING_BASE_URL}/register.php`,
  cart: `${BILLING_BASE_URL}/cart.php?a=view`,
  submitTicket: `${BILLING_BASE_URL}/submitticket.php`,
  affiliates: `${BILLING_BASE_URL}/affiliates.php`,
  domainTransfer: `${BILLING_BASE_URL}/cart.php?a=add&domain=transfer`,
} as const

type BillingCycle = "monthly" | "quarterly" | "semiannually" | "annually" | "biennially" | "triennially"
type Product = { pid: number; cycle?: BillingCycle; promo?: string }

// Shared hosting prices on the site are the 3-year monthly equivalent, so their buttons add
// the triennial cycle with the triennial promo — identical to the WordPress "3 Years" buttons.
const SHARED = (pid: number): Product => ({ pid, cycle: "triennially", promo: "MWHTRIEANNUALSSD" })
const SERVER = (pid: number, cycle?: BillingCycle): Product => ({ pid, cycle, promo: "MWH20LEGEND" })

/** Plan slug (Sanity / CMS / built-in plans) → WHMCS product. */
export const BILLING_PRODUCTS: Record<string, Product> = {
  // Shared hosting — "NVMe Disk Mumbai" group
  starter: SHARED(153),
  basic: SHARED(154),
  "basic-plus": SHARED(155),
  economy: SHARED(156),
  deluxe: SHARED(157),
  unlimited: SHARED(158),
  // USA shared hosting — "Linux USA Shared Server" group, as on the WordPress USA page
  "usa-starter": { pid: 128, cycle: "annually", promo: "MWHANNUALUSA" },
  "usa-basic": { pid: 129, cycle: "annually", promo: "MWHANNUALUSA" },
  "usa-basic-plus": { pid: 130, cycle: "annually", promo: "MWHANNUALUSA" },
  "usa-economy": { pid: 131, cycle: "annually", promo: "MWHANNUALUSA" },
  "usa-deluxe": { pid: 132, cycle: "annually", promo: "MWHANNUALUSA" },
  "usa-unlimited": { pid: 133, cycle: "annually", promo: "MWHANNUALUSA" },
  // /promo/50-off — the WordPress /50-off campaign products and promo
  "starter-promo": { pid: 110, cycle: "annually", promo: "MWHANNUAL" },
  "basic-promo": { pid: 111, cycle: "annually", promo: "MWHANNUAL" },
  "basic-plus-promo": { pid: 112, cycle: "annually", promo: "MWHANNUAL" },
  "economy-promo": { pid: 113, cycle: "annually", promo: "MWHANNUAL" },
  "deluxe-promo": { pid: 114, cycle: "annually", promo: "MWHANNUAL" },
  "unlimited-promo": { pid: 115, cycle: "annually", promo: "MWHANNUAL" },
  // VPS — India / USA (monthly, as priced)
  "vps-starter": SERVER(122, "monthly"),
  "vps-basic": SERVER(123, "monthly"),
  // "vps-silver" (India) has no WHMCS product yet — it keeps the "talk to sales" lead form.
  "vps-starter-usa": SERVER(119, "monthly"),
  "vps-basic-usa": SERVER(120, "monthly"),
  "vps-silver-usa": SERVER(121, "monthly"),
  // Dedicated servers — India / USA
  "dedicated-starter": SERVER(96),
  "dedicated-basic": SERVER(97),
  "dedicated-silver": SERVER(98),
  "dedicated-gold": SERVER(99),
  "dedicated-starter-usa": SERVER(85),
  "dedicated-basic-usa": SERVER(84),
  "dedicated-silver-usa": SERVER(86),
  "dedicated-gold-usa": SERVER(93),
  // SSL certificates
  "domain-validated": { pid: 88 },
  "domain-validated-sni": { pid: 95 },
  "business-validated": { pid: 89 },
  wildcard: { pid: 90 },
  "extended-validated": { pid: 91 },
  // Email
  "business-email": { pid: 34 },
  "enterprise-email": { pid: 80 },
}

export function cartAddUrl(product: Product): string {
  const params = new URLSearchParams({ a: "add", pid: String(product.pid) })
  if (product.promo) params.set("promocode", product.promo)
  if (product.cycle) {
    params.set("billingcycle", product.cycle)
    params.set("skipconfig", "1")
  }
  return `${BILLING_BASE_URL}/cart.php?${params.toString()}`
}

/** WHMCS checkout URL for a plan slug, or null if the plan isn't sold online. */
export function planCheckoutUrl(slug: string): string | null {
  const product = BILLING_PRODUCTS[slug]
  return product ? cartAddUrl(product) : null
}

/** WHMCS domain availability check + registration for `query` (e.g. "mybrand.com" or "mybrand"). */
export function domainRegisterUrl(query?: string): string {
  const params = new URLSearchParams({ a: "add", domain: "register" })
  if (query?.trim()) params.set("query", query.trim().toLowerCase())
  return `${BILLING_BASE_URL}/cart.php?${params.toString()}`
}

/** Hostname of the billing system, for CSP `form-action`/`connect-src`. */
export const BILLING_ORIGIN = new URL(BILLING_BASE_URL).origin

/**
 * Old content (Sanity / CMS) links the client area at clients.magicworkshost.com, a host that
 * doesn't exist. Map it onto the real WHMCS location wherever such a link is rendered.
 */
export function normalizeBillingHref(href: string): string {
  return href.replace(/^https?:\/\/clients\.magicworkshost\.com(\/clients)?/i, BILLING_BASE_URL)
}

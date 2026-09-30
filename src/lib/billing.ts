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

/** One billing-period choice on a plan card — the WordPress "1 Year @ Rs. 2124/- (Save 15%)" options. */
export type BillingOption = { cycle: BillingCycle; label: string; total: string; save?: string; promo?: string }

type Product = {
  pid: number
  /** The period the plan's headline price is quoted for, and the card's default choice. */
  cycle?: BillingCycle
  promo?: string
  options?: BillingOption[]
}

// Shared hosting prices on the site are the 3-year monthly equivalent, so their buttons default
// to the triennial cycle with the triennial promo; the 1- and 2-year options carry their own
// promos — identical to the WordPress plan cards' period dropdown.
const SHARED = (pid: number, [oneYear, twoYears, threeYears]: [string, string, string]): Product => ({
  pid,
  cycle: "triennially",
  promo: "MWHTRIEANNUALSSD",
  options: [
    { cycle: "annually", label: "1 Year", total: oneYear, save: "15%", promo: "MWHANNUALSSD" },
    { cycle: "biennially", label: "2 Years", total: twoYears, save: "24%", promo: "MWHBIANNUALSSD" },
    { cycle: "triennially", label: "3 Years", total: threeYears, save: "30%", promo: "MWHTRIEANNUALSSD" },
  ],
})
const SERVER = (pid: number, cycle?: BillingCycle): Product => ({ pid, cycle, promo: "MWH20LEGEND" })
// VPS: priced monthly; 3/6/12-month terms use the same 20% promo, as on WordPress.
const VPS = (pid: number, [month, quarter, half, year]: [string, string, string, string]): Product => ({
  ...SERVER(pid, "monthly"),
  options: [
    { cycle: "monthly", label: "1 Month", total: month, save: "20%" },
    { cycle: "quarterly", label: "3 Months", total: quarter, save: "20%" },
    { cycle: "semiannually", label: "6 Months", total: half, save: "20%" },
    { cycle: "annually", label: "1 Year", total: year, save: "20%" },
  ],
})
// Annual-only plans: WordPress showed the yearly total on the button ("Buy Now @ ₹500 per year").
const ANNUAL = (pid: number, promo: string, total: string, save?: string): Product => ({
  pid,
  cycle: "annually",
  promo,
  options: [{ cycle: "annually", label: "1 Year", total, save }],
})

/** Plan slug (dashboard Pricing Plans / built-in plans) → WHMCS product. */
export const BILLING_PRODUCTS: Record<string, Product> = {
  // Shared hosting — "NVMe Disk Mumbai" group
  starter: SHARED(153, ["₹2,124", "₹3,798", "₹5,229"]),
  basic: SHARED(154, ["₹4,249", "₹7,598", "₹10,460"]),
  "basic-plus": SHARED(155, ["₹5,949", "₹10,638", "₹14,645"]),
  economy: SHARED(156, ["₹9,349", "₹16,718", "₹23,015"]),
  deluxe: SHARED(157, ["₹11,899", "₹21,278", "₹29,293"]),
  unlimited: SHARED(158, ["₹16,999", "₹30,398", "₹41,848"]),
  // USA shared hosting — "Linux USA Shared Server" group, as on the WordPress USA page
  "usa-starter": ANNUAL(128, "MWHANNUALUSA", "₹500"),
  "usa-basic": ANNUAL(129, "MWHANNUALUSA", "₹650"),
  "usa-basic-plus": ANNUAL(130, "MWHANNUALUSA", "₹800"),
  "usa-economy": ANNUAL(131, "MWHANNUALUSA", "₹999"),
  "usa-deluxe": ANNUAL(132, "MWHANNUALUSA", "₹1,250"),
  "usa-unlimited": ANNUAL(133, "MWHANNUALUSA", "₹1,999"),
  // /promo/50-off — the WordPress /50-off campaign products and promo
  "starter-promo": ANNUAL(110, "MWHANNUAL", "₹750", "50%"),
  "basic-promo": ANNUAL(111, "MWHANNUAL", "₹1,194", "50%"),
  "basic-plus-promo": ANNUAL(112, "MWHANNUAL", "₹1,494", "50%"),
  "economy-promo": ANNUAL(113, "MWHANNUAL", "₹2,694", "50%"),
  "deluxe-promo": ANNUAL(114, "MWHANNUAL", "₹3,594", "50%"),
  "unlimited-promo": ANNUAL(115, "MWHANNUAL", "₹4,194", "50%"),
  // VPS — India / USA (monthly, as priced)
  "vps-starter": VPS(122, ["₹4,372", "₹13,117", "₹26,235", "₹52,469"]),
  "vps-basic": VPS(123, ["₹5,542", "₹16,627", "₹33,255", "₹66,509"]),
  // "vps-silver" (India) has no WHMCS product yet — it keeps the "talk to sales" lead form.
  "vps-starter-usa": VPS(119, ["₹3,982", "₹11,947", "₹23,895", "₹47,789"]),
  "vps-basic-usa": VPS(120, ["₹4,996", "₹14,989", "₹29,979", "₹59,957"]),
  "vps-silver-usa": VPS(121, ["₹5,776", "₹17,329", "₹34,659", "₹69,317"]),
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

export function cartAddUrl(product: Pick<Product, "pid" | "cycle" | "promo">): string {
  const params = new URLSearchParams({ a: "add", pid: String(product.pid) })
  if (product.promo) params.set("promocode", product.promo)
  if (product.cycle) {
    params.set("billingcycle", product.cycle)
    params.set("skipconfig", "1")
  }
  return `${BILLING_BASE_URL}/cart.php?${params.toString()}`
}

export type PlanBillingChoice = BillingOption & { href: string; isDefault: boolean }

/**
 * The billing periods a plan can be bought for, each with its own WHMCS cart link, or null
 * when the plan has no period options. Code-owned like the cart links, so it applies to plans
 * coming from the CMS too.
 */
export function planBillingChoices(slug: string): PlanBillingChoice[] | null {
  const product = BILLING_PRODUCTS[slug]
  if (!product?.options?.length) return null
  return product.options.map((option) => ({
    ...option,
    href: cartAddUrl({ pid: product.pid, cycle: option.cycle, promo: option.promo ?? product.promo }),
    isDefault: option.cycle === product.cycle,
  }))
}

/**
 * A plan's purchase button: plans sold online go straight to their WHMCS cart (same product,
 * cycle and promo as the WordPress site); anything else keeps its CMS-defined button (e.g. the
 * "talk to sales" lead form).
 */
export function planPurchaseCta<T extends { label: string; href: string }>(plan: { slug: string; cta: T }): T | { label: string; href: string } {
  const checkout = planCheckoutUrl(plan.slug)
  if (!checkout) return plan.cta
  return { label: plan.cta.href === "#lead" || !plan.cta.label ? "Buy Now" : plan.cta.label, href: checkout }
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
 * Old content (imported into the dashboard) links the client area at clients.magicworkshost.com, a host that
 * doesn't exist. Map it onto the real WHMCS location wherever such a link is rendered.
 */
export function normalizeBillingHref(href: string): string {
  return href.replace(/^https?:\/\/clients\.magicworkshost\.com(\/clients)?/i, BILLING_BASE_URL)
}

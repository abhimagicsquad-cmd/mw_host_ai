import { emailPages } from "@/constants/email-pages-data"
import type { PricingPlan } from "@/types/content"

/** Points every plan's purchase CTA at its mock-checkout order page instead of the lead modal. */
function withOrderCta(plans: PricingPlan[]): PricingPlan[] {
  return plans.map((plan) => ({ ...plan, cta: { ...plan.cta, href: `/order/${plan.slug}` } }))
}

/**
 * The real NVMe shared-hosting tier grid (see docs/01-website-audit-report.md §5.2) —
 * reused verbatim across the homepage and every hosting-family marketing page
 * (SEO/WordPress/Linux/Unlimited/Buy-Web-Hosting), since they're all the same
 * underlying product with different marketing framing, not distinct pricing.
 *
 * `price`/`regularPrice` show the 3-year-term effective monthly rate vs. the
 * month-to-month renewal rate (matches the reference site's headline framing).
 * `billingCycles` carries the real 1/2/3-year totals for the checkout configure step.
 */
export const sharedHostingPlans: PricingPlan[] = withOrderCta([
  {
    slug: "starter",
    name: "Starter NVMe",
    price: "₹145",
    priceSuffix: "/mo",
    regularPrice: "₹194",
    discountLabel: "15% off annually",
    features: ["1GB NVMe storage", "5GB bandwidth", "10 email accounts", "Free SSL"],
    cta: { label: "Buy Now", href: "#lead" },
    service: "shared-hosting",
    billingCycles: [
      { cycle: "annually", label: "1 Year", totalPrice: "₹2,124" },
      { cycle: "biennially", label: "2 Years", totalPrice: "₹3,798" },
      { cycle: "triennially", label: "3 Years", totalPrice: "₹5,229" },
    ],
  },
  {
    slug: "basic",
    name: "Basic NVMe",
    price: "₹291",
    priceSuffix: "/mo",
    regularPrice: "₹387",
    discountLabel: "25% off annually",
    features: ["10GB NVMe storage", "10GB bandwidth", "20 email accounts", "Free SSL"],
    cta: { label: "Buy Now", href: "#lead" },
    service: "shared-hosting",
    billingCycles: [
      { cycle: "annually", label: "1 Year", totalPrice: "₹4,249" },
      { cycle: "biennially", label: "2 Years", totalPrice: "₹7,598" },
      { cycle: "triennially", label: "3 Years", totalPrice: "₹10,460" },
    ],
  },
  {
    slug: "basic-plus",
    name: "Basic Plus NVMe",
    price: "₹407",
    priceSuffix: "/mo",
    regularPrice: "₹542",
    discountLabel: "24% off annually",
    features: ["50GB NVMe storage", "20GB bandwidth", "30 email accounts", "Free SSL"],
    cta: { label: "Buy Now", href: "#lead" },
    service: "shared-hosting",
    featured: true,
    billingCycles: [
      { cycle: "annually", label: "1 Year", totalPrice: "₹5,949" },
      { cycle: "biennially", label: "2 Years", totalPrice: "₹10,638" },
      { cycle: "triennially", label: "3 Years", totalPrice: "₹14,645" },
    ],
  },
  {
    slug: "economy",
    name: "Economy NVMe",
    price: "₹639",
    priceSuffix: "/mo",
    regularPrice: "₹852",
    discountLabel: "25% off annually",
    features: ["100GB NVMe storage", "30GB bandwidth", "100 email accounts", "Free SSL"],
    cta: { label: "Buy Now", href: "#lead" },
    service: "shared-hosting",
    billingCycles: [
      { cycle: "annually", label: "1 Year", totalPrice: "₹9,349" },
      { cycle: "biennially", label: "2 Years", totalPrice: "₹16,718" },
      { cycle: "triennially", label: "3 Years", totalPrice: "₹23,015" },
    ],
  },
  {
    slug: "deluxe",
    name: "Deluxe NVMe",
    price: "₹814",
    priceSuffix: "/mo",
    regularPrice: "₹1,085",
    discountLabel: "30% off annually",
    features: ["150GB NVMe storage", "50GB bandwidth", "100 email accounts", "Free SSL"],
    cta: { label: "Buy Now", href: "#lead" },
    service: "shared-hosting",
    billingCycles: [
      { cycle: "annually", label: "1 Year", totalPrice: "₹11,899" },
      { cycle: "biennially", label: "2 Years", totalPrice: "₹21,278" },
      { cycle: "triennially", label: "3 Years", totalPrice: "₹29,293" },
    ],
  },
  {
    slug: "unlimited",
    name: "Unlimited NVMe",
    price: "₹1,162",
    priceSuffix: "/mo",
    regularPrice: "₹1,550",
    discountLabel: "25% off annually",
    features: ["200GB NVMe storage", "200GB bandwidth", "Unlimited email", "Free SSL"],
    cta: { label: "Buy Now", href: "#lead" },
    service: "shared-hosting",
    billingCycles: [
      { cycle: "annually", label: "1 Year", totalPrice: "₹16,999" },
      { cycle: "biennially", label: "2 Years", totalPrice: "₹30,398" },
      { cycle: "triennially", label: "3 Years", totalPrice: "₹41,848" },
    ],
  },
])

/** VPS tiers — India data-center pricing (see audit §5.2, VPS/Dedicated pages). */
export const vpsPlans: PricingPlan[] = withOrderCta([
  {
    slug: "vps-starter",
    name: "VPS Starter",
    price: "₹4,372",
    priceSuffix: "/mo",
    features: ["2 vCPU", "4GB RAM", "80GB NVMe storage", "Full root access"],
    cta: { label: "Buy Now", href: "#lead" },
    service: "vps-hosting",
    region: "india",
  },
  {
    slug: "vps-basic",
    name: "VPS Basic",
    price: "₹5,512",
    priceSuffix: "/mo",
    features: ["4 vCPU", "8GB RAM", "160GB NVMe storage", "Full root access"],
    cta: { label: "Buy Now", href: "#lead" },
    service: "vps-hosting",
    featured: true,
    region: "india",
  },
  {
    slug: "vps-silver",
    name: "VPS Silver",
    price: "₹6,712",
    priceSuffix: "/mo",
    features: ["6 vCPU", "16GB RAM", "240GB NVMe storage", "Full root access"],
    cta: { label: "Buy Now", href: "#lead" },
    service: "vps-hosting",
    region: "india",
  },
])

/**
 * VPS tiers — USA data-center pricing. Starter/Silver figures come directly from the
 * reference-site audit (₹3,982 / ₹5,776); Basic is interpolated from the same
 * India→USA discount trend (~9%→14%) since the audit only captured the tier range.
 * Estimated pending confirmation — editable in Sanity once real WHMCS figures are available.
 */
export const vpsPlansUSA: PricingPlan[] = withOrderCta([
  {
    slug: "vps-starter-usa",
    name: "VPS Starter",
    price: "₹3,982",
    priceSuffix: "/mo",
    features: ["2 vCPU", "4GB RAM", "80GB NVMe storage", "Full root access"],
    cta: { label: "Buy Now", href: "#lead" },
    service: "vps-hosting",
    region: "usa",
  },
  {
    slug: "vps-basic-usa",
    name: "VPS Basic",
    price: "₹4,880",
    priceSuffix: "/mo",
    features: ["4 vCPU", "8GB RAM", "160GB NVMe storage", "Full root access"],
    cta: { label: "Buy Now", href: "#lead" },
    service: "vps-hosting",
    featured: true,
    region: "usa",
  },
  {
    slug: "vps-silver-usa",
    name: "VPS Silver",
    price: "₹5,776",
    priceSuffix: "/mo",
    features: ["6 vCPU", "16GB RAM", "240GB NVMe storage", "Full root access"],
    cta: { label: "Buy Now", href: "#lead" },
    service: "vps-hosting",
    region: "usa",
  },
])

/** SSL certificate tiers (see audit §5.4 — the hub page's real, differentiated pricing). */
export const sslPlans: PricingPlan[] = withOrderCta([
  {
    slug: "domain-validated",
    name: "Domain Validated",
    price: "₹4,000",
    priceSuffix: "/yr",
    features: ["Domain ownership validation", "Issued within minutes", "256-bit encryption", "Browser padlock"],
    cta: { label: "Get started", href: "#lead" },
    service: "ssl",
  },
  {
    slug: "business-validated",
    name: "Business Validated",
    price: "₹9,000",
    priceSuffix: "/yr",
    features: ["Organization identity validated", "Higher customer trust signal", "256-bit encryption", "1-3 day issuance"],
    cta: { label: "Get started", href: "#lead" },
    service: "ssl",
    featured: true,
  },
  {
    slug: "wildcard",
    name: "Wildcard",
    price: "₹16,000",
    priceSuffix: "/yr",
    features: ["Secures unlimited subdomains", "Domain validation", "256-bit encryption", "One certificate to manage"],
    cta: { label: "Get started", href: "#lead" },
    service: "ssl",
  },
  {
    slug: "extended-validated",
    name: "Extended Validated",
    price: "₹25,000",
    priceSuffix: "/yr",
    features: ["Highest identity assurance", "Full legal entity verification", "256-bit encryption", "Best for financial/e-commerce sites"],
    cta: { label: "Get started", href: "#lead" },
    service: "ssl",
  },
])

/** Dedicated server tiers, shared across dedicated-hosting and managed-dedicated-server pages (see audit §5.2). */
export const dedicatedPlans: PricingPlan[] = withOrderCta([
  {
    slug: "dedicated-starter",
    name: "Dedicated Starter",
    price: "₹13,769",
    priceSuffix: "/mo",
    features: ["4 cores / 8 threads", "16GB RAM", "1TB storage", "5 dedicated IPs"],
    cta: { label: "Buy Now", href: "#lead" },
    service: "dedicated-server",
    region: "india",
  },
  {
    slug: "dedicated-basic",
    name: "Dedicated Basic",
    price: "₹18,469",
    priceSuffix: "/mo",
    features: ["8 cores / 16 threads", "32GB RAM", "2TB storage", "5 dedicated IPs"],
    cta: { label: "Buy Now", href: "#lead" },
    service: "dedicated-server",
    featured: true,
    region: "india",
  },
  {
    slug: "dedicated-silver",
    name: "Dedicated Silver",
    price: "₹21,969",
    priceSuffix: "/mo",
    features: ["12 cores / 24 threads", "64GB RAM", "4TB storage", "5 dedicated IPs"],
    cta: { label: "Buy Now", href: "#lead" },
    service: "dedicated-server",
    region: "india",
  },
  {
    slug: "dedicated-gold",
    name: "Dedicated Gold",
    price: "₹25,469",
    priceSuffix: "/mo",
    features: ["16 cores / 32 threads", "128GB RAM", "8TB storage", "5 dedicated IPs"],
    cta: { label: "Buy Now", href: "#lead" },
    service: "dedicated-server",
    region: "india",
  },
])

/**
 * Dedicated server tiers — USA data-center pricing. Starter/Gold figures come directly
 * from the reference-site audit (₹12,989 / ₹21,569); Basic/Silver are interpolated from
 * the same India→USA discount trend (~6%→15%) since the audit only captured the tier
 * range. Estimated pending confirmation — editable in Sanity once real WHMCS figures land.
 */
export const dedicatedPlansUSA: PricingPlan[] = withOrderCta([
  {
    slug: "dedicated-starter-usa",
    name: "Dedicated Starter",
    price: "₹12,989",
    priceSuffix: "/mo",
    features: ["4 cores / 8 threads", "16GB RAM", "1TB storage", "5 dedicated IPs"],
    cta: { label: "Buy Now", href: "#lead" },
    service: "dedicated-server",
    region: "usa",
  },
  {
    slug: "dedicated-basic-usa",
    name: "Dedicated Basic",
    price: "₹16,830",
    priceSuffix: "/mo",
    features: ["8 cores / 16 threads", "32GB RAM", "2TB storage", "5 dedicated IPs"],
    cta: { label: "Buy Now", href: "#lead" },
    service: "dedicated-server",
    featured: true,
    region: "usa",
  },
  {
    slug: "dedicated-silver-usa",
    name: "Dedicated Silver",
    price: "₹19,310",
    priceSuffix: "/mo",
    features: ["12 cores / 24 threads", "64GB RAM", "4TB storage", "5 dedicated IPs"],
    cta: { label: "Buy Now", href: "#lead" },
    service: "dedicated-server",
    region: "usa",
  },
  {
    slug: "dedicated-gold-usa",
    name: "Dedicated Gold",
    price: "₹21,569",
    priceSuffix: "/mo",
    features: ["16 cores / 32 threads", "128GB RAM", "8TB storage", "5 dedicated IPs"],
    cta: { label: "Buy Now", href: "#lead" },
    service: "dedicated-server",
    region: "usa",
  },
])

/**
 * "50-off" promo variant of the shared-hosting grid (see audit §5.2 — same grid at a
 * flatter "50-70% off" framing; reference anchors: Starter ₹62/mo, Unlimited ₹349/mo).
 * Discount ratio interpolates linearly per tier between those two anchors, so every
 * tier's promo price is derived, not independently guessed.
 */
export const promoSharedHostingPlans: PricingPlan[] = withOrderCta(
  sharedHostingPlans.map((plan, index, all) => {
    const startRatio = 0.4276
    const endRatio = 0.3
    const ratio = startRatio + (endRatio - startRatio) * (index / (all.length - 1))
    const originalPrice = Number(plan.price.replace(/[^\d.]/g, ""))
    const promoPrice = Math.round(originalPrice * ratio)
    const discountPct = Math.round((1 - ratio) * 100)

    return {
      ...plan,
      slug: `${plan.slug}-promo`,
      price: `₹${promoPrice.toLocaleString("en-IN")}`,
      regularPrice: plan.price,
      discountLabel: `${discountPct}% off`,
      billingCycles: undefined,
    }
  })
)

/** Every plan array, flattened once for slug-based lookup (the mock checkout flow, order confirmations, etc). */
export const allPricingPlans: PricingPlan[] = [
  ...sharedHostingPlans,
  ...promoSharedHostingPlans,
  ...vpsPlans,
  ...vpsPlansUSA,
  ...sslPlans,
  ...dedicatedPlans,
  ...dedicatedPlansUSA,
  ...emailPages.map((page) => page.plan),
]

export function getPricingPlanBySlug(slug: string): PricingPlan | undefined {
  return allPricingPlans.find((plan) => plan.slug === slug)
}

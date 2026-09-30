import { emailPages } from "@/constants/email-pages-data"
import { planCheckoutUrl } from "@/lib/billing"
import type { PricingPlan } from "@/types/content"

/** Points every plan's purchase CTA at its live WHMCS cart (lead form for plans not sold online). */
function withOrderCta(plans: PricingPlan[]): PricingPlan[] {
  return plans.map((plan) => ({ ...plan, cta: { ...plan.cta, href: planCheckoutUrl(plan.slug) ?? plan.cta.href } }))
}

const usaFeatures = (site: string, space: string, bandwidth: string, email: string) => [
  site,
  `${space} storage`,
  `${bandwidth} bandwidth`,
  email,
  "cPanel with unlimited subdomains",
  "Unlimited FTP",
  "SpamAssassin email protection",
  "Free SSL",
  "Free site backup",
]

/** NVMe shared plan card features — the WordPress plan cards' spec list, in the same order. */
const sharedFeatures = (sites: string, space: string, bandwidth: string, email: string, ftp: string) => [
  `${sites} with ${space}`,
  `${bandwidth}`,
  "4GB RAM & 2 vCPU",
  "Free SSL",
  "cPanel with unlimited subdomains",
  email,
  `Free JetBackup & ${ftp}`,
]

/** USA-hosted shared plans — same products, promo and prices as the WordPress USA hosting page. */
export const usaSharedHostingPlans: PricingPlan[] = withOrderCta([
  { slug: "usa-starter", name: "USA Starter", price: "₹42", priceSuffix: "/mo", regularPrice: "₹84", discountLabel: "Billed annually", features: usaFeatures("1 website", "1GB", "10GB", "5 email accounts"), cta: { label: "Buy Now", href: "#lead" }, service: "shared-hosting", region: "usa" },
  { slug: "usa-basic", name: "USA Basic", price: "₹55", priceSuffix: "/mo", regularPrice: "₹109", discountLabel: "Billed annually", features: usaFeatures("1 website", "2GB", "20GB", "10 email accounts"), cta: { label: "Buy Now", href: "#lead" }, service: "shared-hosting", region: "usa" },
  { slug: "usa-basic-plus", name: "USA Basic Plus", price: "₹67", priceSuffix: "/mo", regularPrice: "₹134", discountLabel: "Billed annually", features: usaFeatures("1 website", "5GB", "50GB", "15 email accounts"), cta: { label: "Buy Now", href: "#lead" }, service: "shared-hosting", region: "usa", featured: true },
  { slug: "usa-economy", name: "USA Economy", price: "₹84", priceSuffix: "/mo", regularPrice: "₹167", discountLabel: "Billed annually", features: usaFeatures("1 website", "10GB", "100GB", "Unlimited email accounts"), cta: { label: "Buy Now", href: "#lead" }, service: "shared-hosting", region: "usa" },
  { slug: "usa-deluxe", name: "USA Deluxe", price: "₹104", priceSuffix: "/mo", regularPrice: "₹208", discountLabel: "Billed annually", features: usaFeatures("1 website", "20GB", "200GB", "Unlimited email accounts"), cta: { label: "Buy Now", href: "#lead" }, service: "shared-hosting", region: "usa" },
  { slug: "usa-unlimited", name: "USA Unlimited", price: "₹167", priceSuffix: "/mo", regularPrice: "₹333", discountLabel: "Billed annually", features: usaFeatures("1 website", "Unlimited", "Unlimited", "Unlimited email accounts"), cta: { label: "Buy Now", href: "#lead" }, service: "shared-hosting", region: "usa" },
])

/**
 * The real NVMe shared-hosting tier grid (see docs/01-website-audit-report.md §5.2) —
 * reused verbatim across the homepage and every hosting-family marketing page
 * (SEO/WordPress/Linux/Unlimited/Buy-Web-Hosting), since they're all the same
 * underlying product with different marketing framing, not distinct pricing.
 *
 * `price`/`regularPrice` show the 3-year-term effective monthly rate vs. the
 * month-to-month renewal rate (matches the reference site's headline framing).
 * `billingCycles` carries the real 1/2/3-year totals for the checkout configure step; the
 * plan cards' period picker and cart links come from src/lib/billing.ts.
 */
export const sharedHostingPlans: PricingPlan[] = withOrderCta([
  {
    slug: "starter",
    name: "Starter NVMe",
    price: "₹145",
    priceSuffix: "/mo",
    regularPrice: "₹194",
    features: sharedFeatures("1 Website", "1GB NVMe webspace", "5GB bandwidth", "10 email accounts", "1 FTP"),
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
    features: sharedFeatures("1 Website", "10GB NVMe webspace", "10GB bandwidth", "20 email accounts", "1 FTP"),
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
    features: sharedFeatures("1 Website", "50GB NVMe webspace", "20GB bandwidth", "30 email accounts", "1 FTP"),
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
    features: sharedFeatures("5 Websites", "100GB NVMe webspace", "30GB bandwidth", "100 email accounts", "1 FTP"),
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
    features: sharedFeatures("10 Websites", "150GB NVMe webspace", "50GB bandwidth", "100 email accounts", "10 FTP"),
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
    features: sharedFeatures("Unlimited Websites", "200GB NVMe webspace", "200GB bandwidth", "Unlimited email accounts", "Unlimited FTP"),
    cta: { label: "Buy Now", href: "#lead" },
    service: "shared-hosting",
    billingCycles: [
      { cycle: "annually", label: "1 Year", totalPrice: "₹16,999" },
      { cycle: "biennially", label: "2 Years", totalPrice: "₹30,398" },
      { cycle: "triennially", label: "3 Years", totalPrice: "₹41,848" },
    ],
  },
])

/** VPS plan card features — the WordPress VPS cards' spec list. */
const vpsFeatures = (cpu: string, ram: string, disk: string, bandwidth: string) => [
  `${cpu} CPU, ${ram} RAM`,
  `${disk} SSD space`,
  `${bandwidth} bandwidth`,
  "cPanel/WHM included",
  "CentOS 7",
  "Managed support",
  "Delivery within 24 hours",
]

/** VPS tiers — India data center, same prices and specs as the WordPress VPS page. */
export const vpsPlans: PricingPlan[] = withOrderCta([
  {
    slug: "vps-starter",
    name: "VPS Starter",
    price: "₹4,372",
    priceSuffix: "/mo",
    regularPrice: "₹5,465",
    features: vpsFeatures("1 Core", "2GB", "40GB", "1TB"),
    cta: { label: "Buy Now", href: "#lead" },
    service: "vps-hosting",
    region: "india",
  },
  {
    slug: "vps-basic",
    name: "VPS Basic",
    price: "₹5,542",
    priceSuffix: "/mo",
    regularPrice: "₹6,928",
    features: vpsFeatures("2 Core", "4GB", "60GB", "1TB"),
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
    regularPrice: "₹8,390",
    features: vpsFeatures("3 Core", "6GB", "80GB", "2TB"),
    cta: { label: "Buy Now", href: "#lead" },
    service: "vps-hosting",
    region: "india",
  },
])

/** VPS tiers — USA data center, same prices and specs as the WordPress VPS page. */
export const vpsPlansUSA: PricingPlan[] = withOrderCta([
  {
    slug: "vps-starter-usa",
    name: "VPS Starter",
    price: "₹3,982",
    priceSuffix: "/mo",
    regularPrice: "₹4,978",
    features: vpsFeatures("1 Core", "2GB", "40GB", "3TB"),
    cta: { label: "Buy Now", href: "#lead" },
    service: "vps-hosting",
    region: "usa",
  },
  {
    slug: "vps-basic-usa",
    name: "VPS Basic",
    price: "₹4,996",
    priceSuffix: "/mo",
    regularPrice: "₹6,245",
    features: vpsFeatures("2 Core", "4GB", "60GB", "3TB"),
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
    regularPrice: "₹7,220",
    features: vpsFeatures("3 Core", "6GB", "80GB", "5TB"),
    cta: { label: "Buy Now", href: "#lead" },
    service: "vps-hosting",
    region: "usa",
  },
])

/** Dedicated IP add-on the WordPress certificate pages list (not needed with the SNI certificate). */
const SSL_DEDICATED_IP = "Dedicated IP add-on: ₹460/mo"

/** SSL certificate tiers (see audit §5.4 — the hub page's real, differentiated pricing). */
export const sslPlans: PricingPlan[] = withOrderCta([
  {
    slug: "domain-validated",
    name: "Domain Validated",
    price: "₹4,000",
    priceSuffix: "/yr",
    features: ["Domain ownership validation", "Covers yourdomain.com and www", "Issued within minutes", "256-bit encryption", "Browser padlock", SSL_DEDICATED_IP],
    cta: { label: "Get started", href: "#lead" },
    service: "ssl",
  },
  {
    slug: "domain-validated-sni",
    name: "Domain Validated (SNI)",
    price: "₹4,000",
    priceSuffix: "/yr",
    features: ["Domain ownership validation", "Covers yourdomain.com and www", "Installed with SNI — no dedicated IP needed", "Runs on your website's current IP", "256-bit encryption"],
    cta: { label: "Get started", href: "#lead" },
    service: "ssl",
  },
  {
    slug: "business-validated",
    name: "Business Validated",
    price: "₹9,000",
    priceSuffix: "/yr",
    features: ["Organization identity validated", "Higher customer trust signal", "256-bit encryption", "1-3 day issuance", SSL_DEDICATED_IP],
    cta: { label: "Get started", href: "#lead" },
    service: "ssl",
    featured: true,
  },
  {
    slug: "wildcard",
    name: "Wildcard",
    price: "₹16,000",
    priceSuffix: "/yr",
    features: ["Secures unlimited subdomains", "Use across multiple servers", "Domain validation", "256-bit encryption", "One certificate to manage", SSL_DEDICATED_IP],
    cta: { label: "Get started", href: "#lead" },
    service: "ssl",
  },
  {
    slug: "extended-validated",
    name: "Extended Validated",
    price: "₹25,000",
    priceSuffix: "/yr",
    features: ["Highest identity assurance", "Full legal entity verification", "Strict validation, highest phishing protection", "$250,000 warranty", "256-bit encryption", SSL_DEDICATED_IP],
    cta: { label: "Get started", href: "#lead" },
    service: "ssl",
  },
])

/** Dedicated server card features — the WordPress dedicated cards' spec list. */
const dedicatedFeatures = (cpu: string, bandwidth: string, location: string) => [
  cpu,
  "16GB RAM, 1TB HDD",
  `${bandwidth} bandwidth`,
  "4 dedicated IP addresses",
  "cPanel/WHM included",
  "CentOS Linux 64-bit",
  "SSL included",
  "Managed support",
  `Server location: ${location}`,
  "Delivery within 24 hours",
]

/** Dedicated server tiers (India), shared across the dedicated-hosting pages — as on WordPress. */
export const dedicatedPlans: PricingPlan[] = withOrderCta([
  {
    slug: "dedicated-starter",
    name: "Dedicated Starter",
    price: "₹13,769",
    priceSuffix: "/mo",
    regularPrice: "₹17,212",
    discountLabel: "Discount 20%",
    features: dedicatedFeatures("Single Xeon 4-Core E3-1230 v5 3.4GHz w/HT", "2TB", "India"),
    cta: { label: "Buy Now", href: "#lead" },
    service: "dedicated-server",
    region: "india",
  },
  {
    slug: "dedicated-basic",
    name: "Dedicated Basic",
    price: "₹15,329",
    priceSuffix: "/mo",
    regularPrice: "₹19,162",
    discountLabel: "Discount 20%",
    features: dedicatedFeatures("Single Xeon 4-Core E3-1270 v5 3.6GHz w/HT", "2TB", "India"),
    cta: { label: "Buy Now", href: "#lead" },
    service: "dedicated-server",
    featured: true,
    region: "india",
  },
  {
    slug: "dedicated-silver",
    name: "Dedicated Silver",
    price: "₹20,009",
    priceSuffix: "/mo",
    regularPrice: "₹25,012",
    discountLabel: "Discount 20%",
    features: dedicatedFeatures("Single Xeon 6-Core E-2136 3.30GHz w/HT", "2TB", "India"),
    cta: { label: "Buy Now", href: "#lead" },
    service: "dedicated-server",
    region: "india",
  },
  {
    slug: "dedicated-gold",
    name: "Dedicated Gold",
    price: "₹25,469",
    priceSuffix: "/mo",
    regularPrice: "₹31,837",
    discountLabel: "Discount 20%",
    features: dedicatedFeatures("2 x 6-Core Xeon E5-2620 V3 2.4GHz w/HT", "2TB", "India"),
    cta: { label: "Buy Now", href: "#lead" },
    service: "dedicated-server",
    region: "india",
  },
])

/** Dedicated server tiers — USA data center, as on WordPress. */
export const dedicatedPlansUSA: PricingPlan[] = withOrderCta([
  {
    slug: "dedicated-starter-usa",
    name: "Dedicated Starter",
    price: "₹12,989",
    priceSuffix: "/mo",
    regularPrice: "₹16,237",
    discountLabel: "Discount 20%",
    features: dedicatedFeatures("Single Xeon 4-Core E3-1230 v5 3.4GHz w/HT", "10TB", "USA"),
    cta: { label: "Buy Now", href: "#lead" },
    service: "dedicated-server",
    region: "usa",
  },
  {
    slug: "dedicated-basic-usa",
    name: "Dedicated Basic",
    price: "₹15,329",
    priceSuffix: "/mo",
    regularPrice: "₹19,162",
    discountLabel: "Discount 20%",
    features: dedicatedFeatures("Single Xeon 4-Core E3-1270 v5 3.6GHz w/HT", "10TB", "USA"),
    cta: { label: "Buy Now", href: "#lead" },
    service: "dedicated-server",
    featured: true,
    region: "usa",
  },
  {
    slug: "dedicated-silver-usa",
    name: "Dedicated Silver",
    price: "₹17,669",
    priceSuffix: "/mo",
    regularPrice: "₹25,012",
    discountLabel: "Discount 20%",
    features: dedicatedFeatures("Single Xeon 6-Core E-2136 3.30GHz w/HT", "10TB", "USA"),
    cta: { label: "Buy Now", href: "#lead" },
    service: "dedicated-server",
    region: "usa",
  },
  {
    slug: "dedicated-gold-usa",
    name: "Dedicated Gold",
    price: "₹21,569",
    priceSuffix: "/mo",
    regularPrice: "₹31,837",
    discountLabel: "Discount 20%",
    features: dedicatedFeatures("2 x 6-Core Xeon E5-2620 V3 2.4GHz w/HT", "10TB", "USA"),
    cta: { label: "Buy Now", href: "#lead" },
    service: "dedicated-server",
    region: "usa",
  },
])

const promoCommonFeatures = ["Free SSL (Comodo)", "cPanel with unlimited subdomains", "SpamAssassin email protection", "Free site backup", "512MB RAM & 1/2 core"]

/**
 * /promo/50-off — the WordPress /50-off campaign's own plans (WHMCS pids 110–115, billed annually
 * at 50% off; see src/lib/billing.ts). Not the NVMe grid.
 */
export const promoSharedHostingPlans: PricingPlan[] = withOrderCta([
  {
    slug: "starter-promo",
    name: "Starter",
    price: "₹62",
    priceSuffix: "/mo",
    regularPrice: "₹125",
    features: ["1 Website", "1GB webspace", "5GB bandwidth", "10 email accounts", "3 FTP", ...promoCommonFeatures],
    cta: { label: "Buy Now", href: "#lead" },
    service: "shared-hosting",
  },
  {
    slug: "basic-promo",
    name: "Basic",
    price: "₹99",
    priceSuffix: "/mo",
    regularPrice: "₹199",
    features: ["1 Website", "10GB webspace", "10GB bandwidth", "20 email accounts", "5 FTP", ...promoCommonFeatures],
    cta: { label: "Buy Now", href: "#lead" },
    service: "shared-hosting",
  },
  {
    slug: "basic-plus-promo",
    name: "Basic Plus",
    price: "₹124",
    priceSuffix: "/mo",
    regularPrice: "₹249",
    features: ["1 Website", "50GB webspace", "10GB bandwidth", "30 email accounts", "5 FTP", ...promoCommonFeatures],
    cta: { label: "Buy Now", href: "#lead" },
    service: "shared-hosting",
    featured: true,
  },
  {
    slug: "economy-promo",
    name: "Economy",
    price: "₹224",
    priceSuffix: "/mo",
    regularPrice: "₹449",
    features: ["5 Websites", "100GB webspace", "20GB bandwidth", "100 email accounts", "20 FTP", "Free .in domain + 5 parked domains", ...promoCommonFeatures],
    cta: { label: "Buy Now", href: "#lead" },
    service: "shared-hosting",
  },
  {
    slug: "deluxe-promo",
    name: "Deluxe",
    price: "₹299",
    priceSuffix: "/mo",
    regularPrice: "₹599",
    features: ["Unlimited Websites", "150GB webspace", "50GB bandwidth", "Unlimited email accounts", "Unlimited FTP", "Free .in domain + 5 parked domains", ...promoCommonFeatures],
    cta: { label: "Buy Now", href: "#lead" },
    service: "shared-hosting",
  },
  {
    slug: "unlimited-promo",
    name: "Unlimited",
    price: "₹349",
    priceSuffix: "/mo",
    regularPrice: "₹699",
    features: ["Unlimited Websites", "Unlimited webspace*", "Unlimited bandwidth*", "Unlimited email accounts", "Unlimited FTP", "Free .in domain + unlimited parked domains", ...promoCommonFeatures],
    cta: { label: "Buy Now", href: "#lead" },
    service: "shared-hosting",
  },
])

/** Every plan array, flattened once for slug-based lookup (the mock checkout flow, order confirmations, etc). */
export const allPricingPlans: PricingPlan[] = [
  ...sharedHostingPlans,
  ...promoSharedHostingPlans,
  ...usaSharedHostingPlans,
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

import type { PricingPlan } from "@/types/content"

/**
 * The real NVMe shared-hosting tier grid (see docs/01-website-audit-report.md §5.2) —
 * reused verbatim across the homepage and every hosting-family marketing page
 * (SEO/WordPress/Linux/Unlimited/Buy-Web-Hosting), since they're all the same
 * underlying product with different marketing framing, not distinct pricing.
 */
export const sharedHostingPlans: PricingPlan[] = [
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
  },
]

/** VPS tiers — India pricing (see audit §5.2, VPS/Dedicated pages). */
export const vpsPlans: PricingPlan[] = [
  {
    slug: "vps-starter",
    name: "VPS Starter",
    price: "₹4,372",
    priceSuffix: "/mo",
    features: ["2 vCPU", "4GB RAM", "80GB NVMe storage", "Full root access"],
    cta: { label: "Buy Now", href: "#lead" },
    service: "vps-hosting",
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
  },
  {
    slug: "vps-silver",
    name: "VPS Silver",
    price: "₹6,712",
    priceSuffix: "/mo",
    features: ["6 vCPU", "16GB RAM", "240GB NVMe storage", "Full root access"],
    cta: { label: "Buy Now", href: "#lead" },
    service: "vps-hosting",
  },
]

/** SSL certificate tiers (see audit §5.4 — the hub page's real, differentiated pricing). */
export const sslPlans: PricingPlan[] = [
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
]

/** Dedicated server tiers, shared across dedicated-hosting and managed-dedicated-server pages (see audit §5.2). */
export const dedicatedPlans: PricingPlan[] = [
  {
    slug: "dedicated-starter",
    name: "Dedicated Starter",
    price: "₹13,769",
    priceSuffix: "/mo",
    features: ["4 cores / 8 threads", "16GB RAM", "1TB storage", "5 dedicated IPs"],
    cta: { label: "Buy Now", href: "#lead" },
    service: "dedicated-server",
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
  },
  {
    slug: "dedicated-silver",
    name: "Dedicated Silver",
    price: "₹21,969",
    priceSuffix: "/mo",
    features: ["12 cores / 24 threads", "64GB RAM", "4TB storage", "5 dedicated IPs"],
    cta: { label: "Buy Now", href: "#lead" },
    service: "dedicated-server",
  },
  {
    slug: "dedicated-gold",
    name: "Dedicated Gold",
    price: "₹25,469",
    priceSuffix: "/mo",
    features: ["16 cores / 32 threads", "128GB RAM", "8TB storage", "5 dedicated IPs"],
    cta: { label: "Buy Now", href: "#lead" },
    service: "dedicated-server",
  },
]

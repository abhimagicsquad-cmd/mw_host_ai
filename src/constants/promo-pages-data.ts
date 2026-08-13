import type { FAQItem } from "@/types/content"

export type PromoPageData = {
  slug: string
  eyebrow: string
  title: string
  description: string
  bullets: string[]
  /** ISO 8601 timestamp the countdown targets — edit this to extend/restart the promo. */
  endsAt: string
  faqs: FAQItem[]
}

export const promoPages: PromoPageData[] = [
  {
    slug: "50-off",
    eyebrow: "Limited-time offer",
    title: "50-70% off NVMe shared hosting",
    description:
      "The same NVMe-backed shared hosting grid you'll find across the site — at a steeper introductory discount for a limited time.",
    bullets: [
      "Same NVMe storage, bandwidth, and email limits as the standard grid",
      "Free SSL, cPanel, and JetBackup on every tier",
      "Discount applied automatically at checkout — no promo code needed",
      "Price locks in for your full billing term",
    ],
    endsAt: "2026-09-30T23:59:59+05:30",
    faqs: [
      { question: "Do I need a promo code?", answer: "No — the discounted price shown here is already applied. Just choose a plan and check out." },
      { question: "What happens when the offer ends?", answer: "Any order placed before the countdown ends keeps this price for the billing term you select at checkout." },
      { question: "Is this the same hosting as the regular plans?", answer: "Yes — identical NVMe storage, bandwidth, and features as the standard shared hosting grid, just at a promotional price." },
      { question: "Can I switch plans later?", answer: "Yes, you can upgrade to a higher tier at any time; the promotional price applies only to the term you purchase now." },
    ],
  },
]

export function getPromoPage(slug: string) {
  return promoPages.find((page) => page.slug === slug)
}

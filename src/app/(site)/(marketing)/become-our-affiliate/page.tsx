import { BadgePercent, Link2, TrendingDown, Wallet } from "lucide-react"

import { LEAD_CTA_HREF } from "@/components/common/cta-or-lead-button"
import { CTASection } from "@/components/sections/cta-section"
import { FAQSection } from "@/components/sections/faq-section"
import { HeroSection } from "@/components/sections/hero-section"
import { StatsSection } from "@/components/sections/stats-section"
import { WhyChooseUs } from "@/components/sections/why-choose-us"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Become Our Affiliate",
  description: "Earn 20% recurring commission referring businesses to MagicWorks Host — 90-day cookie, low minimum withdrawal, no cap.",
  path: "/become-our-affiliate",
})

export default function BecomeOurAffiliatePage() {
  return (
    <>
      <HeroSection
        eyebrow="Affiliate Program"
        title="Earn recurring commission for every referral that stays"
        description="Refer businesses to MagicWorks Host and earn 20% recurring commission for as long as they stay a customer — not just a one-time payout."
        bullets={[
          "20% recurring commission, every billing cycle",
          "90-day referral cookie window",
          "₹2,000 minimum withdrawal",
          "No cap on how much you can earn",
        ]}
        primaryCta={{ label: "Join the program", href: LEAD_CTA_HREF }}
        secondaryCta={{ label: "Ask a question", href: LEAD_CTA_HREF }}
      />

      <StatsSection
        eyebrow="Why our program works"
        title="Built for partners who want recurring income, not one-off payouts"
        stats={[
          { label: "Recurring commission", value: "20%", icon: BadgePercent },
          { label: "Cookie window", value: "90 days", icon: Link2 },
          { label: "Customer churn", value: "<7%", icon: TrendingDown },
          { label: "Min. withdrawal", value: "₹2,000", icon: Wallet },
        ]}
      />

      <WhyChooseUs
        eyebrow="How it works"
        title="Three steps to your first payout"
        background="alt"
        reasons={[
          { title: "1. Join the program", description: "Share your details and get your unique referral link within a day." },
          { title: "2. Share your link", description: "Refer businesses via your site, social channels, or direct outreach." },
          { title: "3. Get paid monthly", description: "Earn 20% recurring commission on every active referral, paid out once you hit ₹2,000." },
        ]}
      />

      <FAQSection
        eyebrow="FAQs"
        title="Affiliate program questions, answered"
        items={[
          { question: "How much can I earn per referral?", answer: "20% of the referred customer's recurring billing, for as long as they remain a customer — not a one-time flat fee." },
          { question: "How long does the referral cookie last?", answer: "90 days — if someone signs up within 90 days of clicking your link, you get credit for the referral." },
          { question: "When do I get paid?", answer: "Monthly, once your unpaid commission balance reaches the ₹2,000 minimum withdrawal threshold." },
          { question: "Is there a limit to how many people I can refer?", answer: "No cap — your earning potential scales with how many referrals you bring in." },
        ]}
      />

      <CTASection
        title="Ready to start earning?"
        description="Share your details and we'll get your affiliate account set up."
        primaryCta={{ label: "Join now", href: LEAD_CTA_HREF }}
        background="navy"
      />
    </>
  )
}

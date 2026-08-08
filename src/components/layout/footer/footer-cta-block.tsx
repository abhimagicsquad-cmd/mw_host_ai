import { Phone } from "lucide-react"

import { LeadCTAButton } from "@/components/common/lead-cta-button"
import { siteConfig } from "@/constants/site-config"

type FooterCTABlockProps = {
  title?: string
  description?: string
  ctaLabel?: string
}

export function FooterCTABlock({
  title = "Talk to a hosting expert",
  description = "Get a free consultation on the right plan for your website — no commitment required.",
  ctaLabel = "Get in touch",
}: FooterCTABlockProps) {
  return (
    <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-brand-navy-dark px-6 py-8 text-center sm:flex-row sm:text-left">
      <div>
        <p className="font-heading text-xl font-bold text-white">{title}</p>
        <p className="mt-1 text-sm text-white/70">{description}</p>
      </div>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <a href={siteConfig.contact.phoneHref} className="flex items-center gap-2 text-sm font-medium text-white">
          <Phone className="size-4 text-brand-orange" />
          {siteConfig.contact.phone}
        </a>
        <LeadCTAButton source="footer">{ctaLabel}</LeadCTAButton>
      </div>
    </div>
  )
}

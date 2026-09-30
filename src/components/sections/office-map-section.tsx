import { MapPin } from "lucide-react"

import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/layout/section-heading"
import { siteConfig } from "@/constants/site-config"

/** The Google Maps embed of the Pune office from the WordPress contact page (same place listing). */
const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.4234051068365!2d73.7793733143686!3d18.509759074336948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2be4512d98ebf%3A0xfa8b4ec07d166501!2sMagicWorksHost!5e0!3m2!1sen!2sin!4v1546057977726"
const DIRECTIONS_URL = "https://www.google.com/maps/search/?api=1&query=MagicWorksHost%20Bavdhan%20Pune"

export function OfficeMapSection({ address = siteConfig.contact.address }: { address?: string }) {
  return (
    <SectionContainer width="wide">
      <SectionHeading eyebrow="Visit us" title="Our corporate office" description={address} />
      <div className="mt-10 overflow-hidden rounded-2xl border border-border-alt bg-surface-alt">
        <iframe
          src={MAP_EMBED_URL}
          title={`Map: ${siteConfig.legalName}, ${address}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block h-[320px] w-full border-0 sm:h-[450px]"
        />
      </div>
      <p className="mt-4 text-center">
        <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange hover:underline">
          <MapPin className="size-4" aria-hidden />
          Get directions
        </a>
      </p>
    </SectionContainer>
  )
}

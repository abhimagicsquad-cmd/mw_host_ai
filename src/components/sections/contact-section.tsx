import type { ReactNode } from "react"
import { Clock, Mail, MapPin, Phone } from "lucide-react"

import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/layout/section-heading"
import { siteConfig } from "@/constants/site-config"

type ContactSectionProps = {
  eyebrow?: string
  title: string
  description?: string
  background?: "none" | "alt"
  children: ReactNode
}

export function ContactSection({
  eyebrow = "Contact Us",
  title,
  description,
  background = "none",
  children,
}: ContactSectionProps) {
  const { contact } = siteConfig

  return (
    <SectionContainer background={background} width="wide">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="flex flex-col gap-6 rounded-2xl border border-border-alt bg-background p-6">
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 size-5 shrink-0 text-brand-orange-accessible" />
            <div>
              <p className="text-sm font-semibold text-brand-navy">Phone</p>
              <a href={contact.phoneHref} className="text-sm text-body-text hover:text-brand-orange-accessible">
                {contact.phone}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 size-5 shrink-0 text-brand-orange-accessible" />
            <div>
              <p className="text-sm font-semibold text-brand-navy">Email</p>
              <a href={`mailto:${contact.email}`} className="text-sm text-body-text hover:text-brand-orange-accessible">
                {contact.email}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-brand-orange-accessible" />
            <div>
              <p className="text-sm font-semibold text-brand-navy">Address</p>
              <p className="text-sm text-body-text">{contact.address}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 size-5 shrink-0 text-brand-orange-accessible" />
            <div>
              <p className="text-sm font-semibold text-brand-navy">Hours</p>
              <p className="text-sm text-body-text">Sales: {contact.hours.sales}</p>
              <p className="text-sm text-body-text">Accounting: {contact.hours.accounting}</p>
              <p className="text-sm text-body-text">Support: {contact.hours.support}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border-alt bg-background p-6">{children}</div>
      </div>
    </SectionContainer>
  )
}

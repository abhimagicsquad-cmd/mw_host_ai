import type { ReactNode } from "react"

import { IconBadge } from "@/components/common/icon-badge"
import { Reveal } from "@/components/common/reveal"
import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/layout/section-heading"
import type { Feature } from "@/types/content"

type WhyChooseUsProps = {
  eyebrow?: string
  title: string
  description?: string
  reasons: Feature[]
  background?: "none" | "alt"
  cta?: ReactNode
}

export function WhyChooseUs({ eyebrow, title, description, reasons, background = "alt", cta }: WhyChooseUsProps) {
  return (
    <SectionContainer background={background} width="wide">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {reasons.map((reason, index) => (
          <Reveal key={reason.title} delay={(index % 3) * 0.08}>
            <div className="group h-full rounded-2xl border border-border-alt bg-background p-6 transition-all hover:-translate-y-1 hover:border-brand-orange/30 hover:shadow-lg">
              {reason.icon ? (
                <IconBadge icon={reason.icon} tone="navy" className="transition-colors group-hover:bg-brand-orange/10 group-hover:text-brand-orange" />
              ) : null}
              <p className="mt-4 font-heading text-base font-semibold text-brand-navy">{reason.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-body-text">{reason.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
      {cta ? <div className="mt-12 flex justify-center">{cta}</div> : null}
    </SectionContainer>
  )
}

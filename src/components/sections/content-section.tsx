import type { ReactNode } from "react"

import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/layout/section-heading"

type ContentSectionProps = {
  eyebrow?: string
  title?: string
  description?: string
  align?: "left" | "center"
  background?: "none" | "alt"
  children: ReactNode
}

export function ContentSection({
  eyebrow,
  title,
  description,
  align = "left",
  background = "none",
  children,
}: ContentSectionProps) {
  return (
    <SectionContainer background={background} width="narrow">
      {title ? (
        <SectionHeading eyebrow={eyebrow} title={title} description={description} align={align} className="mb-8" />
      ) : null}
      <div className="flex flex-col gap-4 text-base leading-relaxed text-body-text [&_a]:text-brand-orange [&_a]:underline [&_a]:underline-offset-2 [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-brand-navy [&_li]:ml-4 [&_li]:list-disc [&_strong]:text-brand-navy">
        {children}
      </div>
    </SectionContainer>
  )
}

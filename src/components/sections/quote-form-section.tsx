import type { ReactNode } from "react"

import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/layout/section-heading"
import { QuoteVisual } from "@/components/sections/quote-visual"

type QuoteFormSectionProps = {
  eyebrow?: string
  title: string
  description?: string
  background?: "none" | "alt"
  /** The quote form itself. */
  children: ReactNode
}

/** Two-column quote section: heading + form card on the left, hosting illustration on the right (stacks below lg). */
export function QuoteFormSection({ eyebrow, title, description, background = "alt", children }: QuoteFormSectionProps) {
  return (
    <SectionContainer width="wide" background={background}>
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] lg:gap-16">
        <div>
          <SectionHeading align="left" eyebrow={eyebrow} title={title} description={description} />
          <div className="mt-8 rounded-2xl border border-border-alt bg-background p-5 shadow-sm sm:p-8">{children}</div>
        </div>
        <QuoteVisual />
      </div>
    </SectionContainer>
  )
}

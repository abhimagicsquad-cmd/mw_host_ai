import { IconBadge } from "@/components/common/icon-badge"
import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/layout/section-heading"
import type { Feature } from "@/types/content"

type WhyChooseUsProps = {
  eyebrow?: string
  title: string
  description?: string
  reasons: Feature[]
  background?: "none" | "alt"
}

export function WhyChooseUs({ eyebrow, title, description, reasons, background = "alt" }: WhyChooseUsProps) {
  return (
    <SectionContainer background={background} width="wide">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <div className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {reasons.map((reason) => (
          <div key={reason.title} className="flex items-start gap-4">
            {reason.icon ? <IconBadge icon={reason.icon} tone="navy" size="sm" /> : null}
            <div>
              <p className="font-heading text-sm font-semibold text-brand-navy">{reason.title}</p>
              <p className="mt-1 text-sm text-body-text">{reason.description}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionContainer>
  )
}

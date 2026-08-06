import { IconBadge } from "@/components/common/icon-badge"
import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/layout/section-heading"
import { cn } from "@/lib/utils"
import type { Feature } from "@/types/content"

type FeaturesSectionProps = {
  eyebrow?: string
  title: string
  description?: string
  features: Feature[]
  columns?: 2 | 3 | 4
  background?: "none" | "alt"
}

const columnClasses = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
} as const

export function FeaturesSection({
  eyebrow,
  title,
  description,
  features,
  columns = 3,
  background = "none",
}: FeaturesSectionProps) {
  return (
    <SectionContainer background={background} width="wide">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <div className={cn("mt-10 grid gap-6", columnClasses[columns])}>
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex flex-col gap-3 rounded-2xl border border-border-alt bg-background p-6"
          >
            {feature.icon ? <IconBadge icon={feature.icon} /> : null}
            <p className="font-heading text-base font-semibold text-brand-navy">{feature.title}</p>
            <p className="text-sm text-body-text">{feature.description}</p>
          </div>
        ))}
      </div>
    </SectionContainer>
  )
}

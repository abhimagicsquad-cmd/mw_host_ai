import { IconBadge } from "@/components/common/icon-badge"
import { Reveal } from "@/components/common/reveal"
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
      <div className={cn("mt-12 grid gap-5", columnClasses[columns])}>
        {features.map((feature, index) => (
          <Reveal key={feature.title} delay={(index % 4) * 0.07}>
            <div className="group flex h-full flex-col gap-3 rounded-2xl border border-border-alt bg-background p-6 transition-all hover:-translate-y-1 hover:border-brand-orange/30 hover:shadow-lg">
              {feature.icon ? (
                <IconBadge icon={feature.icon} className="transition-colors group-hover:bg-brand-orange/10 group-hover:text-brand-orange-accessible" />
              ) : null}
              <p className="font-heading text-base font-semibold text-brand-navy">{feature.title}</p>
              <p className="text-sm leading-relaxed text-body-text">{feature.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </SectionContainer>
  )
}

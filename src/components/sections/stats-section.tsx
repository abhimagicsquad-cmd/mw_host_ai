import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/layout/section-heading"
import type { Stat } from "@/types/content"

type StatsSectionProps = {
  eyebrow?: string
  title?: string
  description?: string
  stats: Stat[]
  background?: "none" | "alt" | "navy"
}

export function StatsSection({ eyebrow, title, description, stats, background = "navy" }: StatsSectionProps) {
  const isDark = background === "navy"

  return (
    <SectionContainer background={background} width="wide">
      {title ? (
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          className={isDark ? "[&_h2]:text-white [&_p]:text-white/70" : undefined}
        />
      ) : null}
      <div className={title ? "mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4" : "grid gap-8 sm:grid-cols-2 lg:grid-cols-4"}>
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-2 text-center">
            {stat.icon ? <stat.icon className={isDark ? "size-6 text-brand-orange" : "size-6 text-brand-orange"} /> : null}
            <p className={isDark ? "font-heading text-3xl font-bold text-white" : "font-heading text-3xl font-bold text-brand-navy"}>
              {stat.value}
            </p>
            <p className={isDark ? "text-sm text-white/70" : "text-sm text-muted-foreground"}>{stat.label}</p>
          </div>
        ))}
      </div>
    </SectionContainer>
  )
}

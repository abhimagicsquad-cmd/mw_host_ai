import { Reveal } from "@/components/common/reveal"
import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/layout/section-heading"
import { cn } from "@/lib/utils"
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
    <SectionContainer background={background} width="wide" className={isDark ? "relative overflow-hidden" : undefined}>
      {isDark ? (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-brand-orange/5" />
      ) : null}
      <div className="relative">
        {title ? (
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            description={description}
            className={isDark ? "[&_h2]:text-white [&_p]:text-white/70" : undefined}
          />
        ) : null}
        <div className={cn(title ? "mt-12" : "", "grid gap-5 sm:grid-cols-2 lg:grid-cols-4")}>
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.08}>
              <div
                className={
                  isDark
                    ? "flex h-full flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm transition-colors hover:bg-white/10"
                    : "flex h-full flex-col items-center gap-3 rounded-2xl border border-border-alt bg-background p-6 text-center shadow-sm transition-shadow hover:shadow-md"
                }
              >
                {stat.icon ? (
                  <span className="flex size-11 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                    <stat.icon className="size-5" />
                  </span>
                ) : null}
                <p className={isDark ? "text-3xl font-bold text-white" : "text-3xl font-bold text-brand-navy"}>
                  {stat.value}
                </p>
                <p className={isDark ? "text-sm text-white/70" : "text-sm text-muted-foreground"}>{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionContainer>
  )
}

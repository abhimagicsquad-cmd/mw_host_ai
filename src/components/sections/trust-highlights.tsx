import type { LucideIcon } from "lucide-react"

import { Reveal } from "@/components/common/reveal"
import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/layout/section-heading"
import { cn } from "@/lib/utils"

export type TrustHighlight = {
  title: string
  description: string
  icon: LucideIcon
}

type TrustHighlightsProps = {
  eyebrow?: string
  title: string
  description?: string
  highlights: TrustHighlight[]
  background?: "none" | "alt" | "navy"
}

/**
 * Reusable credibility block — uptime/security/support/migration/backup style
 * promises, each backed by a concrete claim rather than a vague adjective.
 * Data-driven so future landing pages can reuse it with a different highlight set.
 */
export function TrustHighlights({ eyebrow, title, description, highlights, background = "none" }: TrustHighlightsProps) {
  const isDark = background === "navy"

  return (
    <SectionContainer background={background} width="wide">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
        className={isDark ? "[&_h2]:text-white [&_p]:text-white/70" : undefined}
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.map((highlight, index) => (
          <Reveal key={highlight.title} delay={(index % 3) * 0.08}>
            <div
              className={cn(
                "flex h-full flex-col gap-3 rounded-2xl border p-6",
                isDark
                  ? "border-white/10 bg-white/5 backdrop-blur-sm"
                  : "border-border-alt bg-background shadow-sm"
              )}
            >
              <span
                className={cn(
                  "flex size-11 items-center justify-center rounded-xl",
                  isDark ? "bg-brand-orange/15 text-brand-orange" : "bg-brand-orange/10 text-brand-orange"
                )}
              >
                <highlight.icon className="size-5" />
              </span>
              <p className={cn("font-heading text-base font-semibold", isDark ? "text-white" : "text-brand-navy")}>
                {highlight.title}
              </p>
              <p className={cn("text-sm leading-relaxed", isDark ? "text-white/70" : "text-body-text")}>
                {highlight.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </SectionContainer>
  )
}

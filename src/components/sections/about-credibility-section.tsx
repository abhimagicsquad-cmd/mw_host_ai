import type { ReactNode } from "react"
import { Check } from "lucide-react"

import { CTAButton } from "@/components/common/cta-button"
import { Eyebrow } from "@/components/common/eyebrow"
import { Reveal } from "@/components/common/reveal"
import { SectionContainer } from "@/components/layout/section-container"
import type { CTA, Stat } from "@/types/content"

type AboutCredibilitySectionProps = {
  eyebrow?: string
  title: ReactNode
  description?: string
  bullets?: string[]
  cta?: CTA
  highlights: Stat[]
  background?: "none" | "alt"
}

export function AboutCredibilitySection({
  eyebrow,
  title,
  description,
  bullets,
  cta,
  highlights,
  background = "none",
}: AboutCredibilitySectionProps) {
  return (
    <SectionContainer background={background} width="wide">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal className="flex flex-col gap-5">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h2 className="font-heading text-3xl font-bold text-brand-navy">{title}</h2>
          {description ? <p className="text-body-text leading-relaxed">{description}</p> : null}
          {bullets?.length ? (
            <ul className="flex flex-col gap-2.5">
              {bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2 text-sm text-brand-navy">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand-orange" />
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}
          {cta ? (
            <div className="pt-2">
              <CTAButton href={cta.href} external={cta.external}>
                {cta.label}
              </CTAButton>
            </div>
          ) : null}
        </Reveal>

        <Reveal delay={0.1} className="relative">
          <div className="relative overflow-hidden rounded-3xl border border-border-alt bg-gradient-to-br from-brand-navy to-brand-navy-dark p-8">
            <div className="bg-dot-pattern pointer-events-none absolute inset-0 opacity-[0.08]" />
            <p className="relative font-heading text-sm font-semibold tracking-wide text-white/60 uppercase">
              Since 2012
            </p>
            <p className="relative mt-2 max-w-xs text-lg font-medium text-white/90">
              A decade of hosting infrastructure built for reliability, not just uptime charts.
            </p>
            <div className="relative mt-8 grid grid-cols-2 gap-4">
              {highlights.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="font-heading text-2xl font-bold text-white">{stat.value}</p>
                  <p className="mt-1 text-xs text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </SectionContainer>
  )
}

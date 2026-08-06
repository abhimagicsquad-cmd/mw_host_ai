import type { ReactNode } from "react"
import { Check } from "lucide-react"

import { CTAButton } from "@/components/common/cta-button"
import { SectionContainer } from "@/components/layout/section-container"
import type { CTA, Stat } from "@/types/content"

type HeroSectionProps = {
  eyebrow?: string
  title: ReactNode
  description?: string
  bullets?: string[]
  primaryCta?: CTA
  secondaryCta?: CTA
  stats?: Stat[]
  media?: ReactNode
}

export function HeroSection({
  eyebrow,
  title,
  description,
  bullets,
  primaryCta,
  secondaryCta,
  stats,
  media,
}: HeroSectionProps) {
  return (
    <SectionContainer background="alt" width="wide" className="overflow-hidden">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          {eyebrow ? (
            <span className="text-sm font-semibold tracking-wide text-brand-orange uppercase">{eyebrow}</span>
          ) : null}
          <h1 className="font-heading text-4xl font-bold text-brand-navy sm:text-5xl">{title}</h1>
          {description ? <p className="max-w-xl text-lg text-body-text">{description}</p> : null}

          {bullets?.length ? (
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2 text-sm text-brand-navy">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand-orange" />
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}

          {primaryCta || secondaryCta ? (
            <div className="flex flex-wrap gap-4 pt-2">
              {primaryCta ? (
                <CTAButton href={primaryCta.href} external={primaryCta.external} size="lg">
                  {primaryCta.label}
                </CTAButton>
              ) : null}
              {secondaryCta ? (
                <CTAButton href={secondaryCta.href} external={secondaryCta.external} variant="outline" size="lg">
                  {secondaryCta.label}
                </CTAButton>
              ) : null}
            </div>
          ) : null}

          {stats?.length ? (
            <dl className="mt-4 grid grid-cols-3 gap-4 border-t border-border-alt pt-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-2xl font-bold text-brand-navy">{stat.value}</dt>
                  <dd className="text-xs text-muted-foreground">{stat.label}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        <div className="relative flex items-center justify-center">
          {media ?? <div className="aspect-square w-full max-w-md rounded-3xl bg-brand-navy/5" />}
        </div>
      </div>
    </SectionContainer>
  )
}

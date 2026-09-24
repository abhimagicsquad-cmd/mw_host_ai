import type { ReactNode } from "react"
import { Check } from "lucide-react"

import { CTAOrLeadButton } from "@/components/common/cta-or-lead-button"
import { Eyebrow } from "@/components/common/eyebrow"
import { BreadcrumbJsonLd } from "@/components/common/json-ld"
import { SectionContainer } from "@/components/layout/section-container"
import { Breadcrumbs } from "@/components/sections/breadcrumbs"
import type { BreadcrumbItem, CTA, Stat } from "@/types/content"

type HeroSectionProps = {
  eyebrow?: string
  title: ReactNode
  description?: string
  bullets?: string[]
  primaryCta?: CTA
  secondaryCta?: CTA
  stats?: Stat[]
  media?: ReactNode
  breadcrumbs?: BreadcrumbItem[]
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
  breadcrumbs,
}: HeroSectionProps) {
  return (
    <SectionContainer width="wide" padded={false} className="relative overflow-hidden bg-background pt-14 pb-16 sm:pt-20 sm:pb-24">
      <div className="bg-dot-pattern pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
      <div className="pointer-events-none absolute -top-24 -left-32 size-96 rounded-full bg-brand-orange/15 blur-3xl" />
      <div className="pointer-events-none absolute top-10 -right-24 size-96 rounded-full bg-brand-cta-secondary/15 blur-3xl" />

      {breadcrumbs?.length ? <BreadcrumbJsonLd items={breadcrumbs} /> : null}

      <div className="relative grid items-center gap-16 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <div>
            {breadcrumbs?.length ? (
              <div className="mb-4">
                <Breadcrumbs items={breadcrumbs} />
              </div>
            ) : null}
            {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
            <h1 className="mt-5 text-4xl font-bold text-brand-navy sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]">
              {title}
            </h1>
            {description ? <p className="mt-5 max-w-xl text-lg leading-relaxed text-body-text">{description}</p> : null}
          </div>

          {bullets?.length ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5 text-sm font-medium text-brand-navy">
                  <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-brand-orange">
                    <Check className="size-3" />
                  </span>
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}

          {primaryCta || secondaryCta ? (
            <div className="flex flex-wrap gap-4 pt-2">
              {primaryCta ? (
                <CTAOrLeadButton
                  cta={primaryCta}
                  source="hero:primary"
                  size="lg"
                  className="shadow-lg shadow-brand-orange/25"
                />
              ) : null}
              {secondaryCta ? (
                <CTAOrLeadButton cta={secondaryCta} source="hero:secondary" variant="outline" size="lg" />
              ) : null}
            </div>
          ) : null}

          {stats?.length ? (
            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 border-t border-border-alt pt-6">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-brand-navy">{stat.value}</span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative flex items-center justify-center">
          {media ?? <div className="aspect-square w-full max-w-md rounded-3xl bg-brand-navy/5" />}
        </div>
      </div>
    </SectionContainer>
  )
}

import type { ReactNode } from "react"

import { Breadcrumbs } from "@/components/sections/breadcrumbs"
import { CTAButton } from "@/components/common/cta-button"
import { SectionContainer } from "@/components/layout/section-container"
import type { BreadcrumbItem, CTA } from "@/types/content"

type PageHeroProps = {
  title: ReactNode
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  cta?: CTA
  background?: "navy" | "alt"
}

export function PageHero({ title, description, breadcrumbs, cta, background = "navy" }: PageHeroProps) {
  const isDark = background === "navy"

  return (
    <SectionContainer background={background} width="wide" padded={false} className="py-14 sm:py-20">
      <div className="flex flex-col gap-4">
        {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} tone={isDark ? "light" : "dark"} /> : null}
        <h1
          className={
            isDark
              ? "font-heading text-3xl font-bold text-white sm:text-4xl"
              : "font-heading text-3xl font-bold text-brand-navy sm:text-4xl"
          }
        >
          {title}
        </h1>
        {description ? (
          <p className={isDark ? "max-w-2xl text-white/70" : "max-w-2xl text-body-text"}>{description}</p>
        ) : null}
        {cta ? (
          <div className="pt-2">
            <CTAButton href={cta.href} external={cta.external}>
              {cta.label}
            </CTAButton>
          </div>
        ) : null}
      </div>
    </SectionContainer>
  )
}

import type { ReactNode } from "react"

import { CTAOrLeadButton } from "@/components/common/cta-or-lead-button"
import { BreadcrumbJsonLd } from "@/components/common/json-ld"
import { Breadcrumbs } from "@/components/sections/breadcrumbs"
import { SectionContainer } from "@/components/layout/section-container"
import { cn } from "@/lib/utils"
import type { BreadcrumbItem, CTA } from "@/types/content"

type PageHeroProps = {
  title: ReactNode
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  cta?: CTA
  ctaSource?: string
  background?: "navy" | "alt"
}

export function PageHero({ title, description, breadcrumbs, cta, ctaSource = "page-hero", background = "navy" }: PageHeroProps) {
  const isDark = background === "navy"

  return (
    <SectionContainer
      background={background}
      width="wide"
      padded={false}
      className={cn("relative overflow-hidden py-14 sm:py-20", isDark && "text-white")}
    >
      {breadcrumbs?.length ? <BreadcrumbJsonLd items={breadcrumbs} /> : null}
      {isDark ? (
        <>
          <div className="pointer-events-none absolute -top-1/2 left-1/3 size-[32rem] -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
          <div className="bg-dot-pattern pointer-events-none absolute inset-0 opacity-15 [mask-image:radial-gradient(ellipse_60%_60%_at_30%_40%,black,transparent)]" />
        </>
      ) : null}
      <div className="relative flex flex-col gap-4">
        {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} tone={isDark ? "light" : "dark"} /> : null}
        <h1 className={isDark ? "text-3xl font-bold sm:text-4xl" : "text-3xl font-bold text-brand-navy sm:text-4xl"}>
          {title}
        </h1>
        {description ? (
          <p className={isDark ? "max-w-2xl text-white/70" : "max-w-2xl text-body-text"}>{description}</p>
        ) : null}
        {cta ? (
          <div className="pt-2">
            <CTAOrLeadButton cta={cta} source={ctaSource} />
          </div>
        ) : null}
      </div>
    </SectionContainer>
  )
}

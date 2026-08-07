import type { ReactNode } from "react"

import { CTAButton } from "@/components/common/cta-button"
import { Reveal } from "@/components/common/reveal"
import { SectionContainer } from "@/components/layout/section-container"
import { cn } from "@/lib/utils"
import type { CTA } from "@/types/content"

type CTASectionProps = {
  title: ReactNode
  description?: string
  primaryCta: CTA
  secondaryCta?: CTA
  background?: "navy" | "orange" | "alt"
}

const backgroundStyles = {
  navy: "bg-brand-navy text-white",
  orange: "bg-brand-orange text-white",
  alt: "bg-surface-alt text-brand-navy",
} as const

export function CTASection({ title, description, primaryCta, secondaryCta, background = "navy" }: CTASectionProps) {
  const isDark = background !== "alt"

  return (
    <SectionContainer padded={false} className={cn("relative overflow-hidden", backgroundStyles[background])}>
      {isDark ? (
        <>
          <div className="pointer-events-none absolute -top-1/2 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
          <div className="bg-dot-pattern pointer-events-none absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />
        </>
      ) : null}
      <Reveal className="relative flex flex-col items-center gap-6 py-16 text-center sm:py-20">
        <h2 className="font-heading text-3xl font-bold sm:text-4xl">{title}</h2>
        {description ? (
          <p className={isDark ? "max-w-2xl text-white/80" : "max-w-2xl text-body-text"}>{description}</p>
        ) : null}
        <div className="flex flex-wrap justify-center gap-4">
          <CTAButton
            href={primaryCta.href}
            external={primaryCta.external}
            size="lg"
            variant={isDark ? "outline" : "primary"}
            className={isDark ? "border-white bg-white text-brand-navy hover:bg-white/90" : undefined}
          >
            {primaryCta.label}
          </CTAButton>
          {secondaryCta ? (
            <CTAButton
              href={secondaryCta.href}
              external={secondaryCta.external}
              size="lg"
              variant="ghost"
              className={isDark ? "text-white hover:bg-white/10" : undefined}
            >
              {secondaryCta.label}
            </CTAButton>
          ) : null}
        </div>
      </Reveal>
    </SectionContainer>
  )
}

import type { ReactNode } from "react"
import Image from "next/image"
import { Check } from "lucide-react"

import { CTAButton } from "@/components/common/cta-button"
import { Eyebrow } from "@/components/common/eyebrow"
import { SectionContainer } from "@/components/layout/section-container"
import { cn } from "@/lib/utils"
import type { CTA } from "@/types/content"

type ImageContentSectionProps = {
  eyebrow?: string
  title: ReactNode
  description?: string
  bullets?: string[]
  cta?: CTA
  image: { src: string; alt: string }
  imagePosition?: "left" | "right"
  background?: "none" | "alt"
}

export function ImageContentSection({
  eyebrow,
  title,
  description,
  bullets,
  cta,
  image,
  imagePosition = "right",
  background = "none",
}: ImageContentSectionProps) {
  return (
    <SectionContainer background={background} width="wide">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className={cn("relative aspect-4/3 overflow-hidden rounded-2xl bg-brand-navy/5", imagePosition === "left" ? "lg:order-1" : "lg:order-2")}>
          <Image src={image.src} alt={image.alt} fill className="object-cover" />
        </div>
        <div className={cn("flex flex-col gap-5", imagePosition === "left" ? "lg:order-2" : "lg:order-1")}>
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h2 className="font-heading text-3xl font-bold text-brand-navy">{title}</h2>
          {description ? <p className="text-body-text">{description}</p> : null}
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
        </div>
      </div>
    </SectionContainer>
  )
}

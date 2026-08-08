import type { ReactNode } from "react"
import dynamic from "next/dynamic"

import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/layout/section-heading"
import type { Testimonial } from "@/types/content"

const TestimonialsCarousel = dynamic(() =>
  import("@/components/sections/testimonials-carousel").then((mod) => mod.TestimonialsCarousel)
)

type TestimonialsSectionProps = {
  eyebrow?: string
  title: string
  description?: string
  testimonials: Testimonial[]
  background?: "none" | "alt"
  cta?: ReactNode
}

export function TestimonialsSection({
  eyebrow = "Testimonials",
  title,
  description,
  testimonials,
  background = "none",
  cta,
}: TestimonialsSectionProps) {
  return (
    <SectionContainer background={background} width="wide">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <TestimonialsCarousel testimonials={testimonials} />
      {cta ? <div className="mt-8 flex justify-center">{cta}</div> : null}
    </SectionContainer>
  )
}

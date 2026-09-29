import type { ReactNode } from "react"
import dynamic from "next/dynamic"

import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/layout/section-heading"
import type { Testimonial } from "@/types/content"
import { withoutPlaceholderTestimonials } from "@/constants/testimonials"

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
  // Never render placeholder testimonials; hide the whole section when no real ones remain.
  const real = withoutPlaceholderTestimonials(testimonials)
  if (!real.length) return null

  return (
    <SectionContainer background={background} width="wide">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <TestimonialsCarousel testimonials={real} />
      {cta ? <div className="mt-8 flex justify-center">{cta}</div> : null}
    </SectionContainer>
  )
}

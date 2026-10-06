import type { ReactNode } from "react"

import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/layout/section-heading"
import { TestimonialsCarousel } from "@/components/sections/testimonials-carousel"
import type { Testimonial } from "@/types/content"
import { testimonials as defaultTestimonials, withoutPlaceholderTestimonials } from "@/constants/testimonials"

type TestimonialsSectionProps = {
  eyebrow?: string
  title: string
  description?: string
  testimonials: Testimonial[]
  background?: "none" | "alt"
  cta?: ReactNode
}

/** Testimonials heading + auto-sliding carousel (see <TestimonialsCarousel />). */
export function TestimonialsSection({
  eyebrow = "Testimonials",
  title,
  description,
  testimonials,
  background = "none",
  cta,
}: TestimonialsSectionProps) {
  // Never render placeholder testimonials. A section whose content only held placeholders
  // (older migrated dashboard data) shows the real customer testimonials instead.
  const provided = withoutPlaceholderTestimonials(testimonials)
  const real = provided.length ? provided : defaultTestimonials

  return (
    <SectionContainer background={background} width="wide">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <TestimonialsCarousel testimonials={real} />
      {cta ? <div className="mt-8 flex justify-center">{cta}</div> : null}
    </SectionContainer>
  )
}

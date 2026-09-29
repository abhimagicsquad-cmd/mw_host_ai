import type { ReactNode } from "react"

import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/layout/section-heading"
import { TestimonialCard } from "@/components/sections/testimonial-card"
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

/**
 * Server-rendered testimonial grid: a swipeable CSS scroll-snap row on phones, a grid from
 * tablet up. No carousel JavaScript, so it costs nothing on the main thread.
 */
export function TestimonialsSection({
  eyebrow = "Testimonials",
  title,
  description,
  testimonials,
  background = "none",
  cta,
}: TestimonialsSectionProps) {
  // Never render placeholder testimonials. A section whose content only held placeholders
  // (older Sanity / migrated CMS data) shows the real customer testimonials instead.
  const provided = withoutPlaceholderTestimonials(testimonials)
  const real = provided.length ? provided : defaultTestimonials

  return (
    <SectionContainer background={background} width="wide">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <ul
        aria-label="Customer testimonials"
        tabIndex={0}
        className="-mx-4 mt-10 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto px-4 pb-2 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4"
      >
        {real.map((testimonial) => (
          <li key={testimonial.name} className="w-[85%] shrink-0 snap-start sm:w-auto">
            <TestimonialCard testimonial={testimonial} />
          </li>
        ))}
      </ul>
      {cta ? <div className="mt-8 flex justify-center">{cta}</div> : null}
    </SectionContainer>
  )
}

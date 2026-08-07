import type { ReactNode } from "react"

import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/layout/section-heading"
import { TestimonialCard } from "@/components/sections/testimonial-card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import type { Testimonial } from "@/types/content"

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
      <Carousel className="mt-10">
        <CarouselContent>
          {testimonials.map((testimonial) => (
            <CarouselItem key={testimonial.name} className="sm:basis-1/2 lg:basis-1/3">
              <TestimonialCard testimonial={testimonial} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="mt-6 flex justify-center gap-3">
          <CarouselPrevious className="static translate-y-0" />
          <CarouselNext className="static translate-y-0" />
        </div>
      </Carousel>
      {cta ? <div className="mt-8 flex justify-center">{cta}</div> : null}
    </SectionContainer>
  )
}

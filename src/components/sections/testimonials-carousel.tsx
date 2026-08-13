"use client"

import { useMemo } from "react"
import Autoplay from "embla-carousel-autoplay"

import { TestimonialCard } from "@/components/sections/testimonial-card"
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { Testimonial } from "@/types/content"

export function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")

  // Recreated only when the user's motion preference actually changes — Embla treats a new
  // plugins array as "reinitialize", so this must stay referentially stable otherwise.
  const plugins = useMemo(
    () =>
      prefersReducedMotion
        ? []
        : [Autoplay({ delay: 5500, stopOnInteraction: false, stopOnMouseEnter: true, stopOnFocusIn: true })],
    [prefersReducedMotion]
  )

  return (
    <Carousel className="mt-10" opts={{ align: "start", loop: true }} plugins={plugins}>
      <CarouselContent>
        {testimonials.map((testimonial) => (
          <CarouselItem key={testimonial.name} className="sm:basis-1/2 lg:basis-1/3">
            <TestimonialCard testimonial={testimonial} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-8 flex items-center justify-center gap-6">
        <CarouselPrevious className="static translate-y-0" />
        <CarouselDots />
        <CarouselNext className="static translate-y-0" />
      </div>
    </Carousel>
  )
}

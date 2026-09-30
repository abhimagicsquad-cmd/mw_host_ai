"use client"

import { useMemo, useSyncExternalStore } from "react"
import Autoplay from "embla-carousel-autoplay"

import { TestimonialCard } from "@/components/sections/testimonial-card"
import { Carousel, CarouselContent, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import type { Testimonial } from "@/types/content"

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"
const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

/**
 * Testimonial slider: advances one card every 4.5s in an infinite loop (1 / 2 / 3 cards visible
 * on phone / tablet / desktop), with previous/next buttons, dots, swipe and arrow keys. Autoplay
 * pauses while the pointer is over it, it has keyboard focus or it's being dragged, then resumes;
 * it never starts for visitors who prefer reduced motion. Every card is in the server HTML.
 */
export function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia(REDUCED_MOTION).matches, () => true)
  const autoplay = useMemo(() => (reducedMotion ? null : Autoplay({ delay: 4500, stopOnInteraction: false, stopOnMouseEnter: true, stopOnFocusIn: true })), [reducedMotion])

  return (
    <Carousel opts={{ loop: true, align: "start" }} plugins={autoplay ? [autoplay] : []} aria-label="Customer testimonials" className="mt-10">
      {/* Mouse-drag swiping would otherwise highlight the quote text; touch keeps text selection. */}
      <CarouselContent className="-ml-5 [@media(pointer:fine)]:select-none">
        {testimonials.map((testimonial, index) => (
          <CarouselItem key={testimonial.name} aria-label={`${index + 1} of ${testimonials.length}`} className="pl-5 sm:basis-1/2 lg:basis-1/3">
            <TestimonialCard testimonial={testimonial} />
          </CarouselItem>
        ))}
      </CarouselContent>
      {/* A manual prev/next/dot click restarts the 4.5s countdown, so the next auto-advance never follows it immediately. */}
      <div className="mt-6 flex items-center justify-center gap-3" onClickCapture={() => autoplay?.reset()}>
        <CarouselPrevious className="static inset-auto my-0 size-9 translate-none" />
        <CarouselDots />
        <CarouselNext className="static inset-auto my-0 size-9 translate-none" />
      </div>
    </Carousel>
  )
}

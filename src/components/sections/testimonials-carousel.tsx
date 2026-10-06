"use client"

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import Autoplay from "embla-carousel-autoplay"
import { Pause, Play } from "lucide-react"

import { TestimonialCard } from "@/components/sections/testimonial-card"
import { Button } from "@/components/ui/button"
import { Carousel, type CarouselApi, CarouselContent, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
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
 * a Pause/Play button stops it for good (WCAG 2.2.2 — touch users can't hover). It never starts
 * for visitors who prefer reduced motion. Every card is in the server HTML.
 */
export function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia(REDUCED_MOTION).matches, () => true)
  const autoplay = useMemo(() => (reducedMotion ? null : Autoplay({ delay: 4500, stopOnInteraction: false, stopOnMouseEnter: true, stopOnFocusIn: true })), [reducedMotion])
  const [api, setApi] = useState<CarouselApi>()
  const [paused, setPaused] = useState(false)
  const pausedRef = useRef(false)

  // The plugin restarts itself on mouse-leave, pointer-up and focus-out; a visitor's Pause
  // must outlast those, so any restart while paused is stopped again right after it begins.
  useEffect(() => {
    if (!api || !autoplay) return
    const holdPause = () => {
      if (pausedRef.current) queueMicrotask(() => autoplay.stop())
    }
    api.on("autoplay:play", holdPause)
    return () => {
      api.off("autoplay:play", holdPause)
    }
  }, [api, autoplay])

  const togglePaused = () => {
    const next = !pausedRef.current
    pausedRef.current = next
    setPaused(next)
    if (next) autoplay?.stop()
    else autoplay?.play()
  }

  return (
    <Carousel
      opts={{ loop: true, align: "start" }}
      plugins={autoplay ? [autoplay] : []}
      setApi={setApi}
      // Silent while it rotates on its own; announces slide changes once it's still.
      announceSlides={!autoplay || paused}
      aria-label="Customer testimonials"
      className="mt-10"
    >
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
        {autoplay ? (
          <Button type="button" variant="outline" size="icon-sm" className="size-9 touch-manipulation rounded-full" onClick={togglePaused}>
            {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
            <span className="sr-only">{paused ? "Play testimonials" : "Pause testimonials"}</span>
          </Button>
        ) : null}
      </div>
    </Carousel>
  )
}

import { Quote } from "lucide-react"

import { RatingStars } from "@/components/common/rating-stars"
import type { Testimonial } from "@/types/content"

type TestimonialCardProps = {
  testimonial: Testimonial
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const initials = testimonial.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")

  return (
    <figure className="flex h-full flex-col gap-4 rounded-2xl border border-border-alt bg-background p-7 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <Quote className="size-7 text-brand-orange/30" />
        {testimonial.rating ? <RatingStars rating={testimonial.rating} /> : null}
      </div>
      <blockquote className="flex-1 text-[0.95rem] leading-relaxed text-body-text">&ldquo;{testimonial.quote}&rdquo;</blockquote>
      <figcaption className="flex items-center gap-3 border-t border-border-alt pt-4">
        {testimonial.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- 40px photo from the CMS media library or /public; next/image would add a client runtime for no gain
          <img
            src={testimonial.avatarUrl}
            alt={testimonial.name}
            width={40}
            height={40}
            loading="lazy"
            decoding="async"
            className="size-10 shrink-0 rounded-full object-cover ring-2 ring-brand-orange/15"
          />
        ) : (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-navy/10 text-sm font-semibold text-brand-navy ring-2 ring-brand-orange/15" aria-hidden="true">
            {initials}
          </span>
        )}
        <div>
          <p className="text-sm font-semibold text-brand-navy">{testimonial.name}</p>
          {testimonial.title || testimonial.company ? (
            <p className="text-xs text-muted-foreground">
              {[testimonial.title, testimonial.company].filter(Boolean).join(", ")}
            </p>
          ) : null}
        </div>
      </figcaption>
    </figure>
  )
}

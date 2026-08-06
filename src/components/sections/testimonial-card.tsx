import { Quote } from "lucide-react"

import { RatingStars } from "@/components/common/rating-stars"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
    <figure className="flex h-full flex-col gap-4 rounded-2xl border border-border-alt bg-background p-6">
      <Quote className="size-6 text-brand-orange/40" />
      {testimonial.rating ? <RatingStars rating={testimonial.rating} /> : null}
      <blockquote className="flex-1 text-sm text-body-text">&ldquo;{testimonial.quote}&rdquo;</blockquote>
      <figcaption className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={testimonial.avatarUrl} alt={testimonial.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
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

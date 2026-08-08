import { Star } from "lucide-react"

import { cn } from "@/lib/utils"

type RatingStarsProps = {
  rating?: number
  max?: number
  className?: string
}

export function RatingStars({ rating = 5, max = 5, className }: RatingStarsProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} role="img" aria-label={`Rated ${rating} out of ${max}`}>
      {Array.from({ length: max }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            "size-4",
            index < rating ? "fill-brand-orange text-brand-orange" : "fill-none text-border-alt"
          )}
        />
      ))}
    </div>
  )
}

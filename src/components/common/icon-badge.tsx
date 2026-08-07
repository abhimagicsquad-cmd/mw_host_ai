import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const sizeClasses = {
  sm: "size-9 [&_svg]:size-4",
  md: "size-12 [&_svg]:size-5",
  lg: "size-14 [&_svg]:size-6",
} as const

const toneClasses = {
  orange: "bg-brand-orange/10 text-brand-orange-accessible",
  navy: "bg-brand-navy/10 text-brand-navy dark:bg-white/10 dark:text-white",
  cyan: "bg-brand-cta-secondary/10 text-brand-cta-secondary",
} as const

type IconBadgeProps = {
  icon: LucideIcon
  size?: keyof typeof sizeClasses
  tone?: keyof typeof toneClasses
  className?: string
}

export function IconBadge({ icon: Icon, size = "md", tone = "orange", className }: IconBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl",
        sizeClasses[size],
        toneClasses[tone],
        className
      )}
    >
      <Icon />
    </span>
  )
}

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

const widthClasses = {
  default: "max-w-6xl",
  wide: "max-w-7xl",
  narrow: "max-w-3xl",
} as const

const backgroundClasses = {
  none: "",
  white: "bg-background",
  alt: "bg-surface-alt",
  navy: "bg-brand-navy text-white",
} as const

type SectionContainerProps = {
  as?: "section" | "div"
  width?: keyof typeof widthClasses
  background?: keyof typeof backgroundClasses
  padded?: boolean
  className?: string
  innerClassName?: string
  id?: string
  children: ReactNode
}

export function SectionContainer({
  as = "section",
  width = "default",
  background = "none",
  padded = true,
  className,
  innerClassName,
  id,
  children,
}: SectionContainerProps) {
  const Tag = as

  return (
    <Tag
      id={id}
      className={cn(padded && "py-12 sm:py-16 lg:py-20", backgroundClasses[background], className)}
    >
      <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", widthClasses[width], innerClassName)}>
        {children}
      </div>
    </Tag>
  )
}

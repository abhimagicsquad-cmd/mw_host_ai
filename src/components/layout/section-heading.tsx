import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type SectionHeadingProps = {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  align?: "left" | "center"
  className?: string
}

export function SectionHeading({ eyebrow, title, description, align = "center", className }: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow ? (
        <span className="text-sm font-semibold tracking-wide text-brand-orange uppercase">{eyebrow}</span>
      ) : null}
      <h2 className="font-heading text-3xl font-bold text-brand-navy sm:text-4xl dark:text-foreground">
        {title}
      </h2>
      {description ? (
        <p className={cn("text-base text-body-text sm:text-lg", align === "center" && "max-w-2xl")}>
          {description}
        </p>
      ) : null}
    </div>
  )
}

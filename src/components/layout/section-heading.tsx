import type { ReactNode } from "react"

import { Eyebrow } from "@/components/common/eyebrow"
import { Reveal } from "@/components/common/reveal"
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
    <Reveal
      className={cn(
        "flex flex-col gap-3.5",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="text-3xl font-bold text-balance text-brand-navy sm:text-4xl dark:text-foreground">
        {title}
      </h2>
      {description ? (
        <p className={cn("text-base leading-relaxed text-body-text sm:text-lg", align === "center" && "max-w-2xl")}>
          {description}
        </p>
      ) : null}
    </Reveal>
  )
}

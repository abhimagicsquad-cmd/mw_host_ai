import type { ReactNode } from "react"
import Link from "next/link"
import { cva, type VariantProps } from "class-variance-authority"
import type { LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const ctaButtonVariants = cva(
  "h-auto rounded-full font-semibold transition-all",
  {
    variants: {
      variant: {
        // bg-brand-orange-accessible (not the vivid --brand-orange) — this fill carries white
        // text, and the vivid shade only reaches 2.93:1 contrast against white (fails WCAG AA 4.5:1).
        primary: "bg-brand-orange-accessible text-white hover:bg-brand-orange-accessible-hover",
        secondary:
          "bg-gradient-to-r from-brand-cta-secondary to-brand-cta-secondary-end text-white hover:from-brand-cta-secondary-hover hover:to-brand-cta-secondary-hover-end",
        outline: "border-brand-orange bg-transparent text-brand-orange-accessible hover:bg-brand-orange/10",
        ghost: "bg-transparent text-brand-navy hover:bg-brand-navy/5 dark:text-foreground",
      },
      size: {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-2.5 text-sm",
        lg: "px-8 py-3.5 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

type CTAButtonProps = VariantProps<typeof ctaButtonVariants> & {
  href?: string
  external?: boolean
  onClick?: () => void
  type?: "button" | "submit"
  icon?: LucideIcon
  iconPosition?: "start" | "end"
  className?: string
  children: ReactNode
}

export function CTAButton({
  href,
  external,
  onClick,
  type = "button",
  icon: Icon,
  iconPosition = "end",
  variant,
  size,
  className,
  children,
}: CTAButtonProps) {
  const content = (
    <>
      {Icon && iconPosition === "start" ? <Icon /> : null}
      {children}
      {Icon && iconPosition === "end" ? <Icon /> : null}
    </>
  )

  if (href) {
    return (
      <Button
        nativeButton={false}
        render={
          <Link
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            onClick={onClick}
          />
        }
        className={cn(ctaButtonVariants({ variant, size }), className)}
      >
        {content}
      </Button>
    )
  }

  return (
    <Button
      type={type}
      onClick={onClick}
      className={cn(ctaButtonVariants({ variant, size }), className)}
    >
      {content}
    </Button>
  )
}

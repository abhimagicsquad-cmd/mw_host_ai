import type { ReactNode } from "react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type FormFieldShellProps = {
  htmlFor: string
  label?: string
  required?: boolean
  description?: string
  error?: string
  className?: string
  children: ReactNode
}

export function FormFieldShell({
  htmlFor,
  label,
  required,
  description,
  error,
  className,
  children,
}: FormFieldShellProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <Label htmlFor={htmlFor} className="sr-only">
          {label}
          {required ? <span className="text-destructive">*</span> : null}
        </Label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}

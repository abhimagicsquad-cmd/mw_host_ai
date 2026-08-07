import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type FormSubmitButtonProps = {
  isSubmitting: boolean
  children: React.ReactNode
  className?: string
}

export function FormSubmitButton({ isSubmitting, children, className }: FormSubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className={cn(
        "h-11 w-full rounded-full bg-brand-orange-accessible px-6 text-white hover:bg-brand-orange-accessible-hover disabled:opacity-70",
        className
      )}
    >
      {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
      {isSubmitting ? "Submitting…" : children}
    </Button>
  )
}

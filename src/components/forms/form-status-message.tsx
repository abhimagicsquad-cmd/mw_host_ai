import { CheckCircle2, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"

type FormStatusMessageProps = {
  status: "success" | "error"
  message: string
  className?: string
}

export function FormStatusMessage({ status, message, className }: FormStatusMessageProps) {
  const isSuccess = status === "success"

  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm",
        isSuccess
          ? "border-brand-orange/30 bg-brand-orange/10 text-brand-navy dark:text-foreground"
          : "border-destructive/30 bg-destructive/10 text-destructive",
        className
      )}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-orange-accessible" />
      ) : (
        <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
      )}
      <p>{message}</p>
    </div>
  )
}

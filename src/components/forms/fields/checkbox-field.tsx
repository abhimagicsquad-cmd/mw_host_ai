import { useId } from "react"
import type { ReactNode } from "react"
import type { Control, FieldPath, FieldValues } from "react-hook-form"
import { Controller } from "react-hook-form"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type CheckboxFieldProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>
  control: Control<TFieldValues>
  label: ReactNode
  error?: string
  className?: string
}

export function CheckboxField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  error,
  className,
}: CheckboxFieldProps<TFieldValues>) {
  const id = useId()

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-start gap-2">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Checkbox
              id={id}
              checked={Boolean(field.value)}
              onCheckedChange={(checked) => field.onChange(checked)}
              aria-invalid={Boolean(error)}
              className="mt-0.5"
            />
          )}
        />
        <Label htmlFor={id} className="font-normal text-muted-foreground">
          {label}
        </Label>
      </div>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

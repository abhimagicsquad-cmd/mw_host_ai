import type { UseFormRegisterReturn } from "react-hook-form"

import { FormFieldShell } from "@/components/forms/fields/form-field-shell"
import { Textarea } from "@/components/ui/textarea"

type TextareaFieldProps = {
  label?: string
  placeholder?: string
  required?: boolean
  description?: string
  error?: string
  rows?: number
  registration: UseFormRegisterReturn
}

export function TextareaField({
  label,
  placeholder,
  required,
  description,
  error,
  rows = 5,
  registration,
}: TextareaFieldProps) {
  return (
    <FormFieldShell
      htmlFor={registration.name}
      label={label}
      required={required}
      description={description}
      error={error}
    >
      <Textarea
        id={registration.name}
        placeholder={placeholder}
        rows={rows}
        aria-invalid={Boolean(error)}
        {...registration}
      />
    </FormFieldShell>
  )
}

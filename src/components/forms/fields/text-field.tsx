import type { UseFormRegisterReturn } from "react-hook-form"

import { FormFieldShell } from "@/components/forms/fields/form-field-shell"
import { Input } from "@/components/ui/input"

type TextFieldProps = {
  label?: string
  type?: React.ComponentProps<"input">["type"]
  placeholder?: string
  required?: boolean
  description?: string
  error?: string
  registration: UseFormRegisterReturn
}

export function TextField({
  label,
  type = "text",
  placeholder,
  required,
  description,
  error,
  registration,
}: TextFieldProps) {
  return (
    <FormFieldShell
      htmlFor={registration.name}
      label={label}
      required={required}
      description={description}
      error={error}
    >
      <Input
        id={registration.name}
        type={type}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        {...registration}
      />
    </FormFieldShell>
  )
}

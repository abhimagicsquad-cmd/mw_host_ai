import { useId } from "react"
import type { Control, FieldPath, FieldValues } from "react-hook-form"
import { Controller } from "react-hook-form"

import { FormFieldShell } from "@/components/forms/fields/form-field-shell"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SelectOption = { value: string; label: string }

type SelectFieldProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>
  control: Control<TFieldValues>
  label?: string
  placeholder?: string
  required?: boolean
  description?: string
  error?: string
  options: readonly SelectOption[]
}

export function SelectField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  placeholder = "Select an option",
  required,
  description,
  error,
  options,
}: SelectFieldProps<TFieldValues>) {
  const id = useId()

  return (
    <FormFieldShell
      htmlFor={id}
      label={label}
      required={required}
      description={description}
      error={error}
    >
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            value={field.value || null}
            onValueChange={(value) => field.onChange(value ?? "")}
          >
            <SelectTrigger id={id} className="w-full" aria-invalid={Boolean(error)}>
              <SelectValue placeholder={placeholder}>
                {(value: string) => options.find((option) => option.value === value)?.label ?? placeholder}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </FormFieldShell>
  )
}

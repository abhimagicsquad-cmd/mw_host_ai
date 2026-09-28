"use client"

import { useActionState } from "react"
import { KeyRound } from "lucide-react"

import { Input } from "@/components/ui/input"
import { changeOwnPasswordAction } from "@/lib/admin/actions/auth"

import { Field, FormMessage, SubmitButton } from "./form-controls"

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(changeOwnPasswordAction, {})
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Current password" required>
        {(id) => <Input id={id} name="currentPassword" type="password" required autoComplete="current-password" />}
      </Field>
      <Field label="New password" required help="10+ characters with upper & lower case, a number and a symbol.">
        {(id) => <Input id={id} name="newPassword" type="password" required autoComplete="new-password" minLength={10} />}
      </Field>
      <Field label="Confirm new password" required>
        {(id) => <Input id={id} name="confirmPassword" type="password" required autoComplete="new-password" minLength={10} />}
      </Field>
      <FormMessage state={state} />
      <SubmitButton className="self-start">
        <KeyRound />
        Update password
      </SubmitButton>
    </form>
  )
}

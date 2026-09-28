"use client"

import { useActionState, useState } from "react"
import { Eye, EyeOff, LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { loginAction } from "@/lib/admin/actions/auth"

import { Field, FormMessage, SubmitButton } from "./form-controls"

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(loginAction, {})
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-5">
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="Username">
        {(id) => <Input id={id} name="username" autoComplete="username" autoFocus required className="h-10" />}
      </Field>
      <Field label="Password">
        {(id) => (
          <div className="relative">
            <Input
              id={id}
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className="h-10 pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-1/2 right-1.5 -translate-y-1/2"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </Button>
          </div>
        )}
      </Field>
      <FormMessage state={state} />
      <SubmitButton size="lg" className="h-10" pendingLabel="Signing in…">
        <LogIn />
        Sign in
      </SubmitButton>
    </form>
  )
}

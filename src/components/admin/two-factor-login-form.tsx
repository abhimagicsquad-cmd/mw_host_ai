"use client"

import { useActionState, useState } from "react"
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cancelTwoFactorLoginAction, verifyLoginCodeAction } from "@/lib/admin/actions/two-factor"

import { checkboxClassName, Field, FormMessage, SubmitButton } from "./form-controls"

/** Sign-in step 2: the code from the authenticator app (or a recovery code). */
export function TwoFactorLoginForm({ username }: { username: string }) {
  const [state, formAction] = useActionState(verifyLoginCodeAction, {})
  const [recovery, setRecovery] = useState(false)

  return (
    <>
      <form action={formAction} className="mt-8 flex flex-col gap-5">
        <p className="text-sm text-muted-foreground">
          Signing in as <span className="font-medium text-foreground">{username}</span>.{" "}
          {recovery ? "Enter one of your recovery codes. Each code works once." : "Open your authenticator app and enter the 6-digit code."}
        </p>
        <Field label={recovery ? "Recovery code" : "Authentication code"}>
          {(id) =>
            recovery ? (
              <Input key="recovery" id={id} name="code" autoComplete="off" autoFocus required maxLength={20} placeholder="XXXXX-XXXXX" className="h-10 font-mono tracking-widest uppercase" />
            ) : (
              <Input
                key="totp"
                id={id}
                name="code"
                autoComplete="one-time-code"
                inputMode="numeric"
                pattern="[0-9 ]{6,7}"
                maxLength={7}
                autoFocus
                required
                placeholder="123456"
                className="h-10 font-mono text-lg tracking-[0.4em]"
              />
            )
          }
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="remember" className={checkboxClassName} />
          Remember this device for 30 days
        </label>
        <FormMessage state={state} />
        <SubmitButton size="lg" className="h-10" pendingLabel="Verifying…">
          <ShieldCheck />
          Verify and sign in
        </SubmitButton>
      </form>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <Button type="button" variant="link" size="sm" className="px-0" onClick={() => setRecovery((value) => !value)}>
          <KeyRound />
          {recovery ? "Use an authenticator code" : "Use a recovery code"}
        </Button>
        <form action={cancelTwoFactorLoginAction}>
          <Button type="submit" variant="ghost" size="sm">
            <ArrowLeft />
            Back to sign in
          </Button>
        </form>
      </div>
    </>
  )
}

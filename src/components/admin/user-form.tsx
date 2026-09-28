"use client"

import { useActionState, useState } from "react"
import { Save, UserPlus, Wand2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createUserAction, updateUserAction } from "@/lib/admin/actions/users"
import { ALL_ROLES, ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/admin/permissions"
import type { SafeUser } from "@/lib/cms/types"
import { cn } from "@/lib/utils"

import { checkboxClassName, Field, FormMessage, SubmitButton } from "./form-controls"

function generatePassword() {
  const sets = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnpqrstuvwxyz", "23456789", "!@#$%^&*-_"]
  const all = sets.join("")
  const random = (n: number) => crypto.getRandomValues(new Uint32Array(1))[0] % n
  const chars = [...sets.map((set) => set[random(set.length)]), ...Array.from({ length: 12 }, () => all[random(all.length)])]
  for (let i = chars.length - 1; i > 0; i--) {
    const j = random(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join("")
}

export function UserForm({ user, isSelf }: { user?: SafeUser; isSelf?: boolean }) {
  const [state, formAction] = useActionState(user ? updateUserAction.bind(null, user.id) : createUserAction, {})
  const [role, setRole] = useState(user?.role ?? "editor")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-5 rounded-xl border bg-card p-5 shadow-xs">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Username" required error={state.fieldErrors?.username} help="Used to sign in.">
            {(id) => <Input id={id} name="username" defaultValue={user?.username} required autoComplete="off" maxLength={50} />}
          </Field>
          <Field label="Full name">{(id) => <Input id={id} name="full_name" defaultValue={user?.full_name ?? ""} maxLength={100} />}</Field>
        </div>
        <Field label="Email" error={state.fieldErrors?.email}>
          {(id) => <Input id={id} name="email" type="email" defaultValue={user?.email ?? ""} autoComplete="off" />}
        </Field>
        <Field
          label={user ? "New password" : "Password"}
          required={!user}
          error={state.fieldErrors?.password}
          help={user ? "Leave empty to keep the current password." : "10+ characters with upper & lower case, a number and a symbol."}
        >
          {(id) => (
            <div className="flex gap-2">
              <Input
                id={id}
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!user}
                autoComplete="new-password"
                className="font-mono"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPassword(generatePassword())
                  setShowPassword(true)
                }}
              >
                <Wand2 />
                Generate
              </Button>
            </div>
          )}
        </Field>
        <div className="flex flex-col gap-2.5">
          <label className="flex items-center gap-2.5 text-sm">
            <input type="checkbox" name="is_active" defaultChecked={user?.is_active ?? true} disabled={isSelf} className={checkboxClassName} />
            Account active (can sign in)
          </label>
          {isSelf ? <input type="hidden" name="is_active" value="on" /> : null}
          <label className="flex items-center gap-2.5 text-sm">
            <input type="checkbox" name="must_change_password" defaultChecked={user?.must_change_password ?? !user} className={checkboxClassName} />
            Ask to change password after signing in
          </label>
        </div>
        <FormMessage state={state} />
      </div>

      <div className="flex flex-col gap-4">
        <fieldset className="rounded-xl border bg-card p-5 shadow-xs">
          <legend className="sr-only">Role</legend>
          <p className="mb-3 text-sm font-medium">Role</p>
          <div className="flex flex-col gap-2">
            {ALL_ROLES.map((option) => (
              <label
                key={option}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                  role === option ? "border-primary bg-primary/5" : "hover:bg-muted/50",
                  isSelf && option !== "super_admin" && "cursor-not-allowed opacity-50"
                )}
              >
                <input
                  type="radio"
                  name="role"
                  value={option}
                  checked={role === option}
                  disabled={isSelf && option !== "super_admin"}
                  onChange={() => setRole(option)}
                  className="mt-0.5 accent-[var(--primary)]"
                />
                <span>
                  <span className="block text-sm font-medium">{ROLE_LABELS[option]}</span>
                  <span className="block text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[option]}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <SubmitButton size="lg">
          {user ? <Save /> : <UserPlus />}
          {user ? "Save user" : "Create user"}
        </SubmitButton>
      </div>
    </form>
  )
}

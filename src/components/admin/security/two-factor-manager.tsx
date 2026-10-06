"use client"

import { useRouter } from "next/navigation"
import { type FormEvent, useState, useTransition } from "react"
import { Check, Copy, Download, KeyRound, Loader2, QrCode, RefreshCw, ShieldCheck, ShieldOff, Smartphone, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  cancelTwoFactorSetupAction,
  confirmTwoFactorSetupAction,
  disableTwoFactorAction,
  regenerateRecoveryCodesAction,
  startSecretRegenerationAction,
  startTwoFactorSetupAction,
  type TwoFactorActionState,
} from "@/lib/admin/actions/two-factor"
import type { ActionState } from "@/lib/cms/types"
import { cn } from "@/lib/utils"

import { ActionButton, Field, FormMessage } from "../form-controls"
import { Panel } from "../ui"

export type TwoFactorManagerProps = {
  username: string
  enabled: boolean
  required: boolean
  /** A secret waiting for its first code: the QR code (inline SVG) and the key to type by hand. */
  pending: { qrSvg: string; secret: string; rotating: boolean } | null
  recovery: { remaining: number; total: number; codes: { id: string; usedAt: string | null }[] }
  /** Displayed date strings, formatted on the server. */
  usedLabels: Record<string, string>
}

/**
 * Setup, secret rotation, recovery codes and turning 2FA off. New recovery codes come back
 * from the server once; they're kept in this component's state (which survives the page
 * refresh that follows) until the user confirms they've saved them.
 */
export function TwoFactorManager({ username, enabled, required, pending, recovery, usedLabels }: TwoFactorManagerProps) {
  const [newCodes, setNewCodes] = useState<string[] | null>(null)
  // Confirmations from panels that disappear once they succeed (setup, turning off).
  const [notice, setNotice] = useState<ActionState>()

  return (
    <div className="flex flex-col gap-6">
      <FormMessage state={notice} />
      {newCodes ? <RecoveryCodesReveal codes={newCodes} username={username} onDone={() => setNewCodes(null)} /> : null}

      {pending ? (
        <SetupPanel
          pending={pending}
          onDone={(result) => {
            if (result.recoveryCodes) setNewCodes(result.recoveryCodes)
            setNotice({ ok: true, message: result.message })
          }}
        />
      ) : enabled ? (
        <>
          <RegenerateSecretPanel onStart={() => setNotice(undefined)} />
          <RecoveryCodesPanel recovery={recovery} usedLabels={usedLabels} onCodes={setNewCodes} />
          <DisablePanel required={required} onDone={(result) => setNotice({ ok: true, message: result.message })} />
        </>
      ) : (
        <EnablePanel required={required} />
      )}
    </div>
  )
}

/** Runs a server action from a form and keeps its result (forms here need the codes it returns). */
function useFormAction<S extends ActionState>(action: (prev: S, formData: FormData) => Promise<S>, onSuccess?: (state: S) => void) {
  const [state, setState] = useState<S>()
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    startTransition(async () => {
      const result = await action({} as S, formData)
      setState(result)
      if (!result.error) {
        form.reset()
        onSuccess?.(result)
        router.refresh()
      }
    })
  }
  return { state, pending, submit }
}

function CodeInput({ name = "code", label = "Authentication code", allowRecovery }: { name?: string; label?: string; allowRecovery?: boolean }) {
  return (
    <Field label={label} required help={allowRecovery ? "The 6-digit code from your app, or one of your recovery codes." : "The 6-digit code from your app."}>
      {(id) => (
        <Input
          id={id}
          name={name}
          required
          autoComplete="one-time-code"
          inputMode={allowRecovery ? "text" : "numeric"}
          pattern={allowRecovery ? undefined : "[0-9 ]{6,7}"}
          maxLength={allowRecovery ? 20 : 7}
          placeholder={allowRecovery ? "123456 or XXXXX-XXXXX" : "123456"}
          className="max-w-56 font-mono tracking-widest"
        />
      )}
    </Field>
  )
}

function PendingButton({ pending, children, ...props }: React.ComponentProps<typeof Button> & { pending: boolean }) {
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? <Loader2 className="animate-spin" /> : null}
      {children}
    </Button>
  )
}

function EnablePanel({ required }: { required: boolean }) {
  return (
    <Panel title="Two-factor authentication" description="A second step at sign-in: a 6-digit code from an authenticator app on your phone.">
      <div className="flex flex-col gap-4 text-sm">
        <p className="text-muted-foreground">
          {required
            ? "Your role requires two-factor authentication. Set it up now — the dashboard stays locked until it's on."
            : "Optional for your role, and strongly recommended."}{" "}
          Works with Google Authenticator, Microsoft Authenticator, Authy, 1Password, Bitwarden and any other TOTP app.
        </p>
        <ActionButton action={() => startTwoFactorSetupAction()} className="self-start">
          <ShieldCheck />
          Enable two-factor authentication
        </ActionButton>
      </div>
    </Panel>
  )
}

function SetupPanel({ pending, onDone }: { pending: NonNullable<TwoFactorManagerProps["pending"]>; onDone: (result: TwoFactorActionState) => void }) {
  const { state, pending: saving, submit } = useFormAction<TwoFactorActionState>(confirmTwoFactorSetupAction, onDone)
  const [copied, setCopied] = useState(false)

  return (
    <Panel
      title={pending.rotating ? "Move to a new authenticator secret" : "Set up two-factor authentication"}
      description="Two-factor authentication turns on only after a code from the app is verified."
    >
      <ol className="grid gap-6 text-sm md:grid-cols-[auto_1fr]">
        <li className="flex flex-col items-center gap-3">
          <div
            className="size-52 rounded-xl border bg-white p-2 [&>svg]:size-full"
            role="img"
            aria-label="QR code to add MagicWorks Host to your authenticator app"
            // Generated on the server from our own otpauth:// URI (qrcode library output, no user input).
            dangerouslySetInnerHTML={{ __html: pending.qrSvg }}
          />
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <QrCode className="size-3.5" aria-hidden />
            Scan with your authenticator app
          </p>
        </li>
        <li className="flex flex-col gap-4">
          <div>
            <p className="font-semibold">1. Open your authenticator app</p>
            <p className="mt-1 text-muted-foreground">
              Google Authenticator, Microsoft Authenticator, Authy, 1Password, Bitwarden or any TOTP app. Add an account and scan the QR code.
            </p>
          </div>
          <div>
            <p className="font-semibold">2. Can&apos;t scan? Enter this key instead</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <code className="rounded-md bg-muted px-3 py-1.5 font-mono text-sm tracking-wider break-all">{pending.secret}</code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  void navigator.clipboard.writeText(pending.secret.replace(/\s/g, "")).then(() => setCopied(true))
                }}
              >
                {copied ? <Check /> : <Copy />}
                {copied ? "Copied" : "Copy key"}
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Time-based, 6 digits, 30 seconds (the app&apos;s defaults).</p>
          </div>
          <form onSubmit={submit} className="flex flex-col gap-3">
            <p className="font-semibold">3. Enter the 6-digit code the app shows</p>
            <CodeInput />
            {/* Success is shown by the manager: this panel unmounts once setup succeeds. */}
            <FormMessage state={state?.error ? state : undefined} />
            <div className="flex flex-wrap gap-2">
              <PendingButton pending={saving}>
                <ShieldCheck />
                Verify and turn on
              </PendingButton>
              <ActionButton type="button" variant="ghost" action={() => cancelTwoFactorSetupAction()}>
                <X />
                Cancel
              </ActionButton>
            </div>
          </form>
        </li>
      </ol>
    </Panel>
  )
}

function RegenerateSecretPanel({ onStart }: { onStart: () => void }) {
  const { state, pending, submit } = useFormAction<ActionState>(startSecretRegenerationAction, onStart)
  return (
    <Panel title="Authenticator app" description="New phone or app? Move two-factor authentication to a new secret. Your current app stops working once the new one is verified.">
      <form onSubmit={submit} className="flex flex-col gap-3">
        <CodeInput label="Current authentication code" allowRecovery />
        <FormMessage state={state} />
        <PendingButton pending={pending} variant="outline" className="self-start">
          <Smartphone />
          Regenerate secret
        </PendingButton>
      </form>
    </Panel>
  )
}

function RecoveryCodesPanel({
  recovery,
  usedLabels,
  onCodes,
}: {
  recovery: TwoFactorManagerProps["recovery"]
  usedLabels: Record<string, string>
  onCodes: (codes: string[]) => void
}) {
  const { state, pending, submit } = useFormAction<TwoFactorActionState>(regenerateRecoveryCodesAction, (result) => {
    if (result.recoveryCodes) onCodes(result.recoveryCodes)
  })
  const low = recovery.remaining <= 3
  return (
    <Panel
      title="Recovery codes"
      description="One-time codes for signing in without your phone. Only their fingerprints are stored, so they can't be shown again — generate new ones if you've lost them."
    >
      <div className="flex flex-col gap-4 text-sm">
        <p className={cn("font-medium", low && "text-destructive")}>
          {recovery.remaining} of {recovery.total} codes left{low ? " — generate new codes soon." : "."}
        </p>
        {recovery.codes.length ? (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {recovery.codes.map((code, index) => (
              <li
                key={code.id}
                className={cn("rounded-md border px-2.5 py-1.5 font-mono text-xs", code.usedAt ? "bg-muted text-muted-foreground line-through" : "bg-card")}
                title={code.usedAt ? `Used ${usedLabels[code.id] ?? ""}` : "Unused"}
              >
                #{index + 1} ••••-••••
                <span className="sr-only">{code.usedAt ? ` used ${usedLabels[code.id] ?? ""}` : " unused"}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <form onSubmit={submit} className="flex flex-col gap-3 border-t pt-4">
          <CodeInput label="Authentication code (from your app)" />
          <FormMessage state={state} />
          <PendingButton pending={pending} variant="outline" className="self-start">
            <RefreshCw />
            Regenerate recovery codes
          </PendingButton>
        </form>
      </div>
    </Panel>
  )
}

function DisablePanel({ required, onDone }: { required: boolean; onDone: (result: ActionState) => void }) {
  const { state, pending, submit } = useFormAction<ActionState>(disableTwoFactorAction, onDone)
  if (required) {
    return (
      <Panel title="Turn off two-factor authentication">
        <p className="text-sm text-muted-foreground">
          Two-factor authentication is mandatory for super admins and admins, so it can&apos;t be turned off. If you lose your phone and your
          recovery codes, a super admin can reset it from Users.
        </p>
      </Panel>
    )
  }
  return (
    <Panel title="Turn off two-factor authentication" description="Your account will be protected by your password only.">
      <form onSubmit={submit} className="flex flex-col gap-3">
        <Field label="Password" required>
          {(id) => <Input id={id} name="password" type="password" required autoComplete="current-password" className="max-w-sm" />}
        </Field>
        <CodeInput allowRecovery />
        <FormMessage state={state?.error ? state : undefined} />
        <PendingButton pending={pending} variant="destructive" className="self-start">
          <ShieldOff />
          Turn off two-factor authentication
        </PendingButton>
      </form>
    </Panel>
  )
}

function RecoveryCodesReveal({ codes, username, onDone }: { codes: string[]; username: string; onDone: () => void }) {
  const [copied, setCopied] = useState(false)
  const text = `MagicWorks Host admin — recovery codes for ${username}\nGenerated ${new Date().toLocaleString()}\nEach code works once.\n\n${codes.join("\n")}\n`
  const download = () => {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }))
    const link = Object.assign(document.createElement("a"), { href: url, download: `mwh-admin-recovery-codes-${username}.txt` })
    link.click()
    URL.revokeObjectURL(url)
  }
  return (
    <section className="rounded-xl border border-amber-300/60 bg-amber-50 p-5 text-amber-950 shadow-xs dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
      <div className="flex items-start gap-3">
        <KeyRound className="mt-0.5 size-5 shrink-0" aria-hidden />
        <div className="flex-1">
          <h2 className="text-sm font-semibold">Save your recovery codes now</h2>
          <p className="mt-1 text-sm">
            Each code signs you in once if you lose your phone. They won&apos;t be shown again — copy or download them and keep them somewhere
            safe (a password manager is ideal).
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {codes.map((code) => (
              <li key={code} className="rounded-md border border-amber-300/70 bg-white px-2.5 py-1.5 text-center font-mono text-sm text-foreground dark:bg-card">
                {code}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => void navigator.clipboard.writeText(codes.join("\n")).then(() => setCopied(true))}>
              {copied ? <Check /> : <Copy />}
              {copied ? "Copied" : "Copy codes"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={download}>
              <Download />
              Download .txt
            </Button>
            <Button type="button" size="sm" onClick={onDone}>
              <Check />
              I&apos;ve saved them
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

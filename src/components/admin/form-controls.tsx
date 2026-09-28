"use client"

import { useRouter } from "next/navigation"
import { type ComponentProps, type ReactNode, useId, useState, useTransition } from "react"
import { useFormStatus } from "react-dom"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ActionState } from "@/lib/cms/types"
import { cn } from "@/lib/utils"

export function SubmitButton({ children, pendingLabel, ...props }: ComponentProps<typeof Button> & { pendingLabel?: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending || props.disabled} {...props}>
      {pending ? <Loader2 className="animate-spin" /> : null}
      {pending ? (pendingLabel ?? "Saving…") : children}
    </Button>
  )
}

export function FormMessage({ state, className }: { state: ActionState | undefined; className?: string }) {
  if (!state?.error && !state?.message) return null
  const ok = !state.error
  return (
    <p
      role={ok ? "status" : "alert"}
      className={cn(
        "flex items-start gap-2 rounded-lg px-3 py-2 text-sm",
        ok ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-destructive/10 text-destructive",
        className
      )}
    >
      {ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <XCircle className="mt-0.5 size-4 shrink-0" />}
      <span>{state.error ?? state.message}</span>
    </p>
  )
}

/** Label + control + help/error text. `children` receives the generated id for the control. */
export function Field({
  label,
  help,
  error,
  required,
  className,
  children,
}: {
  label: ReactNode
  help?: ReactNode
  error?: string
  required?: boolean
  className?: string
  children: (id: string) => ReactNode
}) {
  const id = useId()
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required ? <span className="ml-0.5 text-admin-secondary">*</span> : null}
      </label>
      {children(id)}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : help ? (
        <p className="text-xs text-muted-foreground">{help}</p>
      ) : null}
    </div>
  )
}

export const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 [&>option]:bg-popover [&>option]:text-popover-foreground"

export const checkboxClassName = "size-4 rounded border-input accent-[var(--primary)]"

/**
 * Button that asks for confirmation, then runs `action` (a bound server action) and shows
 * the result. Refreshes server data on success unless the action redirected.
 */
export type ConfirmConfig = {
  action: () => Promise<ActionState | void>
  title: string
  description?: ReactNode
  confirmLabel?: string
  destructive?: boolean
  onDone?: (state: ActionState) => void
}

/** Controlled confirmation dialog that runs `action` and keeps itself open to show errors. */
export function ConfirmDialog({
  open,
  onOpenChange,
  action,
  title,
  description,
  confirmLabel = "Confirm",
  destructive,
  onDone,
}: ConfirmConfig & { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [pending, startTransition] = useTransition()
  const [state, setState] = useState<ActionState>()
  const router = useRouter()

  function run() {
    startTransition(async () => {
      const result = (await action()) ?? { ok: true }
      setState(result)
      if (!result.error) {
        onOpenChange(false)
        onDone?.(result)
        router.refresh()
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setState(undefined)
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <FormMessage state={state} />
        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={pending} />}>Cancel</DialogClose>
          <Button variant={destructive ? "destructive" : "default"} onClick={run} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ConfirmActionButton({
  action,
  title,
  description,
  confirmLabel,
  destructive,
  onDone,
  children,
  ...buttonProps
}: Omit<ComponentProps<typeof Button>, "onClick" | "action"> & ConfirmConfig) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button type="button" {...buttonProps} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        action={action}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        destructive={destructive}
        onDone={onDone}
      />
    </>
  )
}

/** Runs a bound server action immediately (no confirm) with a pending state. */
export function ActionButton({
  action,
  children,
  onDone,
  ...buttonProps
}: Omit<ComponentProps<typeof Button>, "onClick" | "action"> & {
  action: () => Promise<ActionState | void>
  onDone?: (state: ActionState) => void
}) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  return (
    <Button
      type="button"
      {...buttonProps}
      disabled={pending || buttonProps.disabled}
      onClick={() =>
        startTransition(async () => {
          const result = (await action()) ?? { ok: true }
          onDone?.(result)
          if (!result.error) router.refresh()
        })
      }
    >
      {pending ? <Loader2 className="animate-spin" /> : null}
      {children}
    </Button>
  )
}

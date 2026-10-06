"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ComponentProps, type ReactNode } from "react"
import { CheckCircle2, CircleAlert, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { ActionState } from "@/lib/cms/types"
import { cn } from "@/lib/utils"

import { ConfirmDialog, checkboxClassName, type ConfirmConfig } from "./form-controls"

type Notice = { tone: "success" | "error"; text: string }

type BulkSelection = {
  /** Selected ids that are still in the list (rows removed by a refresh drop out). */
  selected: string[]
  isSelected: (id: string) => boolean
  toggle: (id: string, checked: boolean) => void
  /** Selects or clears `ids` (defaults to every row). */
  setMany: (ids: string[], checked: boolean) => void
  clear: () => void
  ids: string[]
  notice: Notice | null
  notify: (notice: Notice | null) => void
}

const BulkSelectionContext = createContext<BulkSelection | null>(null)

export function useBulkSelection() {
  const context = useContext(BulkSelectionContext)
  if (!context) throw new Error("useBulkSelection must be used inside <BulkSelectionProvider>")
  return context
}

/** For components that are only selectable when a provider is present (e.g. RecordsTable). */
export function useOptionalBulkSelection() {
  return useContext(BulkSelectionContext)
}

/** Holds the multi-select state for one admin table. `ids` are the selectable rows. */
export function BulkSelectionProvider({ ids, children }: { ids: string[]; children: ReactNode }) {
  const [chosen, setChosen] = useState<Set<string>>(() => new Set())
  const [notice, setNotice] = useState<Notice | null>(null)

  const selected = useMemo(() => ids.filter((id) => chosen.has(id)), [ids, chosen])

  const toggle = useCallback((id: string, checked: boolean) => {
    setChosen((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])
  const setMany = useCallback((targets: string[], checked: boolean) => {
    setChosen((prev) => {
      const next = new Set(prev)
      for (const id of targets) {
        if (checked) next.add(id)
        else next.delete(id)
      }
      return next
    })
  }, [])
  const clear = useCallback(() => setChosen(new Set()), [])

  // Success notices fade after a few seconds; errors stay until dismissed or replaced.
  useEffect(() => {
    if (notice?.tone !== "success") return
    const timer = window.setTimeout(() => setNotice(null), 6000)
    return () => window.clearTimeout(timer)
  }, [notice])

  const value = useMemo<BulkSelection>(
    () => ({
      selected,
      isSelected: (id) => chosen.has(id),
      toggle,
      setMany,
      clear,
      ids,
      notice,
      notify: setNotice,
    }),
    [selected, chosen, toggle, setMany, clear, ids, notice]
  )

  return <BulkSelectionContext.Provider value={value}>{children}</BulkSelectionContext.Provider>
}

/** Header checkbox: checked when every row in `ids` is selected, indeterminate when some are. */
export function SelectAllCheckbox({ ids, label = "Select all" }: { ids?: string[]; label?: string }) {
  const selection = useBulkSelection()
  const targets = ids ?? selection.ids
  const count = targets.filter((id) => selection.isSelected(id)).length
  const all = targets.length > 0 && count === targets.length
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = count > 0 && !all
  }, [count, all])

  return (
    <input
      ref={ref}
      type="checkbox"
      aria-label={label}
      className={cn(checkboxClassName, "cursor-pointer align-middle")}
      checked={all}
      disabled={!targets.length}
      onChange={(event) => selection.setMany(targets, event.target.checked)}
    />
  )
}

export function RowCheckbox({ id, label, disabled, title }: { id: string; label: string; disabled?: boolean; title?: string }) {
  const selection = useBulkSelection()
  return (
    <input
      type="checkbox"
      aria-label={label}
      title={title}
      className={cn(checkboxClassName, "cursor-pointer align-middle disabled:cursor-not-allowed disabled:opacity-40")}
      checked={!disabled && selection.isSelected(id)}
      disabled={disabled}
      onClick={(event) => event.stopPropagation()}
      onChange={(event) => selection.toggle(id, event.target.checked)}
    />
  )
}

/**
 * The strip above a table: the selection count with its actions while rows are selected, and
 * the result of the last bulk action (success or error) — announced to screen readers.
 */
export function BulkActionBar({ noun, children }: { noun: [string, string]; children: ReactNode }) {
  const { selected, clear, notice, notify } = useBulkSelection()
  if (!selected.length && !notice) return null

  return (
    <div className="flex flex-col gap-2 border-b bg-muted/30 px-4 py-2.5">
      {selected.length ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium tabular-nums">
            {selected.length} {selected.length === 1 ? noun[0] : noun[1]} selected
          </span>
          <Button variant="ghost" size="sm" onClick={clear}>
            Clear
          </Button>
          <div className="ml-auto flex flex-wrap items-center gap-2">{children}</div>
        </div>
      ) : null}
      <div aria-live="polite" role="status">
        {notice ? (
          <p
            className={cn(
              "flex items-start gap-2 rounded-md px-3 py-2 text-sm",
              notice.tone === "success"
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {notice.tone === "success" ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <CircleAlert className="mt-0.5 size-4 shrink-0" />}
            <span className="flex-1">{notice.text}</span>
            <button type="button" onClick={() => notify(null)} aria-label="Dismiss" className="rounded p-0.5 opacity-70 hover:opacity-100">
              <X className="size-3.5" />
            </button>
          </p>
        ) : null}
      </div>
    </div>
  )
}

/**
 * A bulk-action button that asks for confirmation, runs `run(selectedIds)` with a loading state
 * (errors stay in the dialog), then clears the selection and shows the result.
 */
export function BulkConfirmButton({
  run,
  title,
  description,
  confirmLabel,
  destructive,
  children,
  ...buttonProps
}: Omit<ComponentProps<typeof Button>, "onClick" | "title"> &
  Pick<ConfirmConfig, "confirmLabel" | "destructive"> & {
    run: (ids: string[]) => Promise<ActionState>
    title: (count: number) => string
    description?: (count: number) => ReactNode
  }) {
  const { selected, clear, notify } = useBulkSelection()
  const [open, setOpen] = useState(false)
  // Freeze the selection when the dialog opens, so the action runs on exactly what was confirmed.
  const [ids, setIds] = useState<string[]>([])

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant={destructive ? "destructive" : "outline"}
        {...buttonProps}
        disabled={!selected.length || buttonProps.disabled}
        onClick={() => {
          setIds(selected)
          setOpen(true)
        }}
      >
        {children}
      </Button>
      {open ? (
        <ConfirmDialog
          open
          onOpenChange={setOpen}
          title={title(ids.length)}
          description={description?.(ids.length)}
          confirmLabel={confirmLabel}
          destructive={destructive}
          action={async () => {
            const result = await run(ids)
            if (result.error) notify({ tone: "error", text: result.error })
            return result
          }}
          onDone={(result) => {
            clear()
            notify({ tone: "success", text: result.message ?? "Done." })
          }}
        />
      ) : null}
    </>
  )
}

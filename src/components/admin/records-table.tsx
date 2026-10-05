"use client"

import { Fragment, useMemo, useState } from "react"
import { Download, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { RowCheckbox, SelectAllCheckbox, useOptionalBulkSelection } from "./bulk-selection"
import { formatDate } from "./ui"

export type RecordColumn = { key: string; label: string; kind?: "date" | "email" | "phone" | "long" }

export function toCsv(columns: RecordColumn[], rows: Record<string, unknown>[]) {
  const escape = (value: unknown) => {
    const text = value == null ? "" : String(value)
    // Prefix formula-like cells so spreadsheets don't execute them (CSV injection).
    const safe = /^[=+\-@]/.test(text) ? `'${text}` : text
    return `"${safe.replace(/"/g, '""')}"`
  }
  return [columns.map((c) => escape(c.label)).join(","), ...rows.map((row) => columns.map((c) => escape(row[c.key])).join(","))].join("\r\n")
}

function matching(rows: Record<string, unknown>[], columns: RecordColumn[], query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return rows
  return rows.filter((row) => columns.some((c) => String(row[c.key] ?? "").toLowerCase().includes(q)))
}

/** Saves `rows` as a dated CSV file (UTF-8 with BOM, so Excel reads non-ASCII names correctly). */
export function downloadCsv(fileName: string, columns: RecordColumn[], rows: Record<string, unknown>[]) {
  const blob = new Blob([`﻿${toCsv(columns, rows)}`], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Searchable, CSV-exportable table for leads and form entries. Inside a <BulkSelectionProvider>
 * it adds row checkboxes; "select all" covers the rows matching the current search.
 */
export function RecordsTable({ columns, rows, fileName, emptyLabel }: { columns: RecordColumn[]; rows: Record<string, unknown>[]; fileName: string; emptyLabel: string }) {
  const [query, setQuery] = useState("")
  const [openId, setOpenId] = useState<string | null>(null)
  const selection = useOptionalBulkSelection()
  const selectable = selection !== null

  const filtered = useMemo(() => matching(rows, columns, query), [rows, columns, query])

  function search(next: string) {
    setQuery(next)
    // Rows the new search hides are deselected, so a bulk action only ever touches visible rows.
    if (selection?.selected.length) {
      const shown = new Set(matching(rows, columns, next).map((row) => String(row.id)))
      selection.setMany(selection.selected.filter((id) => !shown.has(id)), false)
    }
  }

  function download() {
    downloadCsv(fileName, columns, filtered)
  }

  const visible = columns.filter((c) => c.kind !== "long")
  const long = columns.filter((c) => c.kind === "long")

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b px-5 py-3">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={query} onChange={(e) => search(e.target.value)} placeholder="Search…" className="pl-8" aria-label="Search records" />
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {filtered.length} of {rows.length}
        </span>
        <Button variant="outline" size="sm" onClick={download} disabled={!filtered.length}>
          <Download />
          Export CSV
        </Button>
      </div>
      {filtered.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr>
                {selectable ? (
                  <th className="w-10 border-b bg-muted/40 py-2.5 pr-0 pl-4">
                    <SelectAllCheckbox ids={filtered.map((row) => String(row.id))} label="Select all matching records" />
                  </th>
                ) : null}
                {visible.map((c) => (
                  <th key={c.key} className="border-b bg-muted/40 px-4 py-2.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const id = String(row.id)
                const expandable = long.some((c) => row[c.key])
                return (
                  <Fragment key={id}>
                    <tr
                      className={expandable ? "cursor-pointer hover:bg-muted/30" : "hover:bg-muted/30"}
                      onClick={expandable ? () => setOpenId(openId === id ? null : id) : undefined}
                    >
                      {selectable ? (
                        <td className="w-10 border-b py-3 pr-0 pl-4 align-top">
                          <RowCheckbox id={id} label={`Select record ${String(row.name ?? row.email ?? id)}`} />
                        </td>
                      ) : null}
                      {visible.map((c) => {
                        const value = row[c.key]
                        return (
                          <td key={c.key} className="border-b px-4 py-3 align-top">
                            {c.kind === "date" ? (
                              <span className="whitespace-nowrap text-muted-foreground">{formatDate(value as string)}</span>
                            ) : c.kind === "email" && value ? (
                              <a href={`mailto:${value}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                                {String(value)}
                              </a>
                            ) : c.kind === "phone" && value ? (
                              <a href={`tel:${String(value).replace(/\s+/g, "")}`} className="whitespace-nowrap hover:underline" onClick={(e) => e.stopPropagation()}>
                                {String(value)}
                              </a>
                            ) : (
                              <span className="line-clamp-2">{value == null || value === "" ? "—" : String(value)}</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                    {openId === id ? (
                      <tr>
                        <td colSpan={visible.length + (selectable ? 1 : 0)} className="border-b bg-muted/20 px-4 py-3">
                          {long.map((c) => (
                            <div key={c.key}>
                              <p className="text-xs font-medium text-muted-foreground uppercase">{c.label}</p>
                              <p className="mt-1 text-sm whitespace-pre-wrap">{String(row[c.key] ?? "—")}</p>
                            </div>
                          ))}
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="py-14 text-center text-sm text-muted-foreground">{rows.length ? "No records match your search." : emptyLabel}</p>
      )}
    </div>
  )
}

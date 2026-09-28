"use client"

import { Fragment, useMemo, useState } from "react"
import { Download, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { formatDate } from "./ui"

export type RecordColumn = { key: string; label: string; kind?: "date" | "email" | "phone" | "long" }

function toCsv(columns: RecordColumn[], rows: Record<string, unknown>[]) {
  const escape = (value: unknown) => {
    const text = value == null ? "" : String(value)
    // Prefix formula-like cells so spreadsheets don't execute them (CSV injection).
    const safe = /^[=+\-@]/.test(text) ? `'${text}` : text
    return `"${safe.replace(/"/g, '""')}"`
  }
  return [columns.map((c) => escape(c.label)).join(","), ...rows.map((row) => columns.map((c) => escape(row[c.key])).join(","))].join("\r\n")
}

/** Searchable, CSV-exportable table for leads and form entries. */
export function RecordsTable({ columns, rows, fileName, emptyLabel }: { columns: RecordColumn[]; rows: Record<string, unknown>[]; fileName: string; emptyLabel: string }) {
  const [query, setQuery] = useState("")
  const [openId, setOpenId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) => columns.some((c) => String(row[c.key] ?? "").toLowerCase().includes(q)))
  }, [rows, columns, query])

  function download() {
    const blob = new Blob([`﻿${toCsv(columns, filtered)}`], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const visible = columns.filter((c) => c.kind !== "long")
  const long = columns.filter((c) => c.kind === "long")

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b px-5 py-3">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="pl-8" aria-label="Search records" />
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
                        <td colSpan={visible.length} className="border-b bg-muted/20 px-4 py-3">
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

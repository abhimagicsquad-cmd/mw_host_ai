"use client"

import { useMemo, useState } from "react"
import { Download, Loader2, Tags, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { bulkDeleteLeadsAction, bulkSetLeadStatusAction, logLeadExportAction } from "@/lib/admin/actions/leads"
import { LEAD_STATUS_LABELS, LEAD_STATUSES, isLeadStatus, type LeadStatus } from "@/lib/cms/lead-status"
import type { LeadRow } from "@/lib/cms/types"

import { BulkActionBar, BulkConfirmButton, BulkSelectionProvider, useBulkSelection } from "./bulk-selection"
import { selectClassName } from "./form-controls"
import { downloadCsv, RecordsTable, type RecordColumn } from "./records-table"

const leads = (count: number) => `${count} ${count === 1 ? "lead" : "leads"}`

type LeadRecord = LeadRow & { status_label?: string }

/** The Leads screen: RecordsTable plus multi-select, bulk status change, CSV export of the selection and bulk delete. */
export function LeadsTable({ rows, statusEnabled }: { rows: LeadRow[]; statusEnabled: boolean }) {
  const records = useMemo<LeadRecord[]>(
    () =>
      rows.map((row) => ({
        ...row,
        status_label: isLeadStatus(row.status) ? LEAD_STATUS_LABELS[row.status] : row.status ? String(row.status) : LEAD_STATUS_LABELS.new,
      })),
    [rows]
  )
  const columns = useMemo<RecordColumn[]>(
    () => [
      { key: "created_at", label: "Received", kind: "date" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email", kind: "email" },
      { key: "phone", label: "Phone", kind: "phone" },
      ...(statusEnabled ? [{ key: "status_label", label: "Status" }] : []),
      { key: "service", label: "Service" },
      { key: "source", label: "Source" },
      { key: "company", label: "Company" },
      { key: "message", label: "Message", kind: "long" as const },
      { key: "page_url", label: "Page", kind: "long" as const },
    ],
    [statusEnabled]
  )
  const ids = useMemo(() => rows.map((row) => row.id), [rows])

  return (
    <BulkSelectionProvider ids={ids}>
      <LeadsBulkActions records={records} columns={columns} statusEnabled={statusEnabled} />
      <RecordsTable fileName="leads" emptyLabel="No leads yet." rows={records} columns={columns} />
    </BulkSelectionProvider>
  )
}

function LeadsBulkActions({ records, columns, statusEnabled }: { records: LeadRecord[]; columns: RecordColumn[]; statusEnabled: boolean }) {
  const { selected, notify } = useBulkSelection()
  const [status, setStatus] = useState<LeadStatus | "">("")
  const [exporting, setExporting] = useState(false)

  async function exportSelected() {
    const ids = [...selected]
    setExporting(true)
    try {
      // The server checks the permission and records the export before the file is built.
      const result = await logLeadExportAction(ids)
      if (result.error) {
        notify({ tone: "error", text: result.error })
        return
      }
      const chosen = new Set(ids)
      downloadCsv("leads-selected", columns, records.filter((row) => chosen.has(row.id)))
      notify({ tone: "success", text: result.message ?? `Exported ${leads(ids.length)}.` })
    } catch {
      notify({ tone: "error", text: "The export couldn't be completed. Check your connection and try again." })
    } finally {
      setExporting(false)
    }
  }

  return (
    <BulkActionBar noun={["lead", "leads"]}>
      {statusEnabled ? (
        <div className="flex items-center gap-1.5">
          <label className="sr-only" htmlFor="bulk-lead-status">
            New status for the selected leads
          </label>
          <select
            id="bulk-lead-status"
            value={status}
            onChange={(event) => setStatus(isLeadStatus(event.target.value) ? event.target.value : "")}
            className={`${selectClassName} h-7 w-36`}
          >
            <option value="">Change status…</option>
            {LEAD_STATUSES.map((value) => (
              <option key={value} value={value}>
                {LEAD_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
          <BulkConfirmButton
            disabled={!status}
            run={(ids) => (status ? bulkSetLeadStatusAction(ids, status) : Promise.resolve({ error: "Choose a status first." }))}
            title={(count) => `Mark ${leads(count)} as “${status ? LEAD_STATUS_LABELS[status] : ""}”?`}
            description={() => "Leads already in that status stay as they are."}
            confirmLabel="Update status"
          >
            <Tags />
            Apply
          </BulkConfirmButton>
        </div>
      ) : null}
      <Button type="button" size="sm" variant="outline" onClick={exportSelected} disabled={exporting || !selected.length}>
        {exporting ? <Loader2 className="animate-spin" /> : <Download />}
        Export CSV
      </Button>
      <BulkConfirmButton
        run={bulkDeleteLeadsAction}
        title={(count) => `Delete ${leads(count)}?`}
        description={() => "The selected enquiries are removed permanently, including their messages. Export them first if you need a copy. This can't be undone."}
        confirmLabel="Delete permanently"
        destructive
      >
        <Trash2 />
        Delete
      </BulkConfirmButton>
    </BulkActionBar>
  )
}

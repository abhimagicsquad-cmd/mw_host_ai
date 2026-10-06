import type { Metadata } from "next"

import { LeadsTable } from "@/components/admin/leads-table"
import { PageHeader, Panel, ProblemNotice } from "@/components/admin/ui"
import { requireAdmin } from "@/lib/admin/auth"
import { hasLeadStatusColumn, listLeads } from "@/lib/admin/queries"

export const metadata: Metadata = { title: "Leads" }

export default async function LeadsPage() {
  await requireAdmin("forms.view")
  const [{ data, problem }, statusEnabled] = await Promise.all([listLeads(), hasLeadStatusColumn()])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Leads"
        breadcrumbs={[{ label: "Forms" }, { label: "Leads" }]}
        description="Enquiries from the contact page, quote form and lead pop-ups. Click a row to read the full message, or tick rows for bulk actions."
      />
      <ProblemNotice problem={problem} />
      {!problem && !statusEnabled ? (
        <p role="status" className="rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-300">
          Lead status isn&apos;t set up yet. Run <code className="font-mono text-xs">supabase/migrations/0005_add_lead_status.sql</code> in the
          Supabase SQL editor to track leads as New, Contacted, Qualified, Won or Lost. Export and delete work already.
        </p>
      ) : null}
      <Panel bodyClassName="p-0">
        <LeadsTable rows={data} statusEnabled={statusEnabled} />
      </Panel>
    </div>
  )
}

import type { Metadata } from "next"

import { RecordsTable } from "@/components/admin/records-table"
import { PageHeader, Panel, ProblemNotice } from "@/components/admin/ui"
import { requireAdmin } from "@/lib/admin/auth"
import { listLeads } from "@/lib/admin/queries"

export const metadata: Metadata = { title: "Leads" }

export default async function LeadsPage() {
  await requireAdmin("forms.view")
  const { data, problem } = await listLeads()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Leads"
        breadcrumbs={[{ label: "Forms" }, { label: "Leads" }]}
        description="Enquiries from the contact page, quote form and lead pop-ups. Click a row to read the full message."
      />
      <ProblemNotice problem={problem} />
      <Panel bodyClassName="p-0">
        <RecordsTable
          fileName="leads"
          emptyLabel="No leads yet."
          rows={data}
          columns={[
            { key: "created_at", label: "Received", kind: "date" },
            { key: "name", label: "Name" },
            { key: "email", label: "Email", kind: "email" },
            { key: "phone", label: "Phone", kind: "phone" },
            { key: "service", label: "Service" },
            { key: "source", label: "Source" },
            { key: "company", label: "Company" },
            { key: "message", label: "Message", kind: "long" },
            { key: "page_url", label: "Page", kind: "long" },
          ]}
        />
      </Panel>
    </div>
  )
}

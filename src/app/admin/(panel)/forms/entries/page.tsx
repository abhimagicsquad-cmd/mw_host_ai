import type { Metadata } from "next"

import { RecordsTable } from "@/components/admin/records-table"
import { PageHeader, Panel, ProblemNotice } from "@/components/admin/ui"
import { requireAdmin } from "@/lib/admin/auth"
import { listNewsletter, listOrders } from "@/lib/admin/queries"

export const metadata: Metadata = { title: "Form entries" }

export default async function FormEntriesPage() {
  await requireAdmin("forms.view")
  const [orders, newsletter] = await Promise.all([listOrders(), listNewsletter()])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Form entries" breadcrumbs={[{ label: "Forms" }, { label: "Form entries" }]} description="Checkout orders and newsletter sign-ups." />

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Orders</h2>
        <ProblemNotice problem={orders.problem} />
        <Panel bodyClassName="p-0">
          <RecordsTable
            fileName="orders"
            emptyLabel="No orders yet."
            rows={orders.data}
            columns={[
              { key: "created_at", label: "Date", kind: "date" },
              { key: "order_ref", label: "Order ref" },
              { key: "plan_name", label: "Plan" },
              { key: "billing_label", label: "Billing" },
              { key: "amount", label: "Amount" },
              { key: "name", label: "Customer" },
              { key: "email", label: "Email", kind: "email" },
              { key: "phone", label: "Phone", kind: "phone" },
              { key: "status", label: "Status" },
            ]}
          />
        </Panel>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Newsletter subscribers</h2>
        <ProblemNotice problem={newsletter.problem} />
        <Panel bodyClassName="p-0">
          <RecordsTable
            fileName="newsletter-subscribers"
            emptyLabel="No subscribers yet."
            rows={newsletter.data}
            columns={[
              { key: "created_at", label: "Subscribed", kind: "date" },
              { key: "email", label: "Email", kind: "email" },
              { key: "source", label: "Source" },
              { key: "page_url", label: "Page" },
            ]}
          />
        </Panel>
      </div>
    </div>
  )
}

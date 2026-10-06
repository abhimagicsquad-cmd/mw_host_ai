import type { Metadata } from "next"

import { AssistantPlansManager } from "@/components/admin/assistant/assistant-plans-manager"
import { AssistantMigrationNotice } from "@/components/admin/assistant/assistant-status"
import { PageHeader, ProblemNotice } from "@/components/admin/ui"
import { listAssistantPlans } from "@/lib/admin/assistant-queries"
import { requireAdmin } from "@/lib/admin/auth"

export const metadata: Metadata = { title: "Hosting Assistant plans" }

export default async function AssistantPlansPage() {
  await requireAdmin("assistant.manage")
  const { data, problem } = await listAssistantPlans()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Hosting Plans"
        description="The plans the assistant recommends and shows as cards. Recommendations pick from the active plans in a category, in display order (first = entry tier)."
        breadcrumbs={[{ label: "Hosting Assistant", href: "/admin/assistant" }, { label: "Hosting Plans" }]}
      />
      {problem === "assistant-missing" ? <AssistantMigrationNotice /> : <ProblemNotice problem={problem} />}
      {problem === "assistant-missing" ? null : <AssistantPlansManager plans={data} />}
    </div>
  )
}

import type { Metadata } from "next"

import { AssistantFlowsEditor } from "@/components/admin/assistant/assistant-flows-editor"
import { AssistantPreviewButton } from "@/components/admin/assistant/assistant-preview"
import { PageHeader } from "@/components/admin/ui"
import { requireAdmin } from "@/lib/admin/auth"
import { getAdminAssistantSettings } from "@/lib/assistant/server"
import { toPublicConfig } from "@/lib/assistant/settings"

export const metadata: Metadata = { title: "Hosting Assistant conversation flows" }

export default async function AssistantFlowsPage() {
  await requireAdmin("assistant.manage")
  const { settings } = await getAdminAssistantSettings()

  // Which quick actions and starters start each flow (their ids can't change while in use).
  const usedBy: Record<string, string[]> = {}
  const addUse = (flowId: string | undefined, label: string) => {
    if (flowId) (usedBy[flowId] ??= []).push(label)
  }
  for (const action of settings.quickActions) if (action.kind === "flow") addUse(action.value, `“${action.label}”`)
  for (const starter of settings.starters) addUse(starter.flowId, `“${starter.text}”`)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Conversation Flows"
        description="Guided conversations the assistant runs from quick actions, conversation starters, other flows, or when a visitor types one of a flow's triggers. Each step is a message with buttons that continue the conversation."
        breadcrumbs={[{ label: "Hosting Assistant", href: "/admin/assistant" }, { label: "Conversation Flows" }]}
        actions={<AssistantPreviewButton config={toPublicConfig(settings)} />}
      />
      <p className="rounded-lg bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
        Tips: the first step is where a flow starts. Buttons can go to another step, start another flow, show plans, run the plan recommendation, answer a question
        from your FAQs, open a page, or <strong>connect the visitor with your team</strong> — the assistant then asks their name, email, phone and requirement in the
        chat and sends the lead to Leads. A flow called <code className="font-mono text-xs">menu</code> is used as the assistant&apos;s list of main topics.
      </p>
      <AssistantFlowsEditor initial={settings.flows} usedBy={usedBy} />
    </div>
  )
}

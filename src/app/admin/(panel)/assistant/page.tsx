import type { Metadata } from "next"

import { AssistantPreviewButton } from "@/components/admin/assistant/assistant-preview"
import { AssistantGeneralForm, FlowEditor, QuickActionsEditor, StartersEditor } from "@/components/admin/assistant/assistant-settings-editors"
import { AssistantMigrationNotice, AssistantStatusToggle } from "@/components/admin/assistant/assistant-status"
import { PageHeader } from "@/components/admin/ui"
import { assistantTablesReady } from "@/lib/admin/assistant-queries"
import { requireAdmin } from "@/lib/admin/auth"
import { getAdminAssistantSettings } from "@/lib/assistant/server"
import { toPublicConfig } from "@/lib/assistant/settings"

export const metadata: Metadata = { title: "Hosting Assistant" }

export default async function AssistantSettingsPage() {
  await requireAdmin("assistant.manage")
  const [{ settings }, ready] = await Promise.all([getAdminAssistantSettings(), assistantTablesReady()])
  const { brandName, welcomeMessage, introMessage, avatarUrl, position, primaryColor, secondaryColor, typingDelayMs, autoOpenSeconds, visibility, pages } = settings

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Hosting Assistant"
        description="The website's Hosting & Website Solutions Assistant: answers hosting questions from your FAQs, recommends plans and turns conversations into leads."
        breadcrumbs={[{ label: "Hosting Assistant" }, { label: "Settings" }]}
      />
      <AssistantStatusToggle enabled={settings.enabled} preview={<AssistantPreviewButton config={toPublicConfig(settings)} />} />
      {ready ? null : <AssistantMigrationNotice />}
      <AssistantGeneralForm
        initial={{ brandName, welcomeMessage, introMessage, avatarUrl, position, primaryColor, secondaryColor, typingDelayMs, autoOpenSeconds, visibility, pages }}
      />
      <QuickActionsEditor initial={settings.quickActions} />
      <StartersEditor initial={settings.starters} actions={settings.quickActions} />
      <FlowEditor initial={settings.flow.steps} fallbackCategory={settings.flow.fallbackCategory} />
    </div>
  )
}

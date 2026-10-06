import { getLiveAssistantSettings } from "@/lib/assistant/server"
import { toPublicConfig } from "@/lib/assistant/settings"

import { AssistantLauncher } from "./assistant-launcher"

/**
 * Renders the Hosting Assistant when it's switched on in Admin → Hosting Assistant. When it's
 * off this returns nothing, so none of the widget's code is sent to the browser. The setting is
 * read through the website cache, which every dashboard save clears — no redeploy needed.
 */
export async function AssistantMount() {
  const settings = await getLiveAssistantSettings()
  if (!settings.enabled) return null
  return <AssistantLauncher config={toPublicConfig(settings)} />
}

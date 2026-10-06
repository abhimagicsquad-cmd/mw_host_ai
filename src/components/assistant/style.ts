import type { CSSProperties } from "react"

import { readableTextOn } from "@/lib/assistant/settings"
import type { PublicAssistantConfig } from "@/lib/assistant/types"

/** Colour variables for the widget, with text colours picked for contrast. */
export function assistantStyle(config: Pick<PublicAssistantConfig, "primaryColor" | "secondaryColor">): CSSProperties {
  return {
    "--aw-primary": config.primaryColor,
    "--aw-on-primary": readableTextOn(config.primaryColor),
    "--aw-secondary": config.secondaryColor,
    "--aw-on-secondary": readableTextOn(config.secondaryColor),
  } as CSSProperties
}

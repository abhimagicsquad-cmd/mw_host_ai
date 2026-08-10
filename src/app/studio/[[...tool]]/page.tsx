import type { Metadata } from "next"
import { metadata as studioMetadata, viewport } from "next-sanity/studio"

import { StudioClient } from "./studio-client"

export const metadata: Metadata = { ...studioMetadata, title: "Studio" }
export { viewport }

export default function StudioPage() {
  return <StudioClient />
}

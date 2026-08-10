"use client"

import { NextStudio } from "next-sanity/studio"

import config from "../../../../sanity.config"

/**
 * `sanity.config.ts` embeds many functions (validation rules, preview selectors) that can't
 * cross a Server → Client Component boundary as a prop, so `config` must be imported here,
 * inside the client module, rather than passed down from the (Server Component) page.
 */
export function StudioClient() {
  return <NextStudio config={config} />
}

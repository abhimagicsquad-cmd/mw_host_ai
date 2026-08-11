"use client"

import dynamic from "next/dynamic"

import config from "../../../../sanity.config"

/**
 * `sanity.config.ts` embeds many functions (validation rules, preview selectors) that can't
 * cross a Server → Client Component boundary as a prop, so `config` must be imported here,
 * inside the client module, rather than passed down from the (Server Component) page.
 *
 * NextStudio must be loaded with `ssr: false` — Sanity UI's compiled output relies on React's
 * compiler-injected `useMemoCache` dispatcher, which isn't present during Next's server render
 * pass and throws "Cannot read properties of null (reading 'useMemoCache')". Studio is a fully
 * client-rendered SPA regardless, so skipping SSR for it has no downside.
 */
const NextStudio = dynamic(() => import("next-sanity/studio").then((mod) => mod.NextStudio), { ssr: false })

export function StudioClient() {
  return <NextStudio config={config} />
}

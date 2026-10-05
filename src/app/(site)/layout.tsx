import type { Metadata } from "next"

import { CustomCodeBottom, CustomCodeTop } from "@/components/custom-code/custom-code"
import { SiteChrome } from "@/components/layout/site-chrome"
import { getSiteCustomCode } from "@/lib/custom-code/server"
import { parseOtherVerification, VERIFICATION_FIELDS } from "@/lib/custom-code/validate"

/** Verification Codes (Admin → Custom Code Manager), as <meta> tags in <head> of every website page. */
export async function generateMetadata(): Promise<Metadata> {
  const { verification } = await getSiteCustomCode()
  if (!verification.enabled) return {}
  const other: Record<string, string> = {}
  for (const field of VERIFICATION_FIELDS) {
    if (field.key !== "google" && verification[field.key]) other[field.metaName] = verification[field.key]
  }
  for (const tag of parseOtherVerification(verification.other).tags) other[tag.name] = tag.content
  if (!verification.google && !Object.keys(other).length) return {}
  return { verification: { ...(verification.google ? { google: verification.google } : {}), ...(Object.keys(other).length ? { other } : {}) } }
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CustomCodeTop />
      <SiteChrome>{children}</SiteChrome>
      <CustomCodeBottom />
    </>
  )
}

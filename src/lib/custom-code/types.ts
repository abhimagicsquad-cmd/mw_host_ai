/**
 * Custom Code Manager — sections, stored shapes and defaults. Client-safe (no server imports);
 * imports inside src/lib/custom-code stay relative so the validators can be tested outside Next.
 */

export const CODE_SECTIONS = ["head", "bodyStart", "footer", "css", "js"] as const
export type CodeSectionId = (typeof CODE_SECTIONS)[number]
export type SectionId = CodeSectionId | "tracking" | "verification"
export const SECTION_IDS: SectionId[] = [...CODE_SECTIONS, "tracking", "verification"]

export const isSectionId = (value: unknown): value is SectionId => SECTION_IDS.includes(value as SectionId)
export const isCodeSection = (value: SectionId): value is CodeSectionId => (CODE_SECTIONS as readonly string[]).includes(value)

export type SectionMeta = {
  label: string
  /** URL segment under /admin/code/. */
  slug: string
  description: string
  language: "html" | "css" | "js" | "fields"
  /** Max characters for code sections. */
  maxLength?: number
  placeholder?: string
}

export const SECTION_META: Record<SectionId, SectionMeta> = {
  head: {
    label: "Head Code",
    slug: "head",
    description:
      "Added to the <head> of every website page: verification meta tags, schema markup, analytics and other third-party scripts. Allowed tags: <script>, <noscript>, <meta>, <link> and <style>.",
    language: "html",
    maxLength: 50_000,
    placeholder: '<!-- e.g. -->\n<meta name="example-verification" content="abc123">\n<script async src="https://example.com/tag.js"></script>',
  },
  bodyStart: {
    label: "Body Start Code",
    slug: "body-start",
    description: "Added immediately after the opening <body> tag of every website page — e.g. the Google Tag Manager <noscript> fallback or marketing tools that must load first.",
    language: "html",
    maxLength: 50_000,
    placeholder: "<!-- e.g. a <noscript> tracking fallback -->",
  },
  footer: {
    label: "Footer Code",
    slug: "footer",
    description: "Added just before the closing </body> tag of every website page — live chat widgets, marketing scripts, conversion tracking and other third-party widgets.",
    language: "html",
    maxLength: 50_000,
    placeholder: "<!-- e.g. -->\n<script async src=\"https://widget.example.com/loader.js\"></script>",
  },
  css: {
    label: "Custom CSS",
    slug: "css",
    description: "Global CSS loaded on every website page, after the site's own styles — colour and typography tweaks, responsive fixes and temporary design adjustments.",
    language: "css",
    maxLength: 100_000,
    placeholder: "/* e.g. */\n.my-class {\n  color: #0b3b68;\n}",
  },
  js: {
    label: "Custom JavaScript",
    slug: "js",
    description: "Global JavaScript run on every website page once it has loaded — CTA and event tracking, marketing scripts, small UI interactions. Plain JavaScript only, without <script> tags.",
    language: "js",
    maxLength: 100_000,
    placeholder: "// e.g.\ndocument.addEventListener(\"click\", (event) => {\n  // …\n})",
  },
  tracking: {
    label: "Tracking Scripts",
    slug: "tracking",
    description: "Enter an ID and the correct tracking code is generated and added for you. Tracking runs on the live domain only, so previews and test builds don't pollute your data.",
    language: "fields",
  },
  verification: {
    label: "Verification Codes",
    slug: "verification",
    description: "Site-ownership verification meta tags, added to the <head> of every website page. Paste the code or the whole <meta> tag — the code is extracted automatically.",
    language: "fields",
  },
}

export const sectionBySlug = (slug: string) => SECTION_IDS.find((id) => SECTION_META[id].slug === slug)

export type CodeSectionState = { enabled: boolean; code: string }

export type TrackingState = {
  enabled: boolean
  gtmId: string
  ga4Id: string
  metaPixelId: string
  clarityId: string
  linkedinPartnerId: string
}

export type VerificationState = {
  enabled: boolean
  google: string
  bing: string
  facebook: string
  pinterest: string
  /** Extra verification <meta> tags, one per line. */
  other: string
}

export type SectionStateMap = {
  head: CodeSectionState
  bodyStart: CodeSectionState
  footer: CodeSectionState
  css: CodeSectionState
  js: CodeSectionState
  tracking: TrackingState
  verification: VerificationState
}

export type SectionState = SectionStateMap[SectionId]

/** Stored under settings key `custom_code`: the live state of each section. */
export type CustomCodeDocument = { sections: Partial<SectionStateMap> }

export type HistoryEntry = {
  id: string
  savedAt: string
  savedBy: string | null
  /** e.g. "Updated", "Disabled", "Reset", "Restored version from …" */
  note: string
  state: SectionState
}

export const HISTORY_LIMIT = 20

export const SETTINGS_KEY = "custom_code"
export const DRAFT_KEY = "custom_code_draft"
export const historyKey = (section: SectionId) => `custom_code_history.${section}`

const emptyCode = (): CodeSectionState => ({ enabled: true, code: "" })

/** Defaults: empty code; tracking starts from the IDs the site already ships with (src/lib/analytics.ts). */
export function defaultSectionState<S extends SectionId>(section: S, builtIn: { clarityId: string; ga4Id: string }): SectionStateMap[S] {
  const defaults: SectionStateMap = {
    head: emptyCode(),
    bodyStart: emptyCode(),
    footer: emptyCode(),
    css: emptyCode(),
    js: emptyCode(),
    tracking: { enabled: true, gtmId: "", ga4Id: builtIn.ga4Id, metaPixelId: "", clarityId: builtIn.clarityId, linkedinPartnerId: "" },
    verification: { enabled: true, google: "", bing: "", facebook: "", pinterest: "", other: "" },
  }
  return defaults[section]
}

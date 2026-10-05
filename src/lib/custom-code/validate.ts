/**
 * Validation, parsing and code generation for the Custom Code Manager. Pure functions — used by
 * the server actions (validation), the website mount (rendering) and the dashboard (previews).
 */
import type { CodeSectionId, CodeSectionState, SectionId, SectionStateMap, TrackingState, VerificationState } from "./types"
import { SECTION_META } from "./types"

// --- Head HTML → individual tags -------------------------------------------------------------

export type HeadNode = { tag: "script" | "noscript" | "meta" | "link" | "style"; attrs: Record<string, string | true>; content: string }

const HEAD_TAGS = new Set(["script", "noscript", "meta", "link", "style"])
const VOID_TAGS = new Set(["meta", "link"])
const ATTR = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g

function parseAttrs(source: string): Record<string, string | true> {
  const attrs: Record<string, string | true> = {}
  for (const match of source.matchAll(ATTR)) {
    const name = match[1].toLowerCase()
    attrs[name] = match[2] ?? match[3] ?? match[4] ?? true
  }
  return attrs
}

/**
 * Splits Head Code into its top-level tags. Only tags valid in <head> are accepted, so the
 * code can be placed there safely (React hoists <meta>, <link>, async scripts and styles).
 */
export function parseHeadHtml(html: string): { nodes: HeadNode[]; error?: string } {
  const nodes: HeadNode[] = []
  let i = 0
  const source = html
  while (i < source.length) {
    const rest = source.slice(i)
    const space = /^\s+/.exec(rest)
    if (space) {
      i += space[0].length
      continue
    }
    if (rest.startsWith("<!--")) {
      const end = source.indexOf("-->", i + 4)
      if (end < 0) return { nodes, error: "An HTML comment (<!-- … -->) isn't closed." }
      i = end + 3
      continue
    }
    const open = /^<([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^>]*?)?)\s*(\/?)>/.exec(rest)
    if (!open) {
      const snippet = rest.slice(0, 40).replace(/\s+/g, " ")
      return { nodes, error: `Head Code can only contain tags. Unexpected text: “${snippet}${rest.length > 40 ? "…" : ""}”` }
    }
    const tag = open[1].toLowerCase()
    if (!HEAD_TAGS.has(tag)) {
      return { nodes, error: `<${tag}> isn't allowed in Head Code (only <script>, <noscript>, <meta>, <link> and <style>). Put other HTML in Body Start or Footer Code.` }
    }
    const attrs = parseAttrs(open[2] ?? "")
    const handler = Object.keys(attrs).find((name) => name.startsWith("on"))
    if (handler) return { nodes, error: `Inline event attributes like ${handler}="…" aren't supported in Head Code — put that code inside the script instead.` }
    i += open[0].length
    let content = ""
    if (!VOID_TAGS.has(tag) && !open[3]) {
      const close = new RegExp(`</${tag}\\s*>`, "i").exec(source.slice(i))
      if (!close) return { nodes, error: `A <${tag}> tag isn't closed with </${tag}>.` }
      content = source.slice(i, i + close.index)
      i += close.index + close[0].length
    }
    if (tag === "link" && !attrs.href) return { nodes, error: "Every <link> tag needs an href." }
    if (tag === "meta" && !attrs.content && !attrs.charset) return { nodes, error: "Every <meta> tag needs a content attribute." }
    nodes.push({ tag: tag as HeadNode["tag"], attrs, content })
  }
  return { nodes }
}

/** HTML attribute → React prop name for the attributes head tags use. */
const REACT_ATTR: Record<string, string> = {
  class: "className",
  charset: "charSet",
  crossorigin: "crossOrigin",
  "http-equiv": "httpEquiv",
  referrerpolicy: "referrerPolicy",
  nomodule: "noModule",
  fetchpriority: "fetchPriority",
  hreflang: "hrefLang",
  itemprop: "itemProp",
}

export function toReactProps(attrs: Record<string, string | true>) {
  const props: Record<string, string | boolean> = {}
  for (const [name, value] of Object.entries(attrs)) {
    if (name === "nonce" || name.startsWith("on")) continue
    props[REACT_ATTR[name] ?? name] = value === true ? true : value
  }
  return props
}

// --- Section validation ----------------------------------------------------------------------

/** Neutralises `</style` so CSS can't close its own <style> element. */
export const sanitizeCss = (css: string) => css.replace(/<\/(style)/gi, "<\\/$1")

const DOCUMENT_TAG = /<\s*\/?\s*(html|head|body)\b/i

function validateCode(section: CodeSectionId, state: CodeSectionState): string | undefined {
  const max = SECTION_META[section].maxLength ?? 50_000
  if (state.code.length > max) return `${SECTION_META[section].label} is too long (${state.code.length.toLocaleString("en-IN")} of ${max.toLocaleString("en-IN")} characters).`
  if (section === "head") return parseHeadHtml(state.code).error
  if ((section === "bodyStart" || section === "footer") && DOCUMENT_TAG.test(state.code)) {
    return "Paste only the snippet itself — without <html>, <head> or <body> tags."
  }
  if (section === "css" && /<\s*script/i.test(state.code)) return "Custom CSS can't contain <script> tags."
  if (section === "js" && /^\s*<\s*script/i.test(state.code)) return "Paste the JavaScript only, without <script> tags — or use Head/Footer Code for HTML snippets."
  return undefined
}

export const TRACKING_FIELDS: { key: keyof Omit<TrackingState, "enabled">; label: string; pattern: RegExp; example: string; help: string }[] = [
  { key: "gtmId", label: "Google Tag Manager container ID", pattern: /^GTM-[A-Z0-9]{4,12}$/, example: "GTM-ABC1234", help: "Adds the GTM head script and the <noscript> fallback after <body>." },
  { key: "ga4Id", label: "Google Analytics 4 measurement ID", pattern: /^G-[A-Z0-9]{4,15}$/, example: "G-ABCDE12345", help: "Shares the site's existing gtag.js loader with Google Ads (loaded once)." },
  { key: "metaPixelId", label: "Meta Pixel ID", pattern: /^\d{8,20}$/, example: "123456789012345", help: "Adds the Meta (Facebook) Pixel base code with a PageView event." },
  { key: "clarityId", label: "Microsoft Clarity project ID", pattern: /^[a-z0-9]{6,20}$/, example: "r8jorr5igt", help: "Adds the Clarity tracking script (loaded after the page)." },
  { key: "linkedinPartnerId", label: "LinkedIn Insight Tag partner ID", pattern: /^\d{3,12}$/, example: "1234567", help: "Adds the LinkedIn Insight Tag." },
]

export const VERIFICATION_FIELDS: { key: keyof Omit<VerificationState, "enabled" | "other">; label: string; metaName: string; pattern: RegExp; example: string }[] = [
  { key: "google", label: "Google Search Console", metaName: "google-site-verification", pattern: /^[A-Za-z0-9_-]{10,100}$/, example: "abc123XYZ_-..." },
  { key: "bing", label: "Bing Webmaster Tools", metaName: "msvalidate.01", pattern: /^[A-Fa-f0-9]{32}$/, example: "0123456789ABCDEF0123456789ABCDEF" },
  { key: "facebook", label: "Facebook domain verification", metaName: "facebook-domain-verification", pattern: /^[a-z0-9]{20,40}$/, example: "abcdefghij0123456789abcd" },
  { key: "pinterest", label: "Pinterest", metaName: "p:domain_verify", pattern: /^[a-f0-9]{32}$/, example: "0123456789abcdef0123456789abcdef" },
]

/** Accepts a bare code or a pasted <meta … content="…"> tag; returns the code. */
export function extractVerificationCode(value: string) {
  const trimmed = value.trim()
  const fromTag = /content\s*=\s*["']([^"']+)["']/i.exec(trimmed)
  return (fromTag ? fromTag[1] : trimmed).trim()
}

/** "Other verification codes": one <meta name="…" content="…"> per line. */
export function parseOtherVerification(value: string): { tags: { name: string; content: string }[]; error?: string } {
  const tags: { name: string; content: string }[] = []
  for (const [index, line] of value.split("\n").entries()) {
    if (!line.trim()) continue
    const name = /name\s*=\s*["']([^"']+)["']/i.exec(line)?.[1]
    const content = /content\s*=\s*["']([^"']+)["']/i.exec(line)?.[1]
    if (!/^\s*<meta\b/i.test(line) || !name || !content) return { tags, error: `Line ${index + 1}: use one <meta name="…" content="…"> tag per line.` }
    if (!/^[A-Za-z0-9:._-]{1,80}$/.test(name) || content.length > 300) return { tags, error: `Line ${index + 1}: that meta tag name or content isn't valid.` }
    tags.push({ name, content })
  }
  if (tags.length > 20) return { tags, error: "Up to 20 extra verification tags." }
  return { tags }
}

const bool = (value: unknown, fallback: boolean) => (typeof value === "boolean" ? value : fallback)
const str = (value: unknown) => (typeof value === "string" ? value : "")

/**
 * Validates and normalises a submitted section. Returns the cleaned state or a user-facing error.
 * (The server action additionally syntax-checks Custom JavaScript.)
 */
export function validateSection<S extends SectionId>(section: S, raw: unknown): { state?: SectionStateMap[S]; error?: string } {
  const value = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {}
  if (section === "tracking") {
    const state: TrackingState = { enabled: bool(value.enabled, true), gtmId: "", ga4Id: "", metaPixelId: "", clarityId: "", linkedinPartnerId: "" }
    for (const field of TRACKING_FIELDS) {
      const input = str(value[field.key]).trim()
      const normalised = field.key === "gtmId" || field.key === "ga4Id" ? input.toUpperCase() : field.key === "clarityId" ? input.toLowerCase() : input
      if (normalised && !field.pattern.test(normalised)) return { error: `${field.label} doesn't look right (example: ${field.example}).` }
      state[field.key] = normalised
    }
    return { state: state as SectionStateMap[S] }
  }
  if (section === "verification") {
    const state: VerificationState = { enabled: bool(value.enabled, true), google: "", bing: "", facebook: "", pinterest: "", other: str(value.other).trim().slice(0, 5000) }
    for (const field of VERIFICATION_FIELDS) {
      const code = extractVerificationCode(str(value[field.key]))
      if (code && !field.pattern.test(code)) return { error: `${field.label}: that code doesn't look right — paste the code or the whole <meta> tag.` }
      state[field.key] = code
    }
    const other = parseOtherVerification(state.other)
    if (other.error) return { error: other.error }
    return { state: state as SectionStateMap[S] }
  }
  // Code sections keep the code exactly as typed (formatting preserved), only normalising line endings.
  const state: CodeSectionState = { enabled: bool(value.enabled, true), code: str(value.code).replace(/\r\n/g, "\n") }
  const error = validateCode(section as CodeSectionId, state)
  return error ? { error } : { state: state as SectionStateMap[S] }
}

// --- Generated tracking output ---------------------------------------------------------------

export type TrackingOutput = {
  /** Inline scripts, each with a stable id (next/script de-duplicates by id). */
  scripts: { id: string; code: string }[]
  /** <noscript> fallbacks placed right after <body>. */
  noscript: string
}

/** The snippets each tracker's own setup instructions specify, built from the IDs. */
export function buildTrackingOutput(state: TrackingState): TrackingOutput {
  const scripts: { id: string; code: string }[] = []
  const noscript: string[] = []
  if (!state.enabled) return { scripts, noscript: "" }
  const id = (value: string) => JSON.stringify(value)
  if (state.gtmId) {
    scripts.push({
      id: "mwh-gtm",
      code: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${id(state.gtmId)});`,
    })
    noscript.push(`<iframe src="https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(state.gtmId)}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`)
  }
  if (state.metaPixelId) {
    scripts.push({
      id: "mwh-meta-pixel",
      code: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${id(state.metaPixelId)});fbq('track','PageView');`,
    })
    noscript.push(`<img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=${encodeURIComponent(state.metaPixelId)}&amp;ev=PageView&amp;noscript=1">`)
  }
  if (state.linkedinPartnerId) {
    scripts.push({
      id: "mwh-linkedin-insight",
      code: `window._linkedin_partner_id=${id(state.linkedinPartnerId)};window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(window._linkedin_partner_id);(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];var b=document.createElement("script");b.type="text/javascript";b.async=true;b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";s.parentNode.insertBefore(b,s);})(window.lintrk);`,
    })
    noscript.push(`<img height="1" width="1" style="display:none" alt="" src="https://px.ads.linkedin.com/collect/?pid=${encodeURIComponent(state.linkedinPartnerId)}&amp;fmt=gif">`)
  }
  return { scripts, noscript: noscript.length ? `<noscript>${noscript.join("")}</noscript>` : "" }
}

// --- Version comparison ----------------------------------------------------------------------

export type DiffLine = { type: "same" | "added" | "removed"; text: string }

/** Line diff (LCS) for comparing two versions; long inputs fall back to a simple before/after. */
export function lineDiff(before: string, after: string): DiffLine[] {
  const a = before.split("\n")
  const b = after.split("\n")
  if (a.length * b.length > 4_000_000) return [...a.map((text) => ({ type: "removed" as const, text })), ...b.map((text) => ({ type: "added" as const, text }))]
  const lcs: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0))
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1])
  const out: DiffLine[] = []
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      out.push({ type: "same", text: a[i] })
      i++
      j++
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) out.push({ type: "removed", text: a[i++] })
    else out.push({ type: "added", text: b[j++] })
  }
  while (i < a.length) out.push({ type: "removed", text: a[i++] })
  while (j < b.length) out.push({ type: "added", text: b[j++] })
  return out
}

/** A section state as comparable text (structured sections become "field: value" lines). */
export function stateToText(state: unknown): string {
  if (!state || typeof state !== "object") return ""
  const value = state as Record<string, unknown>
  if (typeof value.code === "string") return `[${value.enabled === false ? "Disabled" : "Enabled"}]\n${value.code}`
  return Object.entries(value)
    .map(([key, v]) => `${key}: ${typeof v === "boolean" ? (v ? "on" : "off") : String(v ?? "")}`)
    .join("\n")
}

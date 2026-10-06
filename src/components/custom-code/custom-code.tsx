import { createElement } from "react"
import Script from "next/script"

import { AnalyticsScripts } from "@/components/common/analytics-scripts"
import { getSiteCustomCode } from "@/lib/custom-code/server"
import { buildTrackingOutput, parseHeadHtml, sanitizeCss, toReactProps, type HeadNode } from "@/lib/custom-code/validate"

/*
 * Admin → Custom Code Manager output, rendered on the public website only (never in the admin
 * dashboard, so a broken snippet can't lock admins out and third-party code never sees
 * dashboard data). Every section reads the same cached settings row; a dashboard save clears
 * the cache, so changes are live on the next request. Disabled sections render nothing.
 */

/** One Head Code tag. React 19 places <meta>, <link>, async external scripts and keyed <style>s in <head>. */
function HeadTag({ node, index }: { node: HeadNode; index: number }) {
  const props: Record<string, unknown> = { ...toReactProps(node.attrs) }
  switch (node.tag) {
    case "meta":
      return createElement("meta", props)
    case "link":
      // Stylesheets need a precedence to be placed in <head> (and are loaded once).
      return createElement("link", props.rel === "stylesheet" ? { ...props, precedence: "mwh-custom" } : props)
    case "style":
      return <style href={`mwh-head-style-${index}`} precedence="mwh-custom">{sanitizeCss(node.content)}</style>
    case "noscript":
      return <noscript dangerouslySetInnerHTML={{ __html: node.content }} />
    case "script":
      return props.src ? createElement("script", props) : createElement("script", { ...props, dangerouslySetInnerHTML: { __html: node.content } })
  }
}

/** Head Code, tracking <noscript> fallbacks and Body Start Code — the first thing in <body>. */
export async function CustomCodeTop() {
  const code = await getSiteCustomCode()
  const head = code.head.enabled && code.head.code.trim() ? parseHeadHtml(code.head.code).nodes : []
  const tracking = buildTrackingOutput(code.tracking)
  const bodyStart = code.bodyStart.enabled ? code.bodyStart.code.trim() : ""
  return (
    <>
      {head.map((node, index) => (
        <HeadTag key={index} node={node} index={index} />
      ))}
      {tracking.noscript ? <div data-mwh-code="tracking" className="contents" dangerouslySetInnerHTML={{ __html: tracking.noscript }} /> : null}
      {bodyStart ? <div data-mwh-code="body-start" className="contents" dangerouslySetInnerHTML={{ __html: bodyStart }} /> : null}
    </>
  )
}

/** Custom CSS, Custom JavaScript, tracking scripts and Footer Code — the end of <body>. */
export async function CustomCodeBottom() {
  const code = await getSiteCustomCode()
  const css = code.css.enabled ? code.css.code.trim() : ""
  const js = code.js.enabled ? code.js.code.trim() : ""
  const footer = code.footer.enabled ? code.footer.code.trim() : ""
  const tracking = code.tracking.enabled
    ? { ga4Id: code.tracking.ga4Id, clarityId: code.tracking.clarityId, scripts: buildTrackingOutput(code.tracking).scripts }
    : { ga4Id: "", clarityId: "", scripts: [] }
  return (
    <>
      {/* Keyed by href: placed in <head> after the site's own styles, and loaded once. */}
      {css ? (
        <style href="mwh-custom-css" precedence="mwh-custom">
          {sanitizeCss(css)}
        </style>
      ) : null}
      {footer ? <div data-mwh-code="footer" className="contents" dangerouslySetInnerHTML={{ __html: footer }} /> : null}
      {/* next/script runs it once per page load (de-duplicated by id), after the page is interactive. */}
      {js ? (
        <Script id="mwh-custom-js" strategy="afterInteractive">
          {js}
        </Script>
      ) : null}
      <AnalyticsScripts {...tracking} />
    </>
  )
}

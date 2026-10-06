"use client"

import { useSyncExternalStore } from "react"
import Script from "next/script"

import { analyticsConfig, isAnalyticsEnabled } from "@/lib/analytics"

const noopSubscribe = () => () => {}

export type TrackingProps = {
  /** From Admin → Custom Code Manager → Tracking Scripts (built-in defaults until saved). */
  ga4Id: string
  clarityId: string
  /** Generated GTM / Meta Pixel / LinkedIn snippets, each with a stable id. */
  scripts: { id: string; code: string }[]
}

/**
 * Google Ads (gtag, the WordPress site's conversion tracking) plus the trackers managed in the
 * Custom Code Manager. Decided on the client (live host only, see isAnalyticsEnabled), so server
 * and first client render agree and nothing loads on previews. Every script has a stable id, so
 * next/script loads each one once — gtag.js is shared by Google Ads and GA4.
 */
export function AnalyticsScripts({ ga4Id, clarityId, scripts }: TrackingProps) {
  const enabled = useSyncExternalStore(noopSubscribe, isAnalyticsEnabled, () => false)
  if (!enabled) return null

  const gtagIds = [analyticsConfig.googleAdsId, ga4Id].filter(Boolean)

  return (
    <>
      {gtagIds.length ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtagIds[0]}`} strategy="afterInteractive" />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());${gtagIds
              .map((id) => `gtag('config',${JSON.stringify(id)});`)
              .join("")}`}
          </Script>
        </>
      ) : null}
      {clarityId ? (
        <Script id="clarity-init" strategy="lazyOnload">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script",${JSON.stringify(clarityId)});`}
        </Script>
      ) : null}
      {scripts.map((script) => (
        <Script key={script.id} id={script.id} strategy="afterInteractive">
          {script.code}
        </Script>
      ))}
    </>
  )
}

"use client"

import { useSyncExternalStore } from "react"
import Script from "next/script"

import { analyticsConfig, isAnalyticsEnabled } from "@/lib/analytics"

const noopSubscribe = () => () => {}

/**
 * Google Ads (gtag), Microsoft Clarity and Tidio live chat — the tracking and chat the
 * WordPress site loads on every page. Decided on the client (live host only, see
 * isAnalyticsEnabled), so server and first client render agree and nothing loads on previews.
 */
export function AnalyticsScripts() {
  const enabled = useSyncExternalStore(noopSubscribe, isAnalyticsEnabled, () => false)
  if (!enabled) return null

  const { googleAdsId, ga4Id, clarityId, tidioKey } = analyticsConfig
  const gtagIds = [googleAdsId, ga4Id].filter(Boolean)

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
      {tidioKey ? <Script src={`https://code.tidio.co/${tidioKey}.js`} strategy="lazyOnload" /> : null}
    </>
  )
}

import { ImageResponse } from "next/og"

import { siteConfig } from "@/constants/site-config"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#1c2329",
          backgroundImage: "linear-gradient(135deg, #2a363f 0%, #1c2329 70%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 18,
              backgroundColor: "#ff6600",
              color: "#ffffff",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            MW
          </div>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "#ffffff" }}>
            Magic<span style={{ color: "#ff6600" }}>Works</span>&nbsp;Host
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 48, fontSize: 56, fontWeight: 700, color: "#ffffff", maxWidth: 900, lineHeight: 1.15 }}>
          {siteConfig.tagline}
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 26, color: "rgba(255,255,255,0.7)", maxWidth: 820 }}>
          {siteConfig.description}
        </div>
      </div>
    ),
    { ...size }
  )
}

import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { ImageResponse } from "next/og"

import { siteConfig } from "@/constants/site-config"

/**
 * Default social-sharing image for every page (1200×630). Built from the real brand assets:
 * the MagicWorks Host mark (512px, shown crisp at 220px) and the full logo at native size.
 * Pages without their own share image point og:image / twitter:image here (see lib/seo.ts).
 */
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`

const root = process.cwd()
const [geistRegular, geistBold, mark, logo] = await Promise.all([
  readFile(join(root, "src/assets/fonts/Geist-Regular.ttf")),
  readFile(join(root, "src/assets/fonts/Geist-Bold.ttf")),
  readFile(join(root, "public/images/mwh-mark.png")),
  readFile(join(root, "public/images/logo-magicworkshost-best-web-hosting-300.png")),
])
const dataUrl = (png: Buffer) => `data:image/png;base64,${png.toString("base64")}`

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", backgroundColor: "#ffffff", fontFamily: "Geist" }}>
        <div style={{ width: 24, height: "100%", display: "flex", backgroundColor: "#ff6600" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "70px 80px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- ImageResponse renders to PNG, not the DOM */}
            <img src={dataUrl(mark)} width={220} height={220} />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", fontSize: 64, fontWeight: 700, color: "#2a363f", letterSpacing: -1 }}>{siteConfig.name}</div>
              <div style={{ display: "flex", fontSize: 36, fontWeight: 700, color: "#c2410c", maxWidth: 640, lineHeight: 1.2 }}>{siteConfig.tagline}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "2px solid #f1f1f1", paddingTop: 36 }}>
            <div style={{ display: "flex", fontSize: 26, color: "#4b5563", maxWidth: 720, lineHeight: 1.35 }}>
              NVMe web hosting, VPS, dedicated servers, domains, SSL and business email — with 24/7 support.
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- ImageResponse renders to PNG, not the DOM */}
            <img src={dataUrl(logo)} width={300} height={60} />
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: geistRegular, weight: 400, style: "normal" },
        { name: "Geist", data: geistBold, weight: 700, style: "normal" },
      ],
    }
  )
}

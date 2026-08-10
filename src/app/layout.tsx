import type { Metadata, Viewport } from "next"

import { siteConfig } from "@/constants/site-config"
import { bodyFont, headingFont } from "@/lib/fonts"

import "./globals.css"

const defaultTitle = `${siteConfig.name} | ${siteConfig.tagline}`

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: defaultTitle,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: defaultTitle,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: siteConfig.description,
  },
}

export const viewport: Viewport = {
  themeColor: "#2a363f",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable} antialiased`}>{children}</body>
    </html>
  )
}

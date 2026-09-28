import type { Metadata, Viewport } from "next"

import { siteConfig } from "@/constants/site-config"
import { getCmsWebsiteSettings } from "@/lib/cms/content"
import { geist } from "@/lib/fonts"

import "./globals.css"

const defaultTitle = `${siteConfig.name} | ${siteConfig.tagline}`

/**
 * Site-wide defaults; "Default SEO" in /admin/settings/website overrides the title and
 * description. The default share image stays file-based (app/opengraph-image.tsx), which
 * Next.js gives priority over metadata at this level.
 */
export async function generateMetadata(): Promise<Metadata> {
  const website = await getCmsWebsiteSettings()
  const title = website.defaultMetaTitle?.trim() || defaultTitle
  const description = website.defaultMetaDescription?.trim() || siteConfig.description

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: title,
      template: `%s | ${siteConfig.name}`,
    },
    description,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title,
      description,
      url: siteConfig.url,
      siteName: siteConfig.name,
      type: "website",
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export const viewport: Viewport = {
  themeColor: "#2a363f",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="antialiased">{children}</body>
    </html>
  )
}

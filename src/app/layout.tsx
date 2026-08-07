import type { Metadata } from "next"

import { MotionProvider } from "@/components/common/motion-provider"
import { Footer } from "@/components/layout/footer/footer"
import { Header } from "@/components/layout/header/header"
import { TooltipProvider } from "@/components/ui/tooltip"
import { siteConfig } from "@/constants/site-config"
import { bodyFont, headingFont } from "@/lib/fonts"

import "./globals.css"

export const metadata: Metadata = {
  title: `${siteConfig.name} | ${siteConfig.tagline}`,
  description: siteConfig.description,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable} antialiased`}>
        <MotionProvider>
          <TooltipProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </TooltipProvider>
        </MotionProvider>
      </body>
    </html>
  )
}

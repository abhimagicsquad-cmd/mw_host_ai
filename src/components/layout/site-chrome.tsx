import { AssistantMount } from "@/components/assistant/assistant-mount"
import { FloatingContact } from "@/components/common/floating-contact"
import { LeadAutoPopup } from "@/components/common/lead-auto-popup"
import { PreviewBanner } from "@/components/common/preview-banner"
import { Footer } from "@/components/layout/footer/footer"
import { Header } from "@/components/layout/header/header"
import { MainHeader } from "@/components/layout/header/main-header"
import { TopBar } from "@/components/layout/header/top-bar"
import { LogoCloud } from "@/components/sections/logo-cloud"
import { clientLogos } from "@/constants/client-logos"

/**
 * The public website's frame: skip link, header, main, footer and floating widgets. Used by the
 * site layout (which adds the Custom Code Manager output around it) and by the 404 page (which
 * doesn't — see src/app/not-found.tsx).
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-brand-navy focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>
      <Header>
        <TopBar />
        <MainHeader />
      </Header>
      <main id="main-content" tabIndex={-1} className="outline-none">
        {children}
      </main>
      {/* The WordPress "Trusted By" strip, above the footer on every page. */}
      <LogoCloud title="Trusted by" logos={clientLogos} />
      <Footer />
      <PreviewBanner />
      <FloatingContact />
      <LeadAutoPopup />
      <AssistantMount />
    </>
  )
}

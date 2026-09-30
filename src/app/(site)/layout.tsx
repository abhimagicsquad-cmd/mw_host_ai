import { LeadAutoPopup } from "@/components/common/lead-auto-popup"
import { PreviewBanner } from "@/components/common/preview-banner"
import { Footer } from "@/components/layout/footer/footer"
import { Header } from "@/components/layout/header/header"
import { MainHeader } from "@/components/layout/header/main-header"
import { TopBar } from "@/components/layout/header/top-bar"

export default function SiteLayout({ children }: { children: React.ReactNode }) {
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
      <Footer />
      <PreviewBanner />
      <LeadAutoPopup />
    </>
  )
}

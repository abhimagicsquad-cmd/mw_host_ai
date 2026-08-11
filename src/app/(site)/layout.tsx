import { Footer } from "@/components/layout/footer/footer"
import { Header } from "@/components/layout/header/header"
import { MainHeader } from "@/components/layout/header/main-header"
import { TopBar } from "@/components/layout/header/top-bar"

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header>
        <TopBar />
        <MainHeader />
      </Header>
      <main>{children}</main>
      <Footer />
    </>
  )
}

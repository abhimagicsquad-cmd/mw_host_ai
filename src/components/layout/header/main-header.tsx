import Link from "@/components/common/site-link"
import { Search } from "lucide-react"

import { LeadCTAButton } from "@/components/common/lead-cta-button"
import { Logo } from "@/components/common/logo"
import { mainNav } from "@/constants/nav-items"
import { withAddedNavItems } from "@/lib/nav-augment"
import { toNavItems } from "@/lib/nav-mapper"
import { getNavigation, getSiteSettings } from "@/lib/cms/queries"

import { MobileNav } from "./mobile-nav"
import { NavMenu } from "./nav-menu"

export async function MainHeader() {
  const [settings, navigation] = await Promise.all([getSiteSettings(), getNavigation()])
  const headerCtaLabel = settings?.headerCta?.label ?? "Get Started"
  const navItems = withAddedNavItems(navigation?.mainMenu?.length ? toNavItems(navigation.mainMenu) : mainNav)

  return (
    <div className="border-b border-border-alt bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Logo />

        {/* Full menu from xl (1280px): below that the ten menu items squeeze the logo, so
            1024–1279px uses the same menu button as tablets and phones. */}
        <div className="hidden xl:block">
          <NavMenu items={navItems} />
        </div>

        <div className="hidden items-center gap-3 xl:flex">
          <Link
            href="/search"
            aria-label="Search the site"
            className="flex size-9 items-center justify-center rounded-full text-brand-navy transition-colors hover:bg-surface-alt"
          >
            <Search className="size-4.5" />
          </Link>
          <LeadCTAButton source="header" size="sm">
            {headerCtaLabel}
          </LeadCTAButton>
        </div>

        <div className="xl:hidden">
          <MobileNav items={navItems} />
        </div>
      </div>
    </div>
  )
}

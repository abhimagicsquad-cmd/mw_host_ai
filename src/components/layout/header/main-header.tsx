import Link from "next/link"
import { Search } from "lucide-react"

import { LeadCTAButton } from "@/components/common/lead-cta-button"
import { Logo } from "@/components/common/logo"
import { mainNav } from "@/constants/nav-items"
import { toNavItems } from "@/lib/nav-mapper"
import { getNavigation, getSiteSettings } from "@/sanity/lib/queries"

import { MobileNav } from "./mobile-nav"
import { NavMenu } from "./nav-menu"

export async function MainHeader() {
  const [settings, navigation] = await Promise.all([getSiteSettings(), getNavigation()])
  const headerCtaLabel = settings?.headerCta?.label ?? "Get Started"
  const navItems = navigation?.mainMenu?.length ? toNavItems(navigation.mainMenu) : mainNav

  return (
    <div className="border-b border-border-alt bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Logo />

        <div className="hidden lg:block">
          <NavMenu items={navItems} />
        </div>

        <div className="hidden items-center gap-3 lg:flex">
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

        <div className="lg:hidden">
          <MobileNav items={navItems} />
        </div>
      </div>
    </div>
  )
}

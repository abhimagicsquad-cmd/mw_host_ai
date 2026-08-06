import { CTAButton } from "@/components/common/cta-button"
import { Logo } from "@/components/common/logo"
import { mainNav } from "@/constants/nav-items"

import { MobileNav } from "./mobile-nav"
import { NavMenu } from "./nav-menu"

export function MainHeader() {
  return (
    <div className="border-b border-border-alt bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Logo />

        <div className="hidden lg:block">
          <NavMenu items={mainNav} />
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <CTAButton href="/contact-us" size="sm">
            Get Started
          </CTAButton>
        </div>

        <div className="lg:hidden">
          <MobileNav items={mainNav} />
        </div>
      </div>
    </div>
  )
}

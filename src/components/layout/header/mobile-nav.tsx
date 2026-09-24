"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Phone } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { CTAButton } from "@/components/common/cta-button"
import { Logo } from "@/components/common/logo"
import { siteConfig } from "@/constants/site-config"
import { resolveIcon } from "@/lib/icon-map"
import { getActiveNav } from "@/lib/nav-active"
import { cn } from "@/lib/utils"
import type { NavItem } from "@/types/nav"

type MobileNavProps = {
  items: NavItem[]
}

export function MobileNav({ items }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const active = useMemo(() => getActiveNav(items, pathname), [items, pathname])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" aria-label="Open menu" />}
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-sm">
        <SheetHeader className="border-b border-border px-4 py-3">
          <Logo />
          <SheetTitle className="sr-only">Site navigation</SheetTitle>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {/* The group holding the current page starts expanded so its active link is visible. */}
          <Accordion multiple defaultValue={active.linkHref && active.itemLabel ? [active.itemLabel] : []}>
            {items.map((item) =>
              item.columns ? (
                <AccordionItem key={item.label} value={item.label}>
                  <AccordionTrigger
                    className={cn("px-2", active.itemLabel === item.label && "text-brand-orange")}
                  >
                    {item.label}
                  </AccordionTrigger>
                  <AccordionContent className="px-2">
                    <ul className="flex flex-col gap-1">
                      {item.columns.flatMap((column) => column.links).map((link) => {
                        const LinkIcon = resolveIcon(link.icon)
                        const isActive =
                          active.itemLabel === item.label && active.linkHref === link.href
                        return (
                          <li key={link.href}>
                            <SheetClose
                              nativeButton={false}
                              render={
                                <Link
                                  href={link.href}
                                  aria-current={isActive ? "page" : undefined}
                                  className={cn(
                                    "flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted",
                                    // `!` beats AccordionContent's `[&_a]:hover:text-foreground`.
                                    isActive && "font-medium text-brand-orange hover:text-brand-orange!"
                                  )}
                                />
                              }
                            >
                              {LinkIcon ? <LinkIcon className="size-4 text-brand-orange" /> : null}
                              {link.label}
                            </SheetClose>
                          </li>
                        )
                      })}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ) : (
                <div key={item.label} className="border-b py-1">
                  <SheetClose
                    nativeButton={false}
                    render={
                      <Link
                        href={item.href ?? "#"}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                        aria-current={active.itemLabel === item.label ? "page" : undefined}
                        className={cn(
                          "block px-2 py-2.5 text-sm font-medium",
                          active.itemLabel === item.label && "text-brand-orange"
                        )}
                      />
                    }
                  >
                    {item.label}
                  </SheetClose>
                </div>
              )
            )}
          </Accordion>
        </nav>

        <div className="flex flex-col gap-3 border-t border-border p-4">
          <a
            href={siteConfig.contact.phoneHref}
            className="flex items-center gap-2 text-sm font-medium text-brand-navy"
          >
            <Phone className="size-4 text-brand-orange" />
            {siteConfig.contact.phone}
          </a>
          <CTAButton href="/contact-us" className="w-full justify-center" onClick={() => setOpen(false)}>
            Get Started
          </CTAButton>
        </div>
      </SheetContent>
    </Sheet>
  )
}

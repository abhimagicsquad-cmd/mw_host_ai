"use client"

import { useState } from "react"
import Link from "next/link"
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
import type { NavItem } from "@/types/nav"

type MobileNavProps = {
  items: NavItem[]
}

export function MobileNav({ items }: MobileNavProps) {
  const [open, setOpen] = useState(false)

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
          <Accordion multiple>
            {items.map((item) =>
              item.columns ? (
                <AccordionItem key={item.label} value={item.label}>
                  <AccordionTrigger className="px-2">{item.label}</AccordionTrigger>
                  <AccordionContent className="px-2">
                    <ul className="flex flex-col gap-1">
                      {item.columns.flatMap((column) => column.links).map((link) => (
                        <li key={link.href}>
                          <SheetClose
                            nativeButton={false}
                            render={
                              <Link
                                href={link.href}
                                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted"
                              />
                            }
                          >
                            {link.icon ? <link.icon className="size-4 text-brand-orange-accessible" /> : null}
                            {link.label}
                          </SheetClose>
                        </li>
                      ))}
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
                        className="block px-2 py-2.5 text-sm font-medium"
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
            <Phone className="size-4 text-brand-orange-accessible" />
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

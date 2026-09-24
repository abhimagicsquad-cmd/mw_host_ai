"use client"

import { useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { resolveIcon } from "@/lib/icon-map"
import { getActiveNav } from "@/lib/nav-active"
import { cn } from "@/lib/utils"
import type { NavItem } from "@/types/nav"

type NavMenuProps = {
  items: NavItem[]
}

export function NavMenu({ items }: NavMenuProps) {
  const pathname = usePathname()
  const active = useMemo(() => getActiveNav(items, pathname), [items, pathname])

  return (
    <NavigationMenu className="max-w-none">
      <NavigationMenuList>
        {items.map((item) =>
          item.columns ? (
            <NavigationMenuItem key={item.label}>
              <NavigationMenuTrigger
                className={cn(active.itemLabel === item.label && "text-brand-orange")}
              >
                {item.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="flex gap-6 p-6">
                  {item.columns.map((column, columnIndex) => (
                    <div key={column.heading ?? columnIndex} className="flex w-56 flex-col gap-1">
                      {column.heading ? (
                        <p className="px-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                          {column.heading}
                        </p>
                      ) : null}
                      <ul className="flex flex-col">
                        {column.links.map((link) => {
                          const LinkIcon = resolveIcon(link.icon)
                          const isActive =
                            active.itemLabel === item.label && active.linkHref === link.href
                          return (
                            <li key={link.href}>
                              <NavigationMenuLink
                                active={isActive}
                                render={<Link href={link.href} />}
                                className={cn(isActive && "font-medium text-brand-orange")}
                              >
                                {LinkIcon ? <LinkIcon className="text-brand-orange" /> : null}
                                {link.label}
                              </NavigationMenuLink>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))}
                  {item.featured ? (
                    <div className="flex w-60 flex-col gap-2 rounded-lg bg-surface-alt p-4">
                      {(() => {
                        const FeaturedIcon = resolveIcon(item.featured.icon)
                        return FeaturedIcon ? <FeaturedIcon className="size-5 text-brand-orange" /> : null
                      })()}
                      <p className="text-sm font-semibold text-brand-navy">
                        {item.featured.title}
                      </p>
                      {item.featured.description ? (
                        <p className="text-xs text-muted-foreground">{item.featured.description}</p>
                      ) : null}
                      <Link
                        href={item.featured.href}
                        className="mt-auto text-sm font-medium text-brand-orange hover:underline"
                      >
                        Learn more →
                      </Link>
                    </div>
                  ) : null}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ) : (
            <NavigationMenuItem key={item.label}>
              <NavigationMenuLink
                render={
                  <Link
                    href={item.href ?? "#"}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                  />
                }
                active={active.itemLabel === item.label}
                className={cn(
                  navigationMenuTriggerStyle(),
                  active.itemLabel === item.label && "text-brand-orange"
                )}
              >
                {item.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          )
        )}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

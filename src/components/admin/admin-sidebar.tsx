"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Activity,
  ChevronDown,
  FileText,
  FormInput,
  Image as ImageIcon,
  LayoutDashboard,
  type LucideIcon,
  Menu as MenuIcon,
  PenSquare,
  Search,
  Settings,
  Users,
} from "lucide-react"

import { can } from "@/lib/admin/permissions"
import type { AdminRole } from "@/lib/cms/types"
import { cn } from "@/lib/utils"

import { adminNav, type AdminNavIcon, type AdminNavItem } from "./nav-config"

const ICONS: Record<AdminNavIcon, LucideIcon> = {
  dashboard: LayoutDashboard,
  pages: FileText,
  content: PenSquare,
  media: ImageIcon,
  seo: Search,
  menus: MenuIcon,
  forms: FormInput,
  users: Users,
  settings: Settings,
  activity: Activity,
}

/** Longest-prefix match so /admin/pages/new highlights "Add New Page", not "All Pages". */
function useActiveHref(items: AdminNavItem[]) {
  const pathname = usePathname()
  const hrefs = items.flatMap((item) => [item.href, ...(item.children?.map((c) => c.href) ?? [])]).filter(Boolean) as string[]
  return hrefs
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0]
}

export function AdminSidebarNav({ role, onNavigate }: { role: AdminRole; onNavigate?: () => void }) {
  const items = adminNav
    .filter((item) => !item.permission || can(role, item.permission))
    .map((item) => ({ ...item, children: item.children?.filter((child) => !child.permission || can(role, child.permission)) }))
  const activeHref = useActiveHref(items)
  const activeGroup = items.find((item) => item.children?.some((child) => child.href === activeHref))?.label
  const [open, setOpen] = useState<Record<string, boolean>>(() => (activeGroup ? { [activeGroup]: true } : {}))

  return (
    <nav aria-label="Admin" className="flex flex-col gap-0.5 px-3 py-4">
      {items.map((item) => {
        const Icon = ICONS[item.icon]
        const baseClass =
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-admin-sidebar-foreground transition-colors hover:bg-admin-sidebar-hover hover:text-white"

        if (item.href) {
          const active = activeHref === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(baseClass, active && "bg-admin-sidebar-active text-white")}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          )
        }

        const isOpen = open[item.label] ?? item.label === activeGroup
        const groupId = `admin-nav-${item.label.replace(/\W+/g, "-").toLowerCase()}`
        return (
          <div key={item.label}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={groupId}
              onClick={() => setOpen((prev) => ({ ...prev, [item.label]: !isOpen }))}
              className={cn(baseClass, item.label === activeGroup && "text-white")}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronDown className={cn("size-4 shrink-0 opacity-60 transition-transform", isOpen && "rotate-180")} aria-hidden />
            </button>
            {isOpen ? (
              <ul id={groupId} className="mt-0.5 mb-1 ml-5 flex flex-col gap-0.5 border-l border-white/10 pl-3">
                {item.children?.map((child) => {
                  const active = activeHref === child.href
                  return (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "relative block rounded-md px-3 py-1.5 text-[13px] text-admin-sidebar-muted transition-colors hover:bg-admin-sidebar-hover hover:text-white",
                          active && "bg-admin-sidebar-active font-medium text-white before:absolute before:top-1.5 before:bottom-1.5 before:-left-[13px] before:w-0.5 before:rounded-full before:bg-admin-secondary"
                        )}
                      >
                        {child.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </div>
        )
      })}
    </nav>
  )
}

export function AdminBrand() {
  return (
    <Link href="/admin/dashboard" className="flex items-center gap-2.5 px-6 py-5">
      <span className="flex size-9 items-center justify-center rounded-lg bg-admin-secondary text-sm font-bold text-white shadow-sm">MW</span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-semibold text-white">MagicWorks Host</span>
        <span className="text-[11px] font-medium tracking-wide text-admin-sidebar-muted uppercase">Content Manager</span>
      </span>
    </Link>
  )
}

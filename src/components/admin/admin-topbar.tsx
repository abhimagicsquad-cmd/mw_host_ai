"use client"

import Link from "next/link"
import { useState } from "react"
import { ExternalLink, KeyRound, LogOut, Menu } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { logoutAction } from "@/lib/admin/actions/auth"
import { ROLE_LABELS } from "@/lib/admin/permissions"
import type { AdminRole } from "@/lib/cms/types"

import { AdminBrand, AdminSidebarNav } from "./admin-sidebar"
import { ThemeToggle } from "./admin-theme"

type TopbarProps = {
  user: { username: string; fullName: string | null; role: AdminRole }
  dark: boolean
}

function initials(name: string) {
  return name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase())
    .slice(0, 2)
    .join("")
}

export function AdminTopbar({ user, dark }: TopbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const displayName = user.fullName || user.username

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/85 px-4 backdrop-blur supports-backdrop-filter:bg-card/70 sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
        <Menu />
      </Button>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 gap-0 overflow-y-auto border-none bg-admin-sidebar p-0 text-admin-sidebar-foreground">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <AdminBrand />
          <AdminSidebarNav role={user.role} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex-1" />

      <a href="/" target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
        <ExternalLink />
        <span className="hidden sm:inline">View website</span>
      </a>
      <ThemeToggle initialDark={dark} />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="flex items-center gap-2.5 rounded-lg py-1 pr-2 pl-1 text-left transition-colors hover:bg-muted"
              aria-label="Account menu"
            />
          }
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {initials(displayName)}
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-sm font-medium">{displayName}</span>
            <span className="text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</span>
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Signed in as {user.username}</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/admin/profile" />}>
            <KeyRound />
            Profile & password
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => logoutAction()}>
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

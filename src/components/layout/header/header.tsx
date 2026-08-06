"use client"

import { useStickyHeader } from "@/hooks/use-sticky-header"
import { cn } from "@/lib/utils"

import { MainHeader } from "./main-header"
import { TopBar } from "./top-bar"

export function Header() {
  const isScrolled = useStickyHeader()

  return (
    <header className={cn("sticky top-0 z-40 w-full", isScrolled && "shadow-sm")}>
      <TopBar />
      <MainHeader />
    </header>
  )
}

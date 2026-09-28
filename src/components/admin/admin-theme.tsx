"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

export const ADMIN_THEME_COOKIE = "mwh_admin_theme"

/**
 * Mirrors the admin theme classes onto <html> while the admin is mounted, so portalled
 * popups (dialogs, dropdowns, sheets — rendered outside the admin wrapper) get the admin
 * tokens and dark mode too. Removed again on unmount so the public site is unaffected.
 */
export function AdminThemeSync({ dark }: { dark: boolean }) {
  useEffect(() => {
    const root = document.documentElement
    root.classList.add("admin-theme")
    root.classList.toggle("dark", dark)
    return () => {
      root.classList.remove("admin-theme", "dark")
    }
  }, [dark])
  return null
}

/** Theme is persisted in a cookie so the server renders the right class — no flash, no hydration mismatch. */
export function ThemeToggle({ initialDark }: { initialDark: boolean }) {
  const [dark, setDark] = useState(initialDark)

  function toggle() {
    const next = !dark
    setDark(next)
    document.cookie = `${ADMIN_THEME_COOKIE}=${next ? "dark" : "light"}; path=/admin; max-age=31536000; samesite=lax`
    document.documentElement.classList.toggle("dark", next)
    document.getElementById("admin-root")?.classList.toggle("dark", next)
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
      {dark ? <Sun /> : <Moon />}
    </Button>
  )
}

import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { FileText, Image as ImageIcon, Search, ShieldCheck } from "lucide-react"

import { LoginForm } from "@/components/admin/login-form"
import { TwoFactorLoginForm } from "@/components/admin/two-factor-login-form"
import { getCurrentAdmin } from "@/lib/admin/auth"
import { getPendingTwoFactor } from "@/lib/admin/session-cookie"

export const metadata: Metadata = { title: "Sign in" }

const highlights = [
  { icon: FileText, label: "Build and publish pages with a visual section builder" },
  { icon: ImageIcon, label: "Manage images, icons and documents in one library" },
  { icon: Search, label: "Control meta tags, Open Graph and schema per page" },
  { icon: ShieldCheck, label: "Role-based access with a full activity audit trail" },
]

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getCurrentAdmin()) redirect("/admin/dashboard")
  const { next } = await searchParams
  // Password accepted, code still to come (a signed, 5-minute token — see loginAction).
  const pending = await getPendingTwoFactor()

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden bg-[#0b3b68] p-12 text-white lg:flex lg:flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-40 size-[520px] rounded-full bg-[#f47c45]/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:44px_44px]"
        />
        <div className="relative flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-[#f47c45] text-sm font-bold">MW</span>
          <span className="text-lg font-semibold">MagicWorks Host</span>
        </div>
        <div className="relative mt-auto max-w-md">
          <p className="text-sm font-semibold tracking-wider text-[#f9a37b] uppercase">Content Manager</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Run the entire website from one dashboard.</h1>
          <ul className="mt-8 flex flex-col gap-4">
            {highlights.map((item) => (
              <li key={item.label} className="flex items-start gap-3 text-sm text-white/80">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <item.icon className="size-4" aria-hidden />
                </span>
                <span className="pt-1.5">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative mt-12 text-xs text-white/50">© {new Date().getFullYear()} MagicWorks IT Solutions</p>
      </div>

      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-lg bg-admin-secondary text-sm font-bold text-white">MW</span>
            <span className="text-lg font-semibold">MagicWorks Host</span>
          </div>
          {pending ? (
            <>
              <h2 className="text-2xl font-semibold tracking-tight">Two-factor authentication</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">One more step to keep the admin secure.</p>
              <TwoFactorLoginForm username={pending.username} />
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold tracking-tight">Sign in to the admin</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">Use your CMS administrator account.</p>
              <LoginForm next={next} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

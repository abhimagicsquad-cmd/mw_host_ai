import Image from "next/image"
import Link from "next/link"

import { siteConfig } from "@/constants/site-config"
import { cn } from "@/lib/utils"

type LogoProps = {
  variant?: "dark" | "light"
  className?: string
}

/**
 * "dark" variant renders the real brand logo (dark wordmark, for light
 * backgrounds — header, mobile drawer). "light" has no reversed/white
 * source asset yet, so it falls back to a text wordmark for dark
 * backgrounds (footer) until one is exported.
 */
export function Logo({ variant = "dark", className }: LogoProps) {
  if (variant === "dark") {
    return (
      <Link href="/" className={cn("flex items-center", className)}>
        <Image
          src="/images/logo-magicworkshost-best-web-hosting-300.png"
          alt={siteConfig.name}
          width={300}
          height={60}
          className="h-8 w-auto"
          priority
        />
      </Link>
    )
  }

  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2 text-xl font-bold tracking-tight text-white", className)}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-brand-orange text-sm text-white">
        MW
      </span>
      <span>
        Magic<span className="text-brand-orange">Works</span> Host
      </span>
      <span className="sr-only">{siteConfig.name}</span>
    </Link>
  )
}

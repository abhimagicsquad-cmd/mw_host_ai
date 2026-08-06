import Link from "next/link"
import { Phone, LifeBuoy, LogIn } from "lucide-react"

import { siteConfig, socialLinks } from "@/constants/site-config"

export function TopBar() {
  return (
    <div className="hidden bg-brand-navy text-xs text-white/80 md:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        <a href={siteConfig.contact.phoneHref} className="flex items-center gap-1.5 hover:text-white">
          <Phone className="size-3.5" />
          {siteConfig.contact.phone}
        </a>
        <div className="flex items-center gap-4">
          <Link href="/support" className="flex items-center gap-1.5 hover:text-white">
            <LifeBuoy className="size-3.5" />
            Support
          </Link>
          <a
            href="https://clients.magicworkshost.com/clientarea.php"
            className="flex items-center gap-1.5 hover:text-white"
          >
            <LogIn className="size-3.5" />
            Login
          </a>
          <div className="flex items-center gap-3 border-l border-white/20 pl-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                <social.icon className="size-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

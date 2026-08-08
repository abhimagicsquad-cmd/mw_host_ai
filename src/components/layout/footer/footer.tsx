import Link from "next/link"
import { CreditCard, Mail, MapPin, Phone, RotateCcw, ShieldCheck, Zap } from "lucide-react"

import { Logo } from "@/components/common/logo"
import { footerColumns } from "@/constants/nav-items"
import { siteConfig, socialLinks } from "@/constants/site-config"

import { FooterColumn } from "./footer-column"
import { FooterCTABlock } from "./footer-cta-block"

const trustBadges = [
  { label: "Free SSL on every plan", icon: ShieldCheck },
  { label: "99.9% uptime SLA", icon: Zap },
  { label: "30-day money-back guarantee", icon: RotateCcw },
  { label: "Secure payments", icon: CreditCard },
]

type FooterProps = {
  showCta?: boolean
}

export function Footer({ showCta = true }: FooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-brand-navy text-white">
      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        {showCta ? <FooterCTABlock /> : null}

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-b border-white/10 py-6 sm:justify-between">
          {trustBadges.map((badge) => (
            <div key={badge.label} className="flex items-center gap-2 text-xs font-medium text-white/70">
              <badge.icon className="size-4 text-brand-orange" />
              {badge.label}
            </div>
          ))}
        </div>

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col gap-4 lg:col-span-1">
            <Logo variant="light" />
            <p className="text-sm text-white/70">{siteConfig.description}</p>
            <div className="flex items-center gap-3 pt-1">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-brand-orange hover:text-white"
                >
                  <social.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn heading={footerColumns.quickLinks.heading} links={footerColumns.quickLinks.links} />
          <FooterColumn heading={footerColumns.services.heading} links={footerColumns.services.links} />
          <FooterColumn heading={footerColumns.resources.heading} links={footerColumns.resources.links} />

          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-white">Contact Information</p>
            <a href={siteConfig.contact.phoneHref} className="flex items-start gap-2.5 text-sm text-white/70 hover:text-white">
              <Phone className="mt-0.5 size-4 shrink-0 text-brand-orange" />
              {siteConfig.contact.phone}
            </a>
            <a href={`mailto:${siteConfig.contact.email}`} className="flex items-start gap-2.5 text-sm text-white/70 hover:text-white">
              <Mail className="mt-0.5 size-4 shrink-0 text-brand-orange" />
              {siteConfig.contact.email}
            </a>
            <p className="flex items-start gap-2.5 text-sm text-white/70">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand-orange" />
              {siteConfig.contact.address}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-brand-navy-dark">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-white/60 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © 2012–{year} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/legal/privacy-policy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/legal/terms-of-service" className="hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

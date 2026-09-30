import Link from "@/components/common/site-link"
import { CreditCard, Mail, MapPin, Phone, RotateCcw, ShieldCheck, Zap } from "lucide-react"

import { Logo } from "@/components/common/logo"
import { resolveSocialIcon } from "@/components/common/social-icons"
import { NewsletterSection } from "@/components/sections/newsletter-section"
import { footerColumns } from "@/constants/nav-items"
import { siteConfig, socialLinks as defaultSocialLinks } from "@/constants/site-config"
import { toNavColumns } from "@/lib/nav-mapper"
import { getNavigation, getSiteSettings } from "@/lib/cms/queries"

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

// Every WordPress footer policy link (its "Legal Policies" column), kept in the bottom bar.
const legalLinks = [
  { label: "Privacy Policy", href: "/legal/privacy-policy" },
  { label: "Terms of Service", href: "/legal/terms-of-service" },
  { label: "Service Level Agreement", href: "/legal/service-level-agreement" },
  { label: "Acceptable Use Policy", href: "/legal/acceptable-use-policy" },
  { label: "Mail Policy", href: "/legal/mail-policy" },
  { label: "Resource Abuse Policy", href: "/legal/resource-abuse-policy" },
  { label: "Affiliate Programme Terms", href: "/legal/affiliate-programme-terms" },
]

const fallbackFooterColumns = [footerColumns.quickLinks, footerColumns.services, footerColumns.resources]

export async function Footer({ showCta = true }: FooterProps) {
  const year = new Date().getFullYear()
  const [settings, navigation] = await Promise.all([getSiteSettings(), getNavigation()])

  const siteName = settings?.siteName ?? siteConfig.name
  const description = settings?.description ?? siteConfig.description
  const phone = settings?.contactPhone ?? siteConfig.contact.phone
  const phoneHref = settings?.contactPhoneHref ?? siteConfig.contact.phoneHref
  const email = settings?.contactEmail ?? siteConfig.contact.email
  const address = settings?.contactAddress ?? siteConfig.contact.address
  const columns = navigation?.footerColumns?.length ? toNavColumns(navigation.footerColumns) : fallbackFooterColumns
  const socials =
    settings?.socialLinks?.map((social) => ({
      label: social.platform,
      href: social.url,
      icon: resolveSocialIcon(social.platform),
    })) ?? defaultSocialLinks

  return (
    <footer className="bg-brand-navy text-white">
      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        {showCta ? <FooterCTABlock contactPhone={phone} contactPhoneHref={phoneHref} /> : null}

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
            <p className="text-sm text-white/70">{description}</p>
            <div className="flex items-center gap-3 pt-1">
              {socials.map((social) => (
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

          {columns.map((column) => (
            <FooterColumn key={column.heading} heading={column.heading ?? ""} links={column.links} />
          ))}

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-white">Contact Information</p>
              <a href={phoneHref} className="flex items-start gap-2.5 text-sm text-white/70 hover:text-white">
                <Phone className="mt-0.5 size-4 shrink-0 text-brand-orange" />
                {phone}
              </a>
              <a href={`mailto:${email}`} className="flex items-start gap-2.5 text-sm text-white/70 hover:text-white">
                <Mail className="mt-0.5 size-4 shrink-0 text-brand-orange" />
                {email}
              </a>
              <p className="flex items-start gap-2.5 text-sm text-white/70">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-orange" />
                {address}
              </p>
            </div>

            <NewsletterSection className="relative border-t border-white/10 pt-5" />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-brand-navy-dark">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 text-center lg:flex-row lg:text-left text-xs text-white/60 sm:px-6 lg:px-8">
          <p>
            © 2012–{year} {siteName}. All rights reserved.
          </p>
          <nav aria-label="Legal policies" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}

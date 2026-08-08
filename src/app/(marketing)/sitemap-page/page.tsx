import Link from "next/link"

import { PageHero } from "@/components/sections/page-hero"
import { SectionContainer } from "@/components/layout/section-container"
import { domainPages } from "@/constants/domain-pages-data"
import { emailPages } from "@/constants/email-pages-data"
import { hostingPages } from "@/constants/hosting-pages-data"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Sitemap",
  description: "A full index of every MagicWorks Host page — hosting, domains, SSL, email, and company pages.",
  path: "/sitemap-page",
})

const sitemapGroups: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Company",
    links: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about-us" },
      { label: "Contact Us", href: "/contact-us" },
      { label: "Become Our Affiliate", href: "/become-our-affiliate" },
      { label: "Support", href: "/support" },
      { label: "Knowledge Base", href: "/knowledge-base" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    heading: "Hosting",
    links: [
      { label: "Hosting Overview", href: "/hosting" },
      ...hostingPages.map((page) => ({ label: page.eyebrow, href: `/hosting/${page.slug}` })),
      { label: "VPS Hosting", href: "/vps-hosting" },
      { label: "Dedicated Server", href: "/dedicated-hosting/dedicated-server" },
      { label: "Managed Dedicated Server", href: "/dedicated-hosting/managed-dedicated-server" },
      { label: "Linux Dedicated Server", href: "/dedicated-hosting/linux-dedicated-server" },
      { label: "Compare Hosting Plans", href: "/compare-hosting-plans" },
    ],
  },
  {
    heading: "Domains",
    links: [
      { label: "Domain Overview", href: "/domain" },
      ...domainPages.map((page) => ({ label: page.eyebrow, href: `/domain/${page.slug}` })),
    ],
  },
  {
    heading: "SSL & Email",
    links: [
      { label: "SSL Certificates", href: "/ssl" },
      { label: "Email Hosting Overview", href: "/email-hosting" },
      ...emailPages.map((page) => ({ label: page.eyebrow, href: `/email-hosting/${page.slug}` })),
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/legal/privacy-policy" },
      { label: "Terms of Service", href: "/legal/terms-of-service" },
      { label: "Service Level Agreement", href: "/legal/service-level-agreement" },
      { label: "Acceptable Use Policy", href: "/legal/acceptable-use-policy" },
    ],
  },
]

export default function SitemapPage() {
  return (
    <>
      <PageHero
        title="Sitemap"
        description="Every page on MagicWorks Host, in one place."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Sitemap" }]}
      />

      <SectionContainer width="wide">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {sitemapGroups.map((group) => (
            <div key={group.heading}>
              <p className="font-heading text-sm font-semibold tracking-wide text-brand-navy uppercase">{group.heading}</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-body-text hover:text-brand-orange">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SectionContainer>
    </>
  )
}

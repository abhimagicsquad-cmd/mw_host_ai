import Link from "@/components/common/site-link"

import { PageHero } from "@/components/sections/page-hero"
import { SectionContainer } from "@/components/layout/section-container"
import { dedicatedPages } from "@/constants/dedicated-pages-data"
import { domainPages } from "@/constants/domain-pages-data"
import { emailPages } from "@/constants/email-pages-data"
import { hostingPages } from "@/constants/hosting-pages-data"
import { guideCategories, guideHref, kbGuides } from "@/constants/kb-guides"
import { kbCategories } from "@/constants/knowledge-base-data"
import { legalDocuments } from "@/constants/legal-content"
import { serviceLandingPath, serviceLandings } from "@/constants/service-landing-data"
import { sslPages } from "@/constants/ssl-pages-data"
import { getBlog } from "@/lib/cms/blog"
import { buildPageMetadata } from "@/lib/seo"

export const generateMetadata = () => buildPageMetadata({
  title: "Sitemap",
  description: "A full index of every MagicWorks Host page — hosting, domains, SSL, email, free tools, blog topics, help articles and policies.",
  path: "/sitemap-page",
})

type SitemapGroup = { heading: string; links: { label: string; href: string }[] }

const sitemapGroups = (blogTopics: { slug: string; name: string }[]): SitemapGroup[] => [
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
      ...serviceLandings.filter((service) => service.cluster === "hosting").map((service) => ({ label: service.name, href: serviceLandingPath(service.slug) })),
      { label: "VPS Hosting", href: "/vps-hosting" },
      ...dedicatedPages.map((page) => ({ label: page.eyebrow, href: `/dedicated-hosting/${page.slug}` })),
      { label: "Compare Hosting Plans", href: "/compare-hosting-plans" },
      { label: "Hosting Offers", href: "/promo/50-off" },
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
      ...sslPages.map((page) => ({ label: `${page.eyebrow} SSL`, href: `/ssl/${page.slug}` })),
      { label: "Email Hosting Overview", href: "/email-hosting" },
      ...emailPages.map((page) => ({ label: page.eyebrow, href: `/email-hosting/${page.slug}` })),
    ],
  },
  {
    heading: "Website Services",
    links: [
      { label: "All Website Services", href: "/services" },
      ...serviceLandings.filter((service) => service.cluster === "business").map((service) => ({ label: service.name, href: serviceLandingPath(service.slug) })),
    ],
  },
  {
    heading: "Guides",
    links: kbGuides.map((guide) => ({ label: guide.title, href: guideHref(guide.slug) })),
  },
  {
    heading: "Free Tools",
    links: [
      { label: "Bandwidth Calculator", href: "/tools/bandwidth-calculator" },
      { label: "Data Unit Calculator", href: "/tools/data-unit-calculator" },
      { label: "Download & Upload Time Calculator", href: "/tools/transfer-time-calculator" },
    ],
  },
  {
    heading: "Help Centre",
    links: [...kbCategories, ...guideCategories.filter((guide) => !kbCategories.some((category) => category.slug === guide.slug))].map((category) => ({
      label: category.name,
      href: `/knowledge-base/category/${category.slug}`,
    })),
  },
  {
    // Every blog topic with posts — including the WordPress category archives (/category/<slug>/).
    heading: "Blog Topics",
    links: blogTopics.map((category) => ({ label: category.name, href: `/blog/category/${category.slug}` })),
  },
  {
    heading: "Legal",
    links: Object.values(legalDocuments).map((doc) => ({ label: doc.title, href: `/legal/${doc.slug}` })),
  },
]

export default async function SitemapPage() {
  const { topicsWithPosts } = await getBlog()
  return (
    <>
      <PageHero
        title="Sitemap"
        description="Every page on MagicWorks Host, in one place."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Sitemap" }]}
      />

      <SectionContainer width="wide">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {sitemapGroups(topicsWithPosts).map((group) => (
            <div key={group.heading}>
              <h2 className="text-sm font-semibold tracking-wide text-brand-navy uppercase">{group.heading}</h2>
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

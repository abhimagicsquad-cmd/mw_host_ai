import Link from "@/components/common/site-link"

import { PageHero } from "@/components/sections/page-hero"
import { SectionContainer } from "@/components/layout/section-container"
import { blogCategories, blogPosts, inWordpressCategory, wordpressCategories } from "@/constants/blog-data"
import { dedicatedPages } from "@/constants/dedicated-pages-data"
import { domainPages } from "@/constants/domain-pages-data"
import { emailPages } from "@/constants/email-pages-data"
import { hostingPages } from "@/constants/hosting-pages-data"
import { kbCategories } from "@/constants/knowledge-base-data"
import { legalDocuments } from "@/constants/legal-content"
import { sslPages } from "@/constants/ssl-pages-data"
import { buildPageMetadata } from "@/lib/seo"

export const generateMetadata = () => buildPageMetadata({
  title: "Sitemap",
  description: "A full index of every MagicWorks Host page — hosting, domains, SSL, email, free tools, blog topics, help articles and policies.",
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
    heading: "Free Tools",
    links: [
      { label: "Bandwidth Calculator", href: "/tools/bandwidth-calculator" },
      { label: "Data Unit Calculator", href: "/tools/data-unit-calculator" },
      { label: "Download & Upload Time Calculator", href: "/tools/transfer-time-calculator" },
    ],
  },
  {
    heading: "Help Centre",
    links: kbCategories.map((category) => ({ label: category.name, href: `/knowledge-base/category/${category.slug}` })),
  },
  {
    // Every blog topic with posts — including the WordPress category archives (/category/<slug>/).
    heading: "Blog Topics",
    links: [
      ...blogCategories.filter((category) => blogPosts.some((post) => post.categorySlug === category.slug)),
      ...wordpressCategories.filter((category) => blogPosts.some((post) => inWordpressCategory(post, category.slug))),
    ]
      .filter((category, index, all) => all.findIndex((other) => other.slug === category.slug) === index)
      .map((category) => ({ label: category.name, href: `/blog/category/${category.slug}` })),
  },
  {
    heading: "Legal",
    links: Object.values(legalDocuments).map((doc) => ({ label: doc.title, href: `/legal/${doc.slug}` })),
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

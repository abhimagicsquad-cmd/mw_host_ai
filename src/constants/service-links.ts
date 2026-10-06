import { dedicatedPages } from "@/constants/dedicated-pages-data"
import { domainPages } from "@/constants/domain-pages-data"
import { emailPages } from "@/constants/email-pages-data"
import { hostingPages } from "@/constants/hosting-pages-data"
import { serviceLandingPath, serviceLandings } from "@/constants/service-landing-data"
import { sslPages } from "@/constants/ssl-pages-data"

export type ServiceLink = { label: string; href: string; description?: string }

/**
 * Every product and service page by route path, with its name and one-line summary — the
 * anchor text and card copy for cross-links between services and guides (topic clusters).
 */
const catalogue: ServiceLink[] = [
  { label: "Web Hosting Plans", href: "/hosting", description: "All NVMe shared hosting plans with free SSL, cPanel and JetBackup." },
  ...hostingPages.map((page) => ({ label: page.eyebrow, href: `/hosting/${page.slug}`, description: page.description })),
  { label: "VPS Hosting", href: "/vps-hosting", description: "NVMe VPS with guaranteed CPU and RAM and full root access, in India or the USA." },
  ...dedicatedPages.map((page) => ({ label: page.eyebrow, href: `/dedicated-hosting/${page.slug}`, description: page.description })),
  { label: "Compare Hosting Plans", href: "/compare-hosting-plans", description: "Every hosting tier side by side, feature by feature." },
  { label: "Domains", href: "/domain", description: "Register, transfer and renew domains, with DNS managed from one place." },
  ...domainPages.map((page) => ({ label: page.eyebrow, href: `/domain/${page.slug}`, description: page.description })),
  { label: "Domain Search", href: "/domain/search", description: "Check which domain names and extensions are available." },
  { label: "SSL Certificates", href: "/ssl", description: "DV, OV, EV and wildcard certificates, installed free on our hosting." },
  ...sslPages.map((page) => ({ label: `${page.eyebrow} SSL`, href: `/ssl/${page.slug}`, description: page.description })),
  { label: "Email Hosting", href: "/email-hosting", description: "Professional email on your own domain." },
  ...emailPages.map((page) => ({ label: page.eyebrow, href: `/email-hosting/${page.slug}`, description: page.description })),
  ...serviceLandings.map((service) => ({ label: service.name, href: serviceLandingPath(service.slug), description: service.description })),
  { label: "Website Services", href: "/services", description: "Development, maintenance, migration and security for your website." },
  { label: "Contact Us", href: "/contact-us", description: "Talk to our sales and support team by phone, email or form." },
  { label: "Support", href: "/support", description: "24/7 phone and ticket support." },
]

const byHref = new Map(catalogue.map((link) => [link.href, link]))

export function serviceLinkFor(href: string): ServiceLink | undefined {
  return byHref.get(href)
}

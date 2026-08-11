import type { NavItem } from "@/types/nav"

export const mainNav: NavItem[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Domain",
    href: "/domain",
    columns: [
      {
        links: [
          { label: "Domain Name Registration", href: "/domain/domain-name-registration", icon: "Globe" },
          { label: "Indian Domain", href: "/domain/indian-domain", icon: "Globe" },
          { label: "Domain Hosting", href: "/domain/domain-hosting", icon: "Server" },
          { label: "Buy Domain Name", href: "/domain/buy-domain-name", icon: "Globe" },
          { label: "Transfer Domain", href: "/domain/transfer-your-domain-name", icon: "Globe" },
        ],
      },
    ],
  },
  {
    label: "Hosting",
    href: "/hosting",
    columns: [
      {
        heading: "Shared Hosting",
        links: [
          { label: "SEO Hosting", href: "/hosting/seo-hosting", icon: "Rocket" },
          { label: "Unlimited Hosting", href: "/hosting/unlimited-hosting", icon: "Boxes" },
          { label: "Buy Web Hosting", href: "/hosting/buy-web-hosting", icon: "Server" },
          { label: "Linux Hosting", href: "/hosting/linux-shared-hosting", icon: "Server" },
          { label: "WordPress Hosting", href: "/hosting/wordpress-hosting", icon: "Server" },
        ],
      },
      {
        heading: "Servers",
        links: [
          { label: "VPS Hosting", href: "/vps-hosting", icon: "Gauge" },
          { label: "Dedicated Servers", href: "/dedicated-hosting/dedicated-server", icon: "Server" },
          { label: "Managed Dedicated Server", href: "/dedicated-hosting/managed-dedicated-server", icon: "Server" },
          { label: "Linux Dedicated Server", href: "/dedicated-hosting/linux-dedicated-server", icon: "Server" },
          { label: "Compare Plans", href: "/compare-hosting-plans", icon: "Boxes" },
        ],
      },
    ],
    featured: {
      title: "New here?",
      description: "Compare every hosting tier side by side and find the right fit in minutes.",
      href: "/compare-hosting-plans",
      icon: "Gauge",
    },
  },
  {
    label: "SSL",
    href: "/ssl",
  },
  {
    label: "Email",
    href: "/email-hosting",
    columns: [
      {
        links: [
          { label: "Business Email Hosting", href: "/email-hosting/business", icon: "Mail" },
          { label: "Enterprise Email Hosting", href: "/email-hosting/enterprise", icon: "Mail" },
        ],
      },
    ],
  },
  {
    label: "Resources",
    href: "/blog",
    columns: [
      {
        links: [{ label: "Blogs", href: "/blog", icon: "BookOpen" }],
      },
    ],
  },
  {
    label: "Knowledgebase",
    href: "/knowledge-base",
  },
  {
    label: "About",
    href: "/about-us",
  },
  {
    label: "Contact",
    href: "/contact-us",
  },
]

export const footerColumns = {
  quickLinks: {
    heading: "Quick Links",
    links: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about-us" },
      { label: "Contact Us", href: "/contact-us" },
      { label: "Become Our Affiliate", href: "/become-our-affiliate" },
      { label: "Compare Hosting Plans", href: "/compare-hosting-plans" },
      { label: "Sitemap", href: "/sitemap-page" },
    ],
  },
  services: {
    heading: "Services",
    links: [
      { label: "SEO Hosting", href: "/hosting/seo-hosting" },
      { label: "Linux Hosting", href: "/hosting/linux-shared-hosting" },
      { label: "Unlimited Hosting", href: "/hosting/unlimited-hosting" },
      { label: "VPS Hosting", href: "/vps-hosting" },
      { label: "Dedicated Servers", href: "/dedicated-hosting/dedicated-server" },
      { label: "Domain Registration", href: "/domain/domain-name-registration" },
      { label: "SSL Certificates", href: "/ssl" },
      { label: "Email Hosting", href: "/email-hosting" },
    ],
  },
  resources: {
    heading: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Knowledgebase", href: "/knowledge-base" },
      { label: "Support", href: "/support" },
      { label: "Privacy Policy", href: "/legal/privacy-policy" },
      { label: "Terms of Service", href: "/legal/terms-of-service" },
      { label: "Service Level Agreement", href: "/legal/service-level-agreement" },
      { label: "Acceptable Use Policy", href: "/legal/acceptable-use-policy" },
    ],
  },
} satisfies Record<string, { heading: string; links: { label: string; href: string; external?: boolean }[] }>

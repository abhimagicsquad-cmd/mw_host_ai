import { FacebookIcon, InstagramIcon, LinkedinIcon, TwitterIcon } from "@/components/common/social-icons"
import type { SocialLink } from "@/types/nav"

export const siteConfig = {
  name: "MagicWorks Host",
  shortName: "MWHost",
  tagline: "Hosting that performs 10X faster",
  description:
    "Fast, reliable web hosting, domains, SSL, and email hosting backed by 24/7 support.",
  legalName: "Magicworks IT Solutions Private Limited",
  foundingYear: 2012,
  /** Canonical origin — the apex domain, exactly as the WordPress site (www 301s to it). */
  url: "https://magicworkshost.com",
  contact: {
    phone: "+91 9764746633",
    phoneHref: "tel:+919764746633",
    email: "sales@magicworkshost.com",
    address: "#201, Vasant Bahawa, Survey No. 20, Near La Valle Casa, Bavdhan, Pune, Maharashtra – 411021",
    postalAddress: {
      streetAddress: "#201, Vasant Bahawa, Survey No. 20, Near La Valle Casa, Bavdhan",
      addressLocality: "Pune",
      addressRegion: "Maharashtra",
      postalCode: "411021",
      addressCountry: "IN",
    },
    hours: {
      sales: "Mon–Sat, 9:30 AM – 6:30 PM IST",
      accounting: "Mon–Fri, 9:30 AM – 6:30 PM IST",
      support: "24/7",
    },
  },
} as const

/** The company's real social profiles (linked from the WordPress site; all verified live). */
export const socialLinks: SocialLink[] = [
  { label: "Facebook", href: "https://www.facebook.com/magicworkshost", icon: FacebookIcon },
  { label: "Twitter", href: "https://twitter.com/MagicWorksHost", icon: TwitterIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/magicworkshost", icon: LinkedinIcon },
  { label: "Instagram", href: "https://www.instagram.com/magicworks_host/", icon: InstagramIcon },
]

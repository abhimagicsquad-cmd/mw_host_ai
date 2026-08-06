import { FacebookIcon, InstagramIcon, LinkedinIcon, TwitterIcon } from "@/components/common/social-icons"
import type { SocialLink } from "@/types/nav"

export const siteConfig = {
  name: "MagicWorks Host",
  shortName: "MWHost",
  tagline: "Hosting that performs 10X faster",
  description:
    "Fast, reliable web hosting, domains, SSL, and email hosting backed by 24/7 support.",
  url: "https://www.magicworkshost.com",
  contact: {
    phone: "+91 8421903846",
    phoneHref: "tel:+918421903846",
    email: "abhimagicsquad@gmail.com",
    address: "#201, Vasant Bahawa, Survey No. 20, Near La Valle Casa, Bavdhan, Pune, Maharashtra – 411021",
    hours: {
      sales: "Mon–Sat, 9:30 AM – 6:30 PM IST",
      accounting: "Mon–Fri, 9:30 AM – 6:30 PM IST",
      support: "24/7",
    },
  },
} as const

export const socialLinks: SocialLink[] = [
  { label: "Facebook", href: "https://facebook.com", icon: FacebookIcon },
  { label: "Twitter", href: "https://twitter.com", icon: TwitterIcon },
  { label: "LinkedIn", href: "https://linkedin.com", icon: LinkedinIcon },
  { label: "Instagram", href: "https://instagram.com", icon: InstagramIcon },
]

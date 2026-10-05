import { Activity, HardDriveDownload, HeadphonesIcon, Rocket, Server, ShieldCheck } from "lucide-react"

import type { TrustHighlight } from "@/components/sections/trust-highlights"

/** Centralized credibility claims reused across the homepage and future service/landing pages. */
export const trustHighlights: TrustHighlight[] = [
  {
    title: "99.9% uptime SLA",
    description: "Backed by a real Service Level Agreement with service credits if we fall short — not just a number on a landing page.",
    icon: Activity,
  },
  {
    title: "Secure from day one",
    description: "Free SSL and free JetBackup backups come with shared hosting, so the basics are covered before your site goes live.",
    icon: ShieldCheck,
  },
  {
    title: "24/7, every day of the year",
    description: "Phone and ticket support staffed around the clock — including weekends and holidays, not just business hours.",
    icon: HeadphonesIcon,
  },
  {
    title: "NVMe on shared hosting",
    description: "NVMe storage is standard on every shared hosting plan — not a paid upgrade you have to hunt for.",
    icon: Server,
  },
  {
    title: "We move your site, free",
    description: "Our team handles migration from your current host at no extra cost on annual plans.",
    icon: Rocket,
  },
  {
    title: "Free JetBackup backups",
    description: "JetBackup backups mean a bad update or a rogue plugin is never a disaster you can't undo.",
    icon: HardDriveDownload,
  },
]

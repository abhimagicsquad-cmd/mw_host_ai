export type BlogCategory = {
  slug: string
  name: string
}

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  categorySlug: string
  readTime: string
  publishedLabel: string
}

/** Seed content — real article pages/CMS-backed content are a future phase; this establishes the working index structure. */
export const blogCategories: BlogCategory[] = [
  { slug: "performance", name: "Performance" },
  { slug: "security", name: "Security" },
  { slug: "wordpress", name: "WordPress" },
  { slug: "business", name: "Running a Business" },
]

export const blogPosts: BlogPost[] = [
  {
    slug: "why-page-speed-affects-conversions",
    title: "Why page speed affects conversions more than you think",
    excerpt: "A one-second delay in load time can measurably drop conversion rates — here's what actually moves the needle.",
    categorySlug: "performance",
    readTime: "5 min read",
    publishedLabel: "Jan 2026",
  },
  {
    slug: "nvme-vs-ssd-hosting",
    title: "NVMe vs. SSD hosting: what's the real difference?",
    excerpt: "Both are solid-state, but the interface makes a bigger difference to your site than marketing copy suggests.",
    categorySlug: "performance",
    readTime: "4 min read",
    publishedLabel: "Jan 2026",
  },
  {
    slug: "ssl-certificate-types-explained",
    title: "SSL certificate types, explained without the jargon",
    excerpt: "Domain, Business, and Extended Validation — what each one actually verifies and when you need it.",
    categorySlug: "security",
    readTime: "6 min read",
    publishedLabel: "Feb 2026",
  },
  {
    slug: "hardening-a-wordpress-site",
    title: "Five steps to harden a WordPress site against common attacks",
    excerpt: "Most WordPress compromises come from a handful of avoidable mistakes — here's how to close them.",
    categorySlug: "wordpress",
    readTime: "7 min read",
    publishedLabel: "Feb 2026",
  },
  {
    slug: "choosing-shared-vs-vps",
    title: "Shared hosting vs. VPS: how to know when it's time to upgrade",
    excerpt: "The traffic and workload signals that actually indicate you've outgrown shared hosting.",
    categorySlug: "business",
    readTime: "5 min read",
    publishedLabel: "Mar 2026",
  },
  {
    slug: "domain-privacy-explained",
    title: "Domain privacy: what it protects and what it doesn't",
    excerpt: "WHOIS privacy hides your contact details from public lookups — here's what it can't do.",
    categorySlug: "security",
    readTime: "3 min read",
    publishedLabel: "Mar 2026",
  },
  {
    slug: "wordpress-plugin-bloat",
    title: "How plugin bloat quietly kills WordPress performance",
    excerpt: "Every plugin adds a cost — a practical framework for deciding what earns its place.",
    categorySlug: "wordpress",
    readTime: "6 min read",
    publishedLabel: "Apr 2026",
  },
  {
    slug: "email-deliverability-basics",
    title: "SPF, DKIM, and DMARC: the email deliverability basics",
    excerpt: "Why your emails might be landing in spam, and the three DNS records that fix it.",
    categorySlug: "security",
    readTime: "5 min read",
    publishedLabel: "Apr 2026",
  },
]

export function getBlogCategoryName(slug: string) {
  return blogCategories.find((category) => category.slug === slug)?.name ?? slug
}

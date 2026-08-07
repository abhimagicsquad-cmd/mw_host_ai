export type BlogCategory = {
  slug: string
  name: string
}

export type BlogPostSection = {
  heading: string
  body: string[]
}

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  categorySlug: string
  readTime: string
  publishedLabel: string
  featured?: boolean
  author: { name: string; role: string }
  sections: BlogPostSection[]
}

/** Seed content — real CMS-backed content population is a future phase; this establishes the working index + detail template structure. */
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
    featured: true,
    author: { name: "MagicWorks Host Team", role: "Infrastructure" },
    sections: [
      {
        heading: "The one-second problem",
        body: [
          "Every additional second of load time gives a visitor another moment to decide your site isn't worth the wait. That decision happens before they've read a word of your content — it's a gut reaction to how the page feels to interact with.",
          "This isn't a hypothetical. Studies across e-commerce and lead-generation sites consistently show measurable drop-off as load time crosses the 2-3 second mark, and the drop-off compounds on mobile connections.",
        ],
      },
      {
        heading: "Where the delay actually comes from",
        body: [
          "Most of the delay a visitor feels isn't your code — it's server response time (Time to First Byte) before your page even starts rendering. Slow disk I/O on the hosting side sits upstream of every optimization you make in your CMS or theme.",
          "This is why hosting infrastructure matters more than most site owners assume: no amount of image compression fixes a server that takes 800ms just to start responding.",
        ],
      },
      {
        heading: "What actually moves the needle",
        body: [
          "In order of impact: server response time (hosting-level), image optimization, and reducing render-blocking scripts. Fix them in that order — optimizing images on a slow server is polishing a symptom, not the cause.",
          "NVMe storage directly improves server response time because it's the layer your database queries and file reads run on, before anything else happens.",
        ],
      },
    ],
  },
  {
    slug: "nvme-vs-ssd-hosting",
    title: "NVMe vs. SSD hosting: what's the real difference?",
    excerpt: "Both are solid-state, but the interface makes a bigger difference to your site than marketing copy suggests.",
    categorySlug: "performance",
    readTime: "4 min read",
    publishedLabel: "Jan 2026",
    featured: true,
    author: { name: "MagicWorks Host Team", role: "Infrastructure" },
    sections: [
      {
        heading: "Same technology, different doorway",
        body: [
          "Both SATA SSDs and NVMe drives store data on flash memory — the difference is the interface they use to talk to the rest of the server. SATA was designed decades ago for spinning hard drives and caps out around 600MB/s.",
          "NVMe drives connect directly over PCIe, the same high-bandwidth bus your CPU uses internally, and routinely deliver 3,000-7,000MB/s with dramatically lower latency.",
        ],
      },
      {
        heading: "Why latency matters more than raw speed",
        body: [
          "A busy web server isn't reading one big file — it's making thousands of small, random reads and writes per second (database queries, session files, cache lookups). NVMe's lower latency per operation is what actually shows up as a faster-feeling site, more than its peak throughput number.",
        ],
      },
      {
        heading: "What this means for your hosting choice",
        body: [
          "If a host advertises \"SSD hosting\" without specifying NVMe, assume it's the older SATA interface — it's not wrong, just not the fastest available tier. NVMe should be standard on any modern hosting plan in 2026, not a premium add-on.",
        ],
      },
    ],
  },
  {
    slug: "ssl-certificate-types-explained",
    title: "SSL certificate types, explained without the jargon",
    excerpt: "Domain, Business, and Extended Validation — what each one actually verifies and when you need it.",
    categorySlug: "security",
    readTime: "6 min read",
    publishedLabel: "Feb 2026",
    author: { name: "MagicWorks Host Team", role: "Security" },
    sections: [
      {
        heading: "They all encrypt the same way",
        body: [
          "This is the most common misconception: every certificate tier — Domain Validated, Business Validated, Extended Validated — provides the same strength of encryption. The difference between tiers is entirely about identity verification, not security strength.",
        ],
      },
      {
        heading: "Domain Validated (DV)",
        body: [
          "Confirms only that you control the domain, typically via an email or DNS check. Issued in minutes. Fine for personal sites, blogs, and internal tools where visitor trust in your organization's identity isn't the concern.",
        ],
      },
      {
        heading: "Business and Extended Validated",
        body: [
          "Business Validated (OV) confirms your organization is a real, registered legal entity. Extended Validated (EV) goes further with rigorous manual verification of your business details, historically shown with a green address bar (modern browsers show it more subtly now, but the underlying verification is still the strongest available).",
          "These matter most for e-commerce, financial services, and anywhere a visitor is about to hand over payment details — the verification is doing trust-building work, not additional encryption work.",
        ],
      },
    ],
  },
  {
    slug: "hardening-a-wordpress-site",
    title: "Five steps to harden a WordPress site against common attacks",
    excerpt: "Most WordPress compromises come from a handful of avoidable mistakes — here's how to close them.",
    categorySlug: "wordpress",
    readTime: "7 min read",
    publishedLabel: "Feb 2026",
    featured: true,
    author: { name: "MagicWorks Host Team", role: "Security" },
    sections: [
      {
        heading: "1. Keep core, themes, and plugins updated",
        body: [
          "The overwhelming majority of WordPress compromises exploit a known, already-patched vulnerability in an outdated plugin. Enable automatic updates for minor releases and review major updates within days, not months.",
        ],
      },
      {
        heading: "2. Remove plugins you don't actively use",
        body: [
          "A deactivated-but-installed plugin can still be exploited in some attack chains. If you haven't used it in three months, remove it entirely rather than just deactivating it.",
        ],
      },
      {
        heading: "3. Enforce strong, unique admin credentials",
        body: [
          "Credential-stuffing bots try leaked password lists against every WordPress login page they find. A unique, generated password plus two-factor authentication closes this off almost completely.",
        ],
      },
      {
        heading: "4. Limit login attempts",
        body: [
          "Brute-force login attempts are constant background noise on any public WordPress site. Rate-limiting or lockout after repeated failures stops the vast majority of automated attempts.",
        ],
      },
      {
        heading: "5. Keep daily backups you've actually tested",
        body: [
          "Hardening reduces risk, it doesn't eliminate it. A tested, restorable daily backup is what turns a successful attack from a catastrophe into an inconvenience.",
        ],
      },
    ],
  },
  {
    slug: "choosing-shared-vs-vps",
    title: "Shared hosting vs. VPS: how to know when it's time to upgrade",
    excerpt: "The traffic and workload signals that actually indicate you've outgrown shared hosting.",
    categorySlug: "business",
    readTime: "5 min read",
    publishedLabel: "Mar 2026",
    author: { name: "MagicWorks Host Team", role: "Infrastructure" },
    sections: [
      {
        heading: "Shared hosting is not the problem you think it is",
        body: [
          "Shared hosting gets blamed for performance issues that are often actually caused by unoptimized plugins or images. Before upgrading, rule those out — a bigger server won't fix an inefficient database query.",
        ],
      },
      {
        heading: "Signals that genuinely indicate you've outgrown it",
        body: [
          "Sustained high CPU usage reported by your host during normal (non-attack) traffic, consistently hitting resource limits during expected traffic spikes, or needing server-level software your host doesn't provide (custom PHP extensions, specific caching layers, a message queue).",
        ],
      },
      {
        heading: "What VPS actually buys you",
        body: [
          "Guaranteed CPU and RAM that isn't shared with other accounts, and root access to configure the server exactly how your application needs. It's a meaningful jump in control, not just a bigger number on a spec sheet.",
        ],
      },
    ],
  },
  {
    slug: "domain-privacy-explained",
    title: "Domain privacy: what it protects and what it doesn't",
    excerpt: "WHOIS privacy hides your contact details from public lookups — here's what it can't do.",
    categorySlug: "security",
    readTime: "3 min read",
    publishedLabel: "Mar 2026",
    author: { name: "MagicWorks Host Team", role: "Security" },
    sections: [
      {
        heading: "What it hides",
        body: [
          "Domain registration requires a name, address, email, and phone number on file (WHOIS records). Without privacy protection, this is public — searchable by anyone. Privacy protection replaces your details with the registrar's proxy contact information in public lookups.",
        ],
      },
      {
        heading: "What it doesn't protect against",
        body: [
          "It doesn't hide who owns the site's content, doesn't protect against subpoenas or legal requests (registrars still hold your real details), and doesn't prevent a determined attacker with other resources from identifying you. It's protection from casual public lookup, not anonymity.",
        ],
      },
    ],
  },
  {
    slug: "wordpress-plugin-bloat",
    title: "How plugin bloat quietly kills WordPress performance",
    excerpt: "Every plugin adds a cost — a practical framework for deciding what earns its place.",
    categorySlug: "wordpress",
    readTime: "6 min read",
    publishedLabel: "Apr 2026",
    author: { name: "MagicWorks Host Team", role: "Performance" },
    sections: [
      {
        heading: "The cost isn't just \"one more plugin\"",
        body: [
          "Each active plugin adds database queries, hooks into WordPress's execution lifecycle, and often its own CSS/JS assets — even on pages where it does nothing useful. Ten \"lightweight\" plugins can easily add up to a meaningfully slower site.",
        ],
      },
      {
        heading: "A simple framework for keeping plugins in check",
        body: [
          "Before installing: could this be done with a few lines of code in a child theme instead? After installing: does it load its assets sitewide, or only where actually needed? Every quarter: audit and remove anything you can't justify keeping.",
        ],
      },
      {
        heading: "Measure, don't guess",
        body: [
          "Use a query monitor plugin (temporarily) to see which plugins are adding the most database queries or load time on a representative page. This turns \"plugin bloat\" from a vague feeling into a specific, fixable list.",
        ],
      },
    ],
  },
  {
    slug: "email-deliverability-basics",
    title: "SPF, DKIM, and DMARC: the email deliverability basics",
    excerpt: "Why your emails might be landing in spam, and the three DNS records that fix it.",
    categorySlug: "security",
    readTime: "5 min read",
    publishedLabel: "Apr 2026",
    author: { name: "MagicWorks Host Team", role: "Email" },
    sections: [
      {
        heading: "SPF: who's allowed to send as you",
        body: [
          "A Sender Policy Framework record lists which mail servers are authorized to send email for your domain. Without it, receiving servers have no way to confirm an email claiming to be from you actually came from your infrastructure.",
        ],
      },
      {
        heading: "DKIM: proof the message wasn't altered",
        body: [
          "DomainKeys Identified Mail attaches a cryptographic signature to outgoing mail. The receiving server checks that signature against your public DNS record to confirm the message wasn't tampered with in transit.",
        ],
      },
      {
        heading: "DMARC: telling receivers what to do",
        body: [
          "DMARC ties SPF and DKIM together and tells receiving servers what to do when a message fails both checks (quarantine, reject, or do nothing) — and gives you visibility into who's sending mail claiming to be from your domain, including potential spoofing attempts.",
        ],
      },
    ],
  },
]

export function getBlogCategoryName(slug: string) {
  return blogCategories.find((category) => category.slug === slug)?.name ?? slug
}

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug)
}

export function getRelatedPosts(post: BlogPost, limit = 3) {
  return blogPosts.filter((candidate) => candidate.slug !== post.slug && candidate.categorySlug === post.categorySlug).slice(0, limit)
}

/**
 * One-time content migration: pushes the existing hardcoded copy for the legal, support,
 * and affiliate pages into Sanity so the CMS-first query path (added alongside these
 * schemas) takes over from the hardcoded fallback in the page components.
 *
 * Requires SANITY_API_TOKEN (Editor permission) — generate at sanity.io/manage, project
 * uf33qaon, API > Tokens. Run with: node scripts/migrate-content.mjs
 *
 * Safe to re-run: uses createOrReplace with fixed _id values, so it's idempotent.
 */
import { createClient } from "@sanity/client"

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "uf33qaon"
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production"
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01"
const token = process.env.SANITY_API_TOKEN

if (!token) {
  console.error("Missing SANITY_API_TOKEN. Generate an Editor token at sanity.io/manage (project uf33qaon) and set it in .env.local, then re-run this script.")
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

const contactEmail = "abhimagicsquad@gmail.com"
const contactAddress = "#201, Vasant Bahawa, Survey No. 20, Near La Valle Casa, Bavdhan, Pune, Maharashtra – 411021"
const siteName = "MagicWorks Host"

const legalPages = [
  {
    _id: "legalPage.privacy-policy",
    _type: "legalPage",
    title: "Privacy Policy",
    slug: { _type: "slug", current: "privacy-policy" },
    summary: "How MagicWorks Host collects, uses, and protects your information.",
    lastUpdated: "August 7, 2026",
    sections: [
      {
        heading: "Information we collect",
        body: [
          "We collect information you provide directly, such as your name, email address, phone number, billing address, and any message content you submit through our forms.",
          "We also collect limited technical information automatically — such as IP address, browser type, and pages visited — to keep our services secure and to understand how our site is used.",
        ],
      },
      {
        heading: "How we use your information",
        body: [
          "We use your information to provision and support your hosting account, respond to enquiries, send service-related communications, and process billing.",
          "With your consent, we may also send occasional product updates or offers. You can opt out of marketing communications at any time.",
        ],
      },
      {
        heading: "Cookies",
        body: [
          "We use essential cookies to keep our site functioning correctly (for example, remembering that you've dismissed a banner) and, where enabled, analytics cookies to understand aggregate site usage.",
          "You can control or disable cookies through your browser settings; disabling essential cookies may affect site functionality.",
        ],
      },
      {
        heading: "How we share your information",
        body: [
          "We do not sell your personal information. We share data only with service providers who help us operate — such as email delivery and payment processing — under confidentiality obligations, or where required by law.",
        ],
      },
      {
        heading: "Data retention and security",
        body: [
          "We retain account and billing information for as long as your account is active and as needed to meet legal and accounting obligations.",
          "We apply reasonable technical and organizational safeguards to protect your data, including access controls and encrypted transmission (HTTPS) for forms submitted on this site.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You may request access to, correction of, or deletion of your personal information, or object to certain processing, by contacting us using the details below.",
        ],
      },
      {
        heading: "Contact us",
        body: [`Questions about this policy can be sent to ${contactEmail} or by post to ${contactAddress}.`],
      },
    ],
  },
  {
    _id: "legalPage.terms-of-service",
    _type: "legalPage",
    title: "Terms of Service",
    slug: { _type: "slug", current: "terms-of-service" },
    summary: "The terms that govern your use of MagicWorks Host's products and services.",
    lastUpdated: "August 7, 2026",
    sections: [
      {
        heading: "Acceptance of terms",
        body: [
          `By purchasing, accessing, or using any ${siteName} service — including shared hosting, VPS, dedicated servers, domains, SSL certificates, and email hosting — you agree to be bound by these Terms of Service.`,
        ],
      },
      {
        heading: "Service description",
        body: [
          "We provide web hosting and related infrastructure services on a subscription basis. Plan features, storage, bandwidth, and pricing are as described on the relevant product page at the time of purchase.",
        ],
      },
      {
        heading: "Billing and renewals",
        body: [
          "Services are billed in advance for the billing cycle selected at checkout (monthly, annual, biennial, or triennial). Renewal reminders are sent before your billing date; failure to pay by the due date may result in service suspension.",
          "Discounted introductory pricing applies to the initial term only unless stated otherwise; renewal pricing will be communicated in advance of your renewal date.",
        ],
      },
      {
        heading: "Money-back guarantee",
        body: [
          "New shared hosting customers may request a full refund within 30 days of initial purchase. Domain registration fees, SSL certificates, and dedicated/VPS setup fees are non-refundable once provisioned, except where required by law.",
        ],
      },
      {
        heading: "Acceptable use",
        body: [
          "You agree not to use our services to host unlawful content, distribute malware, send unsolicited bulk email, or engage in activity that disrupts other customers or our infrastructure. See our Acceptable Use Policy for details.",
        ],
      },
      {
        heading: "Limitation of liability",
        body: [
          `To the maximum extent permitted by law, ${siteName} is not liable for indirect, incidental, or consequential damages arising from use of our services, including loss of data or revenue, beyond amounts paid for the service in the preceding billing cycle.`,
        ],
      },
      {
        heading: "Service availability",
        body: [
          "We target the uptime commitment described in our Service Level Agreement. Scheduled maintenance will be communicated in advance where practical.",
        ],
      },
      {
        heading: "Changes to these terms",
        body: [
          "We may update these terms from time to time. Continued use of our services after an update constitutes acceptance of the revised terms.",
        ],
      },
    ],
  },
  {
    _id: "legalPage.service-level-agreement",
    _type: "legalPage",
    title: "Service Level Agreement",
    slug: { _type: "slug", current: "service-level-agreement" },
    summary: "Our uptime commitment and what happens if we don't meet it.",
    lastUpdated: "August 7, 2026",
    sections: [
      {
        heading: "Uptime commitment",
        body: [
          "We target 99.9% network and server uptime per calendar month across our shared, VPS, and dedicated hosting infrastructure, excluding scheduled maintenance windows.",
        ],
      },
      {
        heading: "Scheduled maintenance",
        body: [
          "Planned maintenance that may affect availability is scheduled during low-traffic windows where possible and announced in advance via email or your client area.",
        ],
      },
      {
        heading: "Service credits",
        body: [
          "If monthly uptime falls below our commitment due to causes within our control, eligible customers may request a service credit against their next invoice, calculated on a sliding scale based on downtime duration.",
        ],
      },
      {
        heading: "Exclusions",
        body: [
          "This commitment does not cover downtime caused by factors outside our reasonable control, including third-party DNS/registrar issues, customer-side misconfiguration, force majeure events, or scheduled maintenance.",
        ],
      },
      {
        heading: "Requesting a credit",
        body: [
          `To request a service credit, contact ${contactEmail} within 30 days of the incident with your account details and the dates/times affected.`,
        ],
      },
    ],
  },
  {
    _id: "legalPage.acceptable-use-policy",
    _type: "legalPage",
    title: "Acceptable Use Policy",
    slug: { _type: "slug", current: "acceptable-use-policy" },
    summary: "What is and isn't allowed on MagicWorks Host infrastructure.",
    lastUpdated: "August 7, 2026",
    sections: [
      {
        heading: "Prohibited content and activity",
        body: [
          "You may not use our services to host or distribute unlawful, infringing, or malicious content, including malware, phishing pages, or material that violates the intellectual property rights of others.",
        ],
      },
      {
        heading: "Resource usage",
        body: [
          "Shared hosting plans are intended for typical website workloads. Accounts that consume disproportionate CPU, memory, or I/O in a way that affects other customers may be asked to upgrade to a VPS or dedicated plan.",
        ],
      },
      {
        heading: "Email and anti-spam",
        body: [
          "Sending unsolicited bulk email (spam) from our infrastructure is strictly prohibited and may result in immediate suspension. Mailing lists must use confirmed opt-in and provide a working unsubscribe mechanism.",
        ],
      },
      {
        heading: "Security",
        body: [
          "You are responsible for keeping software on your hosting account (CMS platforms, plugins, scripts) updated. Compromised accounts may be temporarily suspended to protect other customers while the issue is resolved.",
        ],
      },
      {
        heading: "Enforcement",
        body: [
          "We may suspend or terminate services that violate this policy, with notice where practical. Repeated or severe violations may result in immediate termination without refund.",
        ],
      },
    ],
  },
]

const supportPage = {
  _id: "supportPage",
  _type: "supportPage",
  title: "Support",
  heroTitle: "We're here 24/7, not just during business hours",
  heroDescription: "Pick whichever channel is fastest for you — phone, ticket, or self-serve.",
  channels: [
    {
      _key: "call",
      title: "Call us",
      description: "Speak directly with support, 24/7.",
      icon: "Phone",
      ctaLabel: "+91 8421903846",
      ctaHref: "tel:+918421903846",
      external: false,
    },
    {
      _key: "ticket",
      title: "Open a ticket",
      description: "Track and manage support tickets from your client area.",
      icon: "Ticket",
      ctaLabel: "Client area login",
      ctaHref: "https://clients.magicworkshost.com/clientarea.php",
      external: true,
    },
    {
      _key: "kb",
      title: "Browse the knowledge base",
      description: "Self-serve answers on billing, hosting, domains, and SSL.",
      icon: "BookOpen",
      ctaLabel: "Search articles",
      ctaHref: "/knowledge-base",
      external: false,
    },
  ],
  faqs: [
    { _key: "faq1", question: "Is support really available 24/7?", answer: "Yes — support tickets and the phone line are monitored around the clock, every day of the year." },
    { _key: "faq2", question: "How fast do you respond to tickets?", answer: "Most tickets receive a first response within a few hours; urgent live-site issues are prioritized." },
    { _key: "faq3", question: "Where do I check on my invoice or billing?", answer: "Log into your client area to view invoices, update payment methods, or check your renewal date." },
  ],
}

const affiliatePage = {
  _id: "affiliatePage",
  _type: "affiliatePage",
  title: "Become Our Affiliate",
  heroEyebrow: "Affiliate Program",
  heroTitle: "Earn recurring commission for every referral that stays",
  heroDescription:
    "Refer businesses to MagicWorks Host and earn 20% recurring commission for as long as they stay a customer — not just a one-time payout.",
  heroBullets: [
    "20% recurring commission, every billing cycle",
    "90-day referral cookie window",
    "₹2,000 minimum withdrawal",
    "No cap on how much you can earn",
  ],
  stats: [
    { _key: "s1", label: "Recurring commission", value: "20%", icon: "BadgePercent" },
    { _key: "s2", label: "Cookie window", value: "90 days", icon: "Link2" },
    { _key: "s3", label: "Customer churn", value: "<7%", icon: "TrendingDown" },
    { _key: "s4", label: "Min. withdrawal", value: "₹2,000", icon: "Wallet" },
  ],
  howItWorks: [
    { _key: "h1", title: "1. Join the program", description: "Share your details and get your unique referral link within a day." },
    { _key: "h2", title: "2. Share your link", description: "Refer businesses via your site, social channels, or direct outreach." },
    { _key: "h3", title: "3. Get paid monthly", description: "Earn 20% recurring commission on every active referral, paid out once you hit ₹2,000." },
  ],
  faqs: [
    { _key: "faq1", question: "How much can I earn per referral?", answer: "20% of the referred customer's recurring billing, for as long as they remain a customer — not a one-time flat fee." },
    { _key: "faq2", question: "How long does the referral cookie last?", answer: "90 days — if someone signs up within 90 days of clicking your link, you get credit for the referral." },
    { _key: "faq3", question: "When do I get paid?", answer: "Monthly, once your unpaid commission balance reaches the ₹2,000 minimum withdrawal threshold." },
    { _key: "faq4", question: "Is there a limit to how many people I can refer?", answer: "No cap — your earning potential scales with how many referrals you bring in." },
  ],
}

const comparisonPage = {
  _id: "comparisonPage",
  _type: "comparisonPage",
  title: "Compare Hosting Plans",
  heroTitle: "Compare every hosting tier, side by side",
  heroDescription: "The exact specs behind each plan, so you can pick with confidence instead of guessing.",
  rows: [
    { _key: "r1", label: "NVMe Storage", values: ["1GB", "50GB", "150GB", "200GB"] },
    { _key: "r2", label: "Bandwidth", values: ["5GB", "20GB", "50GB", "200GB"] },
    { _key: "r3", label: "Email Accounts", values: ["10", "30", "100", "Unlimited"] },
    { _key: "r4", label: "RAM", values: ["4GB", "4GB", "4GB", "4GB"] },
    { _key: "r5", label: "vCPU Cores", values: ["2", "2", "2", "2"] },
    { _key: "r6", label: "MySQL Databases", values: ["Unlimited", "Unlimited", "Unlimited", "Unlimited"] },
    { _key: "r7", label: "Free SSL Certificate", values: ["Yes", "Yes", "Yes", "Yes"] },
    { _key: "r8", label: "cPanel Access", values: ["Yes", "Yes", "Yes", "Yes"] },
    { _key: "r9", label: "JetBackup Snapshots", values: ["Daily", "Daily", "Daily", "Daily"] },
    { _key: "r10", label: "FTP Accounts", values: ["1", "Unlimited", "Unlimited", "Unlimited"] },
  ],
  faqs: [
    { _key: "faq1", question: "Which plan should I start with?", answer: "Most new sites do well on Starter or Basic Plus NVMe — Basic Plus is our most popular tier for a reason." },
    { _key: "faq2", question: "Can I upgrade later without downtime?", answer: "Yes, upgrades are instant and prorated directly from your control panel, with no site downtime." },
    { _key: "faq3", question: "What if my site outgrows shared hosting entirely?", answer: "We'll proactively recommend VPS or a dedicated server rather than let a shared account struggle under load." },
  ],
}

const knowledgeBasePage = {
  _id: "knowledgeBasePage",
  _type: "knowledgeBasePage",
  title: "Knowledge Base",
  heroTitle: "How can we help?",
  heroDescription: "Search our growing library of hosting, billing, and account help articles.",
}

const kbCategories = [
  { slug: "getting-started", name: "Getting Started", description: "Account setup, first login, and provisioning basics.", icon: "Rocket" },
  { slug: "billing", name: "Billing & Payments", description: "Invoices, renewals, refunds, and payment methods.", icon: "CreditCard" },
  { slug: "domains", name: "Domains", description: "Registration, transfers, DNS, and nameservers.", icon: "Globe" },
  { slug: "hosting-cpanel", name: "Hosting & cPanel", description: "Control panel, file manager, and app installs.", icon: "Server" },
  { slug: "ssl-security", name: "SSL & Security", description: "Certificates, malware, and account security.", icon: "Lock" },
  { slug: "email", name: "Email Hosting", description: "Mailbox setup, client configuration, and deliverability.", icon: "Mail" },
].map((category) => ({
  _id: `kbCategory.${category.slug}`,
  _type: "kbCategory",
  name: category.name,
  slug: { _type: "slug", current: category.slug },
  description: category.description,
  icon: category.icon,
}))

const kbArticles = [
  { slug: "activate-your-hosting-account", title: "How to activate your hosting account", excerpt: "What to expect after checkout and how long provisioning takes.", categorySlug: "getting-started", readTime: "3 min read", featured: true, popular: true },
  { slug: "log-into-cpanel-first-time", title: "Logging into cPanel for the first time", excerpt: "Where to find your cPanel URL and credentials after signup.", categorySlug: "getting-started", readTime: "2 min read", popular: true },
  { slug: "understanding-your-invoice", title: "Understanding your invoice and billing cycle", excerpt: "How annual, biennial, and triennial discounts are applied.", categorySlug: "billing", readTime: "4 min read" },
  { slug: "update-payment-method", title: "How to update your payment method", excerpt: "Change your card or payment details before your next renewal.", categorySlug: "billing", readTime: "2 min read" },
  { slug: "point-domain-to-hosting", title: "Pointing your domain to MagicWorks Host", excerpt: "Updating nameservers when your domain is registered elsewhere.", categorySlug: "domains", readTime: "5 min read", featured: true, popular: true },
  { slug: "transfer-domain-in", title: "Transferring a domain into your account", excerpt: "EPP codes, unlock steps, and expected transfer timelines.", categorySlug: "domains", readTime: "4 min read" },
  { slug: "install-wordpress-one-click", title: "Installing WordPress with one click", excerpt: "Using Softaculous to install WordPress and other apps in cPanel.", categorySlug: "hosting-cpanel", readTime: "3 min read", featured: true },
  { slug: "create-mysql-database", title: "Creating a MySQL database in cPanel", excerpt: "Set up a database and user for your application.", categorySlug: "hosting-cpanel", readTime: "3 min read" },
  { slug: "restore-backup-jetbackup", title: "Restoring a backup with JetBackup", excerpt: "Roll back files or your full account to a previous snapshot.", categorySlug: "hosting-cpanel", readTime: "4 min read", popular: true },
  { slug: "install-free-ssl-certificate", title: "Installing your free SSL certificate", excerpt: "Why HTTPS matters and how AutoSSL activates on your domain.", categorySlug: "ssl-security", readTime: "3 min read", popular: true },
  { slug: "what-to-do-if-site-hacked", title: "What to do if your website is compromised", excerpt: "Immediate steps to take and how our support team can help.", categorySlug: "ssl-security", readTime: "5 min read" },
  { slug: "set-up-business-email", title: "Setting up your business email account", excerpt: "Creating mailboxes and connecting them to Outlook or Gmail.", categorySlug: "email", readTime: "4 min read" },
  { slug: "fix-email-deliverability", title: "Fixing email deliverability issues", excerpt: "SPF, DKIM, and DMARC records explained in plain terms.", categorySlug: "email", readTime: "5 min read" },
].map((article) => ({
  _id: `kbArticle.${article.slug}`,
  _type: "kbArticle",
  title: article.title,
  slug: { _type: "slug", current: article.slug },
  excerpt: article.excerpt,
  category: { _type: "reference", _ref: `kbCategory.${article.categorySlug}` },
  readTime: article.readTime,
  featured: article.featured ?? false,
  popular: article.popular ?? false,
}))

const thankYouPage = {
  _id: "thankYouPage",
  _type: "thankYouPage",
  title: "Thank You",
  heading: "Thanks — we've got your message",
  description:
    "Your request has been received and routed to our team. We usually respond within a few hours during business hours (Mon–Sat, 9:30 AM – 6:30 PM IST) — support tickets are monitored 24/7.",
  steps: [
    { _key: "s1", title: "1. We review your request", description: "A real person on our team reads what you submitted — no ticket ever goes straight to a bot." },
    { _key: "s2", title: "2. We reach out directly", description: "Expect a call or email from us, usually within a few business hours." },
    { _key: "s3", title: "3. We get you set up", description: "Whether it's a new plan, a migration, or a quick question — we'll take it from there." },
  ],
  ctas: [
    { _key: "c1", label: "Back to Home", href: "/", icon: "Home", variant: "primary" },
    { _key: "c2", label: "Explore Services", href: "/hosting", icon: "Server", variant: "outline" },
    { _key: "c3", label: "Contact Us", href: "/contact-us", icon: "LifeBuoy", variant: "ghost" },
  ],
}

function withKeys(sections) {
  return sections.map((section, i) => ({
    _key: `section-${i}`,
    ...section,
  }))
}

// --- Navigation (header menu + footer columns) — mirrors src/constants/nav-items.ts exactly ---

const navigationDoc = {
  _id: "navigation",
  _type: "navigation",
  title: "Navigation",
  mainMenu: [
    { _key: "n1", label: "Home", href: "/" },
    {
      _key: "n2",
      label: "Domain",
      href: "/domain",
      columns: [
        {
          _key: "c1",
          links: [
            { _key: "l1", label: "Domain Name Registration", href: "/domain/domain-name-registration", icon: "Globe" },
            { _key: "l2", label: "Indian Domain", href: "/domain/indian-domain", icon: "Globe" },
            { _key: "l3", label: "Domain Hosting", href: "/domain/domain-hosting", icon: "Server" },
            { _key: "l4", label: "Buy Domain Name", href: "/domain/buy-domain-name", icon: "Globe" },
            { _key: "l5", label: "Transfer Domain", href: "/domain/transfer-your-domain-name", icon: "Globe" },
          ],
        },
      ],
    },
    {
      _key: "n3",
      label: "Hosting",
      href: "/hosting",
      columns: [
        {
          _key: "c2",
          heading: "Shared Hosting",
          links: [
            { _key: "l6", label: "SEO Hosting", href: "/hosting/seo-hosting", icon: "Rocket" },
            { _key: "l7", label: "Unlimited Hosting", href: "/hosting/unlimited-hosting", icon: "Boxes" },
            { _key: "l8", label: "Buy Web Hosting", href: "/hosting/buy-web-hosting", icon: "Server" },
            { _key: "l9", label: "Linux Hosting", href: "/hosting/linux-shared-hosting", icon: "Server" },
            { _key: "l10", label: "WordPress Hosting", href: "/hosting/wordpress-hosting", icon: "Server" },
          ],
        },
        {
          _key: "c3",
          heading: "Servers",
          links: [
            { _key: "l11", label: "VPS Hosting", href: "/vps-hosting", icon: "Gauge" },
            { _key: "l12", label: "Dedicated Servers", href: "/dedicated-hosting/dedicated-server", icon: "Server" },
            { _key: "l13", label: "Managed Dedicated Server", href: "/dedicated-hosting/managed-dedicated-server", icon: "Server" },
            { _key: "l14", label: "Linux Dedicated Server", href: "/dedicated-hosting/linux-dedicated-server", icon: "Server" },
            { _key: "l15", label: "Compare Plans", href: "/compare-hosting-plans", icon: "Boxes" },
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
    { _key: "n4", label: "SSL", href: "/ssl" },
    {
      _key: "n5",
      label: "Email",
      href: "/email-hosting",
      columns: [
        {
          _key: "c4",
          links: [
            { _key: "l16", label: "Business Email Hosting", href: "/email-hosting/business", icon: "Mail" },
            { _key: "l17", label: "Enterprise Email Hosting", href: "/email-hosting/enterprise", icon: "Mail" },
          ],
        },
      ],
    },
    {
      _key: "n6",
      label: "Resources",
      href: "/blog",
      columns: [{ _key: "c5", links: [{ _key: "l18", label: "Blogs", href: "/blog", icon: "BookOpen" }] }],
    },
    { _key: "n7", label: "Knowledgebase", href: "/knowledge-base" },
    { _key: "n8", label: "About", href: "/about-us" },
    { _key: "n9", label: "Contact", href: "/contact-us" },
  ],
  footerColumns: [
    {
      _key: "f1",
      heading: "Quick Links",
      links: [
        { _key: "fl1", label: "Home", href: "/" },
        { _key: "fl2", label: "About Us", href: "/about-us" },
        { _key: "fl3", label: "Contact Us", href: "/contact-us" },
        { _key: "fl4", label: "Become Our Affiliate", href: "/become-our-affiliate" },
        { _key: "fl5", label: "Compare Hosting Plans", href: "/compare-hosting-plans" },
        { _key: "fl6", label: "Sitemap", href: "/sitemap-page" },
      ],
    },
    {
      _key: "f2",
      heading: "Services",
      links: [
        { _key: "fl7", label: "SEO Hosting", href: "/hosting/seo-hosting" },
        { _key: "fl8", label: "Linux Hosting", href: "/hosting/linux-shared-hosting" },
        { _key: "fl9", label: "Unlimited Hosting", href: "/hosting/unlimited-hosting" },
        { _key: "fl10", label: "VPS Hosting", href: "/vps-hosting" },
        { _key: "fl11", label: "Dedicated Servers", href: "/dedicated-hosting/dedicated-server" },
        { _key: "fl12", label: "Domain Registration", href: "/domain/domain-name-registration" },
        { _key: "fl13", label: "SSL Certificates", href: "/ssl" },
        { _key: "fl14", label: "Email Hosting", href: "/email-hosting" },
      ],
    },
    {
      _key: "f3",
      heading: "Resources",
      links: [
        { _key: "fl15", label: "Blog", href: "/blog" },
        { _key: "fl16", label: "Knowledgebase", href: "/knowledge-base" },
        { _key: "fl17", label: "Support", href: "/support" },
        { _key: "fl18", label: "Privacy Policy", href: "/legal/privacy-policy" },
        { _key: "fl19", label: "Terms of Service", href: "/legal/terms-of-service" },
        { _key: "fl20", label: "Service Level Agreement", href: "/legal/service-level-agreement" },
        { _key: "fl21", label: "Acceptable Use Policy", href: "/legal/acceptable-use-policy" },
      ],
    },
  ],
}

// --- Pricing plans — mirrors src/constants/pricing-plans.ts + email-pages-data.ts exactly ---

const pricingPlans = [
  // Shared hosting grid (service: shared-hosting)
  { slug: "starter", name: "Starter NVMe", price: "₹145", priceSuffix: "/mo", regularPrice: "₹194", discountLabel: "15% off annually", features: ["1GB NVMe storage", "5GB bandwidth", "10 email accounts", "Free SSL"], cta: { label: "Buy Now", href: "#lead" }, service: "shared-hosting", order: 1 },
  { slug: "basic-plus", name: "Basic Plus NVMe", price: "₹407", priceSuffix: "/mo", regularPrice: "₹542", discountLabel: "24% off annually", features: ["50GB NVMe storage", "20GB bandwidth", "30 email accounts", "Free SSL"], cta: { label: "Buy Now", href: "#lead" }, service: "shared-hosting", featured: true, order: 2 },
  { slug: "deluxe", name: "Deluxe NVMe", price: "₹814", priceSuffix: "/mo", regularPrice: "₹1,085", discountLabel: "30% off annually", features: ["150GB NVMe storage", "50GB bandwidth", "100 email accounts", "Free SSL"], cta: { label: "Buy Now", href: "#lead" }, service: "shared-hosting", order: 3 },
  { slug: "unlimited", name: "Unlimited NVMe", price: "₹1,162", priceSuffix: "/mo", regularPrice: "₹1,550", discountLabel: "25% off annually", features: ["200GB NVMe storage", "200GB bandwidth", "Unlimited email", "Free SSL"], cta: { label: "Buy Now", href: "#lead" }, service: "shared-hosting", order: 4 },
  // VPS grid (service: vps-hosting)
  { slug: "vps-starter", name: "VPS Starter", price: "₹4,372", priceSuffix: "/mo", features: ["2 vCPU", "4GB RAM", "80GB NVMe storage", "Full root access"], cta: { label: "Buy Now", href: "#lead" }, service: "vps-hosting", order: 1 },
  { slug: "vps-basic", name: "VPS Basic", price: "₹5,512", priceSuffix: "/mo", features: ["4 vCPU", "8GB RAM", "160GB NVMe storage", "Full root access"], cta: { label: "Buy Now", href: "#lead" }, service: "vps-hosting", featured: true, order: 2 },
  { slug: "vps-silver", name: "VPS Silver", price: "₹6,712", priceSuffix: "/mo", features: ["6 vCPU", "16GB RAM", "240GB NVMe storage", "Full root access"], cta: { label: "Buy Now", href: "#lead" }, service: "vps-hosting", order: 3 },
  // SSL grid (service: ssl)
  { slug: "domain-validated", name: "Domain Validated", price: "₹4,000", priceSuffix: "/yr", features: ["Domain ownership validation", "Issued within minutes", "256-bit encryption", "Browser padlock"], cta: { label: "Get started", href: "#lead" }, service: "ssl", order: 1 },
  { slug: "business-validated", name: "Business Validated", price: "₹9,000", priceSuffix: "/yr", features: ["Organization identity validated", "Higher customer trust signal", "256-bit encryption", "1-3 day issuance"], cta: { label: "Get started", href: "#lead" }, service: "ssl", featured: true, order: 2 },
  { slug: "wildcard", name: "Wildcard", price: "₹16,000", priceSuffix: "/yr", features: ["Secures unlimited subdomains", "Domain validation", "256-bit encryption", "One certificate to manage"], cta: { label: "Get started", href: "#lead" }, service: "ssl", order: 3 },
  { slug: "extended-validated", name: "Extended Validated", price: "₹25,000", priceSuffix: "/yr", features: ["Highest identity assurance", "Full legal entity verification", "256-bit encryption", "Best for financial/e-commerce sites"], cta: { label: "Get started", href: "#lead" }, service: "ssl", order: 4 },
  // Dedicated grid (service: dedicated-server; managed-dedicated-server pages relabel this at render time)
  { slug: "dedicated-starter", name: "Dedicated Starter", price: "₹13,769", priceSuffix: "/mo", features: ["4 cores / 8 threads", "16GB RAM", "1TB storage", "5 dedicated IPs"], cta: { label: "Buy Now", href: "#lead" }, service: "dedicated-server", order: 1 },
  { slug: "dedicated-basic", name: "Dedicated Basic", price: "₹18,469", priceSuffix: "/mo", features: ["8 cores / 16 threads", "32GB RAM", "2TB storage", "5 dedicated IPs"], cta: { label: "Buy Now", href: "#lead" }, service: "dedicated-server", featured: true, order: 2 },
  { slug: "dedicated-silver", name: "Dedicated Silver", price: "₹21,969", priceSuffix: "/mo", features: ["12 cores / 24 threads", "64GB RAM", "4TB storage", "5 dedicated IPs"], cta: { label: "Buy Now", href: "#lead" }, service: "dedicated-server", order: 3 },
  { slug: "dedicated-gold", name: "Dedicated Gold", price: "₹25,469", priceSuffix: "/mo", features: ["16 cores / 32 threads", "128GB RAM", "8TB storage", "5 dedicated IPs"], cta: { label: "Buy Now", href: "#lead" }, service: "dedicated-server", order: 4 },
  // Email tiers (single-plan services)
  { slug: "business-email", name: "Business Email", price: "₹45", priceSuffix: "/mailbox/mo", features: ["5GB storage per mailbox", "Webmail + IMAP/POP access", "Spam & malware filtering", "Your own domain"], cta: { label: "Get started", href: "#lead" }, service: "business-email", order: 1 },
  { slug: "enterprise-email", name: "Enterprise Email", price: "₹99", priceSuffix: "/mailbox/mo", features: ["25GB mailbox storage", "5GB file storage", "Shared calendars & collaboration tools", "Priority support"], cta: { label: "Get started", href: "#lead" }, service: "enterprise-email", featured: true, order: 1 },
].map(({ slug, ...plan }) => ({
  _id: `pricingPlan.${slug}`,
  _type: "pricingPlan",
  ...plan,
  slug: { _type: "slug", current: slug },
}))

// --- Service pages (hosting/domain/email/dedicated/ssl/vps families) ---

const hostingServicePages = [
  {
    slug: "buy-web-hosting", eyebrow: "Web Hosting", heroTitle: "Web hosting built for speed, not just uptime",
    heroDescription: "NVMe storage, free SSL, and one-click installs on every plan — the same infrastructure whether you're launching a portfolio or a growing storefront.",
    bullets: ["NVMe storage on every tier", "Free SSL certificate included", "Softaculous one-click installs", "24/7 phone and ticket support"],
    features: [
      { title: "Fast by default", description: "NVMe storage and tuned PHP handlers, not a paid add-on.", icon: "Zap" },
      { title: "cPanel included", description: "The control panel most developers already know.", icon: "Terminal" },
      { title: "Free migration", description: "We move your existing site over on annual plans.", icon: "Server" },
    ],
    faqs: [
      { question: "How long does setup take?", answer: "Most accounts are live within 5 minutes of payment confirmation." },
      { question: "Can I install WordPress automatically?", answer: "Yes — Softaculous one-click install is available in cPanel on every plan." },
      { question: "Is there a money-back guarantee?", answer: "Yes, every plan includes a 30-day money-back guarantee." },
    ],
  },
  {
    slug: "seo-hosting", eyebrow: "SEO Hosting", heroTitle: "Hosting speed that search engines actually notice",
    heroDescription: "Page speed is a ranking factor. Our NVMe infrastructure keeps Core Web Vitals healthy without you touching a single server setting.",
    bullets: ["NVMe storage for faster Time to First Byte", "Free SSL — a confirmed Google ranking signal", "Unmetered bandwidth on higher tiers", "Built-in caching-friendly server configuration"],
    features: [
      { title: "Faster TTFB", description: "Server response time is part of Google's Core Web Vitals story.", icon: "Search" },
      { title: "HTTPS everywhere", description: "Free SSL on every domain, activated automatically.", icon: "Lock" },
      { title: "Room to scale", description: "Upgrade tiers instantly as your traffic grows.", icon: "TrendingUp" },
    ],
    faqs: [
      { question: "Does faster hosting really affect SEO rankings?", answer: "Page experience and Core Web Vitals are confirmed Google ranking factors, and server response time is a major input to them." },
      { question: "Do I need a separate SEO plugin?", answer: "Hosting speed helps your Core Web Vitals score, but on-page SEO still depends on your CMS/plugin setup — we handle the infrastructure side." },
      { question: "Can I move an existing site here without losing rankings?", answer: "Yes — we handle DNS and redirects carefully during migration to avoid any ranking disruption." },
    ],
  },
  {
    slug: "wordpress-hosting", eyebrow: "WordPress Hosting", heroTitle: "WordPress hosting that skips the plugin band-aids",
    heroDescription: "One-click WordPress installs, NVMe storage, and a server stack tuned for PHP — so your site is fast before you install a single caching plugin.",
    bullets: ["One-click WordPress install via Softaculous", "NVMe storage for faster database queries", "PHP running up to 3x faster than Apache", "Free SSL and daily JetBackup snapshots"],
    features: [
      { title: "One-click installs", description: "WordPress, WooCommerce, and 150+ apps via Softaculous.", icon: "Rocket" },
      { title: "Tuned for PHP", description: "A server stack built around what WordPress actually needs.", icon: "Gauge" },
      { title: "Daily backups", description: "JetBackup snapshots so a bad update is never catastrophic.", icon: "Sparkles" },
    ],
    faqs: [
      { question: "Is this managed WordPress hosting?", answer: "It's WordPress-optimized shared hosting with full cPanel access — you keep full control, we keep the server fast." },
      { question: "Can I install multiple WordPress sites?", answer: "Yes, subject to your plan's storage and email account limits." },
      { question: "Do you support WooCommerce?", answer: "Yes — WooCommerce installs cleanly via the same one-click Softaculous flow." },
    ],
  },
  {
    slug: "linux-shared-hosting", eyebrow: "Linux Hosting", heroTitle: "Linux shared hosting with the specs to back it up",
    heroDescription: "A hardened Linux stack, full cPanel access, and NVMe storage — the fundamentals done properly, without a confusing feature matrix.",
    bullets: ["Hardened Linux server stack", "Full cPanel + File Manager access", "Unlimited MySQL databases", "Free SSL on every domain"],
    features: [
      { title: "Full root-level cPanel", description: "File manager, cron jobs, and database tools, no waiting on support.", icon: "Terminal" },
      { title: "Security hardened", description: "Server-level protections applied by default, not opt-in.", icon: "Lock" },
      { title: "Unlimited databases", description: "Run as many MySQL databases as your apps need.", icon: "Server" },
    ],
    faqs: [
      { question: "What control panel do I get?", answer: "cPanel, with full file manager, cron job, and database access." },
      { question: "Can I run multiple applications?", answer: "Yes — unlimited MySQL databases mean you can run several apps on one account." },
      { question: "Is SSH access available?", answer: "SSH access is available on request for shared hosting accounts in good standing." },
    ],
  },
  {
    slug: "unlimited-hosting", eyebrow: "Unlimited Hosting", heroTitle: "Unlimited hosting, without the fine-print asterisk",
    heroDescription: "Generous storage and bandwidth limits designed for growing sites — with the same NVMe performance as every other plan, not a downgraded tier.",
    bullets: ["Generous NVMe storage allocation", "High-bandwidth tier for growing traffic", "Unlimited email accounts", "Free SSL and daily backups"],
    features: [
      { title: "Built to scale", description: "Storage and bandwidth sized for sites that are actively growing.", icon: "TrendingUp" },
      { title: "Unlimited email", description: "Add as many mailboxes as your team needs.", icon: "Sparkles" },
      { title: "No surprise caps", description: "Fair-use, not a bait-and-switch — we'll tell you if you're outgrowing shared hosting.", icon: "Gauge" },
    ],
    faqs: [
      { question: "Is storage really unlimited?", answer: "Plans are sized generously for typical website workloads under a fair-use policy — we'll reach out before ever restricting an account." },
      { question: "When should I upgrade to VPS instead?", answer: "If you're running heavy applications or sustained high traffic, our team will proactively recommend VPS rather than let a shared account struggle." },
      { question: "Does unlimited include unlimited domains?", answer: "Domain limits vary by tier — check the plan comparison or ask our team for your specific use case." },
    ],
  },
].map(({ slug, ...page }) => ({ _id: `servicePage.hosting.${slug}`, _type: "servicePage", category: "hosting", ...page, slug: { _type: "slug", current: slug } }))

const domainServicePages = [
  { slug: "domain-name-registration", eyebrow: "Domain Registration", heroTitle: "Register a domain in minutes", heroDescription: "Search, register, and manage your domain from a single dashboard — with registrar lock and auto-renewal included.", bullets: ["Instant registration for available domains", "Free WHOIS privacy on supported TLDs", "Auto-renewal so you never lose your domain", "Manage DNS from your account dashboard"], faqs: [
    { question: "How long does registration take?", answer: "Domains are typically active within a few minutes of successful payment." },
    { question: "Do you offer WHOIS privacy?", answer: "Yes, on supported TLDs at no extra cost." },
    { question: "Can I transfer the domain out later?", answer: "Yes, once past the standard 60-day ICANN transfer lock." },
  ] },
  { slug: "indian-domain", eyebrow: "Indian Domains", heroTitle: "Register .in and .co.in domains for your business", heroDescription: "Local TLDs signal a local presence to your customers — registered and managed with the same tools as every other domain.", bullets: [".in and .co.in domains available", "Fast local DNS propagation", "Registrar lock included", "Simple GST-ready billing"], faqs: [
    { question: "Do I need to be an Indian resident to register a .in domain?", answer: "No, .in domains are open to registrants worldwide." },
    { question: "What documents are required?", answer: "Standard registrant contact details — no special documentation needed for .in or .co.in." },
    { question: "Can I use a .in domain with hosting from another provider?", answer: "Yes, you can point DNS to any host you choose." },
  ] },
  { slug: "domain-hosting", eyebrow: "Domain + Hosting", heroTitle: "Register your domain and host it in one place", heroDescription: "Skip the DNS-pointing dance — register your domain and launch your website on the same NVMe hosting infrastructure.", bullets: ["One dashboard for domain and hosting", "Free SSL the moment DNS resolves", "NVMe hosting on every plan", "One invoice, one renewal date"], faqs: [
    { question: "Does bundling save time over separate providers?", answer: "Yes — DNS is pre-configured automatically, so there's no manual nameserver setup." },
    { question: "Can I still use external DNS if I prefer?", answer: "Yes, you can point to third-party DNS at any time from your dashboard." },
    { question: "What hosting plans work with this?", answer: "Any shared, VPS, or dedicated plan — see our hosting pages for pricing." },
  ] },
  { slug: "buy-domain-name", eyebrow: "Buy a Domain", heroTitle: "Buy the domain name you actually want", heroDescription: "Straightforward pricing across the most popular TLDs, with no bait-and-switch renewal pricing hidden in the fine print.", bullets: ["Transparent year-one and renewal pricing", "Popular TLDs: .com, .in, .co.in, .org", "Free registrar lock", "Instant checkout"], faqs: [
    { question: "Will my renewal price be different from my first year?", answer: "Renewal pricing is disclosed upfront on every TLD — no surprise price jumps." },
    { question: "Can I register multiple domains at once?", answer: "Yes, add as many domains as you need to a single order." },
    { question: "What happens if my desired domain is taken?", answer: "We'll suggest available alternatives across other TLDs." },
  ] },
  { slug: "transfer-your-domain-name", eyebrow: "Domain Transfer", heroTitle: "Transfer your domain without the downtime", heroDescription: "Move your domain to MagicWorks Host in a few steps — most transfers complete in 1–7 days with zero site downtime.", bullets: ["Step-by-step transfer checklist provided", "No downtime during the transfer window", "Free year of registration added on transfer", "Support team available if anything stalls"], faqs: [
    { question: "How long does a domain transfer take?", answer: "Typically 1–7 days, depending on your current registrar's approval process." },
    { question: "What do I need before starting?", answer: "Disable privacy protection, verify your admin email, remove registrar locks, and obtain your EPP/auth code." },
    { question: "Will my website go down during the transfer?", answer: "No — DNS and hosting are unaffected by a domain transfer; only the registrar changes." },
  ] },
].map(({ slug, ...page }) => ({ _id: `servicePage.domain.${slug}`, _type: "servicePage", category: "domain", ...page, slug: { _type: "slug", current: slug } }))

const dedicatedServicePages = [
  { slug: "dedicated-server", eyebrow: "Dedicated Server", heroTitle: "Bare-metal performance, fully in your control", heroDescription: "Full root access to dedicated hardware — no noisy neighbors, no shared resources, no compromise on performance.", bullets: ["Dedicated CPU, RAM, and storage — nothing shared", "Full root access", "Choice of OS and control panel", "5 dedicated IPs included"], managed: false, faqs: [
    { question: "Do I manage the server myself?", answer: "Yes — you get full root access. Our support team is available for infrastructure-level issues, not application management." },
    { question: "Can I choose my operating system?", answer: "Yes, a choice of Linux distributions is available at provisioning." },
    { question: "How fast is provisioning?", answer: "Dedicated servers are typically provisioned within 24 hours of order confirmation." },
  ] },
  { slug: "managed-dedicated-server", eyebrow: "Managed Dedicated Server", heroTitle: "Dedicated server performance, without the server admin work", heroDescription: "The same dedicated hardware, plus our team handling patching, monitoring, and hardening — so your team can focus on the application, not the OS.", bullets: ["Same dedicated hardware tiers", "Proactive patching and monitoring", "Security hardening included", "Priority support queue"], managed: true, faqs: [
    { question: "What does 'managed' actually include?", answer: "OS patching, security hardening, uptime monitoring, and priority support — you focus on your application." },
    { question: "Can I still get root access?", answer: "Yes, root access is available on request even on managed plans." },
    { question: "Is managed support available 24/7?", answer: "Yes, managed dedicated customers get priority 24/7 support routing." },
  ] },
  { slug: "linux-dedicated-server", eyebrow: "Linux Dedicated Server", heroTitle: "Linux dedicated servers tuned for real workloads", heroDescription: "The same dedicated hardware tiers, running a hardened Linux stack — a solid foundation for anything from a database cluster to a build server.", bullets: ["Choice of major Linux distributions", "Hardened default configuration", "Full root access", "5 dedicated IPs included"], managed: false, faqs: [
    { question: "Which Linux distributions are supported?", answer: "Common enterprise distributions are available at provisioning — ask our team if you need a specific version." },
    { question: "Can I run a control panel like cPanel or Plesk?", answer: "Yes, both are available as optional add-ons." },
    { question: "Is this the same hardware as your other dedicated plans?", answer: "Yes — the same tiers and pricing, just provisioned with a Linux-first configuration." },
  ] },
].map(({ slug, ...page }) => ({ _id: `servicePage.dedicated.${slug}`, _type: "servicePage", category: "dedicated", ...page, slug: { _type: "slug", current: slug } }))

const emailServicePages = [
  { slug: "business", eyebrow: "Business Email Hosting", heroTitle: "Business email that looks the part", heroDescription: "OX Business Email on your own domain — reliable, spam-filtered, and simple to set up.", bullets: ["1 account with 5GB storage per mailbox", "Works with Outlook, Gmail, and IMAP clients", "Enterprise-grade spam and malware filtering", "Simple per-mailbox billing"], planId: "business-email", faqs: [
    { question: "How much storage does each mailbox get?", answer: "5GB per mailbox on the Business Email plan." },
    { question: "Can I use this with Outlook or Gmail?", answer: "Yes, it supports standard IMAP/POP so it works with any major email client." },
    { question: "Can I add more mailboxes later?", answer: "Yes, add or remove mailboxes anytime — billing adjusts per mailbox." },
  ] },
  { slug: "enterprise", eyebrow: "Enterprise Email Hosting", heroTitle: "Enterprise email with room to collaborate", heroDescription: "More storage and built-in collaboration tools for teams that live in their inbox and shared calendars.", bullets: ["25GB mailbox + 5GB file storage", "Shared calendars and collaboration tools", "Enterprise-grade spam and malware filtering", "Priority support"], planId: "enterprise-email", faqs: [
    { question: "What collaboration tools are included?", answer: "Shared calendars, contacts, and file storage alongside your mailbox." },
    { question: "Is this suitable for a full team?", answer: "Yes — Enterprise Email is priced per mailbox, so it scales cleanly as your team grows." },
    { question: "Can I migrate from Google Workspace or Microsoft 365?", answer: "Yes, our team can assist with mailbox migration during setup." },
  ] },
].map(({ planId, slug, ...page }) => ({
  _id: `servicePage.email.${slug}`,
  _type: "servicePage",
  category: "email",
  ...page,
  slug: { _type: "slug", current: slug },
  plan: { _type: "reference", _ref: `pricingPlan.${planId}` },
}))

const sslServicePage = {
  _id: "servicePage.ssl.ssl-certificates",
  _type: "servicePage",
  category: "ssl",
  slug: { _type: "slug", current: "ssl-certificates" },
  eyebrow: "SSL Certificates",
  heroTitle: "HTTPS isn't optional anymore — make it easy",
  heroDescription: "From a quick Domain Validated cert to full Extended Validation for e-commerce, we'll help you pick the right level of trust for your site.",
  bullets: ["Issued in minutes to a few business days", "256-bit encryption on every certificate", "Browser padlock and HTTPS by default", "Free installation support"],
  features: [
    { title: "Encrypts data in transit", description: "Passwords, payment details, and form submissions stay private.", icon: "Lock" },
    { title: "Builds customer trust", description: "The padlock icon is table stakes for visitors in 2026.", icon: "ShieldCheck" },
    { title: "Required for e-commerce", description: "Payment processors and card networks require HTTPS.", icon: "ShoppingCart" },
    { title: "A confirmed SEO signal", description: "HTTPS is a lightweight but confirmed Google ranking factor.", icon: "TrendingUp" },
    { title: "Verifies your identity", description: "Business and Extended Validation certs confirm who you are, not just your domain.", icon: "ScanSearch" },
    { title: "Simple to install", description: "Our team handles installation on any of our hosting plans.", icon: "KeyRound" },
  ],
  faqs: [
    { question: "What's the difference between the certificate tiers?", answer: "Domain Validated confirms you control the domain; Business and Extended Validated additionally verify your organization's legal identity, showing more trust signals to visitors." },
    { question: "How long does issuance take?", answer: "Domain Validated certificates issue within minutes; Business and Extended Validated can take 1-3 business days due to identity verification." },
    { question: "Does a Wildcard certificate cover subdomains?", answer: "Yes — one Wildcard certificate secures unlimited subdomains on a single root domain." },
    { question: "Will you install the certificate for me?", answer: "Yes, installation support is included free on any MagicWorks Host hosting plan." },
    { question: "Do I need SSL if I'm not selling anything online?", answer: "Yes — HTTPS is now expected by browsers and visitors regardless of whether you process payments, and it affects SEO." },
    { question: "What happens when my certificate expires?", answer: "We send renewal reminders well in advance, and renewal can be completed in a couple of clicks from your account." },
  ],
}

const vpsServicePage = {
  _id: "servicePage.vps.vps-hosting",
  _type: "servicePage",
  category: "vps",
  slug: { _type: "slug", current: "vps-hosting" },
  eyebrow: "VPS Hosting",
  heroTitle: "Dedicated resources, without dedicated-server pricing",
  heroDescription: "Full root access on NVMe-backed virtual servers — the step up for sites that have outgrown shared hosting but don't need bare metal yet.",
  bullets: ["Guaranteed CPU and RAM — never shared", "Full root access, choice of OS", "NVMe storage on every tier", "Instant tier upgrades as you grow"],
  features: [
    { title: "Full root access", description: "Install anything, configure everything — it's your server.", icon: "Server" },
    { title: "Guaranteed resources", description: "CPU and RAM allocated to you, never shared with other tenants.", icon: "Cpu" },
    { title: "NVMe storage", description: "The fastest storage tier, standard on every VPS plan.", icon: "Gauge" },
    { title: "Hardened defaults", description: "Sensible security configuration out of the box.", icon: "ShieldCheck" },
    { title: "24/7 support", description: "Real infrastructure engineers, not a script-reading queue.", icon: "HeadphonesIcon" },
    { title: "Instant upgrades", description: "Move to a bigger tier without a migration project.", icon: "Zap" },
  ],
  faqs: [
    { question: "How is VPS different from shared hosting?", answer: "VPS gives you guaranteed, dedicated CPU and RAM with full root access — shared hosting pools resources across many accounts." },
    { question: "Do I need to manage the server myself?", answer: "Yes, root access means you're responsible for server administration — ask about our managed add-on if you'd rather we handle it." },
    { question: "Can I upgrade my VPS tier later?", answer: "Yes, upgrades are handled with minimal downtime as your traffic grows." },
    { question: "What control panels are supported?", answer: "cPanel and Plesk are both available as optional add-ons." },
  ],
}

// --- Site settings — mirrors src/constants/site-config.ts exactly (header/footer/top-bar contact info) ---

const siteSettingsDoc = {
  _id: "siteSettings",
  _type: "siteSettings",
  siteName: "MagicWorks Host",
  tagline: "Hosting that performs 10X faster",
  description: "Fast, reliable web hosting, domains, SSL, and email hosting backed by 24/7 support.",
  headerCta: { label: "Get Started", href: "#lead" },
  contactPhone: "+91 8421903846",
  contactPhoneHref: "tel:+918421903846",
  contactEmail: "abhimagicsquad@gmail.com",
  contactAddress: "#201, Vasant Bahawa, Survey No. 20, Near La Valle Casa, Bavdhan, Pune, Maharashtra – 411021",
  salesHours: "Mon–Sat, 9:30 AM – 6:30 PM IST",
  accountingHours: "Mon–Fri, 9:30 AM – 6:30 PM IST",
  supportHours: "24/7",
  socialLinks: [
    { _key: "s1", platform: "Facebook", url: "https://facebook.com" },
    { _key: "s2", platform: "Twitter", url: "https://twitter.com" },
    { _key: "s3", platform: "LinkedIn", url: "https://linkedin.com" },
    { _key: "s4", platform: "Instagram", url: "https://instagram.com" },
  ],
}

// --- Homepage testimonials & FAQs — referenced (not embedded) by homePage.pageBuilder, since
// testimonialsBlock/faqBlock point at the reusable `testimonial`/`faq` document types. ---

const homeTestimonials = [
  { slug: "anita-sharma", name: "Anita Sharma", role: "Founder", company: "Craftly Studio", quote: "Migration was seamless and our site has never been faster. Support responds within minutes, not days.", rating: 5 },
  { slug: "rohit-verma", name: "Rohit Verma", role: "CTO", company: "Bharat Retail Co.", quote: "NVMe hosting cut our page load time in half. Couldn't be happier with the switch.", rating: 5 },
  { slug: "priya-nair", name: "Priya Nair", role: "Marketing Lead", company: "Nair & Co.", quote: "The cPanel setup is intuitive even for our non-technical team members. Zero learning curve.", rating: 4 },
].map(({ slug, ...t }) => ({ _id: `testimonial.${slug}`, _type: "testimonial", ...t }))

const homeFaqs = [
  { slug: "home-getting-started", question: "How fast can I get started?", answer: "Most accounts are provisioned within 5 minutes of payment confirmation — no waiting on manual setup." },
  { slug: "home-money-back", question: "Do you offer a money-back guarantee?", answer: "Yes — every plan includes a 30-day money-back guarantee, no questions asked." },
  { slug: "home-upgrade-plan", question: "Can I upgrade my plan later?", answer: "Absolutely. Upgrades are instant and prorated directly from your control panel." },
  { slug: "home-migration-help", question: "Will you help me migrate my existing site?", answer: "Yes, our team handles the migration for you on every annual plan at no extra cost." },
].map(({ slug, ...f }) => ({ _id: `faq.${slug}`, _type: "faq", ...f }))

// --- Home page — mirrors src/app/(site)/page.tsx exactly. `seo` is left unset so
// generateMetadata() keeps returning {} and the root layout's default <title>/description
// (siteConfig-derived) continue to apply verbatim, exactly as before this migration. ---

const homePageDoc = {
  _id: "homePage",
  _type: "homePage",
  title: "Home",
  pageBuilder: [
    {
      _key: "banner",
      _type: "bannerBlock",
      message: "Save up to 30% on annual NVMe hosting plans — limited time.",
      cta: { label: "View pricing", href: "#pricing" },
      dismissible: true,
    },
    {
      _key: "hero",
      _type: "heroBlock",
      eyebrow: "NVMe Web Hosting",
      title: "Hosting that performs 10X faster",
      highlightText: "10X faster",
      description: "Most budget hosts sell you slow HDD storage, a support queue measured in days, and a renewal price that quietly triples. We built the opposite: NVMe storage on every plan, a real SLA, and a team that answers the phone.",
      bullets: [
        "NVMe storage standard, not a paid upgrade",
        "24/7 support that picks up the phone",
        "Transparent renewal pricing, no bait-and-switch",
        "Free migration on every annual plan",
      ],
      primaryCta: { label: "Choose your plan", href: "#pricing" },
      secondaryCta: { label: "Talk to an expert", href: "#lead" },
      stats: [
        { _key: "s1", label: "Uptime SLA", value: "99.9%" },
        { _key: "s2", label: "Businesses hosted", value: "12,000+" },
        { _key: "s3", label: "Avg. load time", value: "0.7s" },
      ],
      showDashboardVisual: true,
    },
    {
      _key: "speed-stats",
      _type: "statsBlock",
      eyebrow: "Why speed matters",
      title: "Slow sites lose visitors — fast ones win them",
      description: "Switching to NVMe-backed infrastructure changes what happens the moment someone lands on your site.",
      stats: [
        { _key: "s1", label: "Faster page loads", value: "10X", icon: "Zap" },
        { _key: "s2", label: "Potential traffic lift", value: "+1000%", icon: "TrendingUp" },
        { _key: "s3", label: "Uptime guarantee", value: "99.9%", icon: "ShieldCheck" },
        { _key: "s4", label: "Support availability", value: "24/7", icon: "HeadphonesIcon" },
      ],
    },
    {
      _key: "pricing",
      _type: "pricingBlock",
      eyebrow: "Pricing",
      title: "Select your web hosting package",
      description: "Every plan includes free SSL, cPanel, and JetBackup — no hidden setup fees.",
      plans: [
        { _key: "p1", _type: "reference", _ref: "pricingPlan.starter" },
        { _key: "p2", _type: "reference", _ref: "pricingPlan.basic-plus" },
        { _key: "p3", _type: "reference", _ref: "pricingPlan.deluxe" },
        { _key: "p4", _type: "reference", _ref: "pricingPlan.unlimited" },
      ],
    },
    {
      _key: "trust",
      _type: "trustHighlightsBlock",
      eyebrow: "Why MagicWorks Host",
      title: "Promises we back with an SLA, not just a landing page",
      description: "Every claim below is something we'll put in writing — service credits, migration help, and backups included.",
      background: "alt",
      highlights: [
        { _key: "h1", title: "99.9% uptime guarantee", description: "Backed by a real Service Level Agreement with service credits if we fall short — not just a number on a landing page.", icon: "Activity" },
        { _key: "h2", title: "Hardened by default", description: "Free SSL, daily malware scanning, and server-level hardening applied before your account ever goes live.", icon: "ShieldCheck" },
        { _key: "h3", title: "24/7, every day of the year", description: "Phone and ticket support staffed around the clock — including weekends and holidays, not just business hours.", icon: "HeadphonesIcon" },
        { _key: "h4", title: "NVMe on every plan", description: "The fastest storage tier available today, standard on every hosting plan — not a paid upgrade you have to hunt for.", icon: "Server" },
        { _key: "h5", title: "We move your site, free", description: "Our team handles migration from your current host at no extra cost on annual plans — no downtime, no lost email.", icon: "Rocket" },
        { _key: "h6", title: "Daily backup snapshots", description: "Automatic daily JetBackup snapshots mean a bad update or a rogue plugin is never a disaster you can't undo.", icon: "HardDriveDownload" },
      ],
    },
    {
      _key: "services",
      _type: "serviceGridBlock",
      eyebrow: "Services",
      title: "Everything your website needs, under one roof",
      description: "From domains to dedicated servers — one provider, one dashboard, no juggling vendors.",
      services: [
        { _key: "sv1", title: "VPS Hosting", description: "Dedicated resources with full root access, for sites that outgrow shared hosting.", icon: "Server", href: "/vps-hosting", price: "₹4,372", priceSuffix: "/mo", featured: true },
        { _key: "sv2", title: "Dedicated Servers", description: "Bare-metal performance for high-traffic sites and demanding workloads.", icon: "Server", href: "/dedicated-hosting/dedicated-server", price: "₹13,769", priceSuffix: "/mo" },
        { _key: "sv3", title: "SSL Certificates", description: "Secure your site, protect customer data, and boost search trust.", icon: "Lock", href: "/ssl", price: "₹4,000", priceSuffix: "/yr" },
      ],
      ctaLabel: "Not sure which one you need? Ask us",
      ctaDialogTitle: "Get a recommendation",
      ctaDialogDescription: "Tell us about your traffic and workload and we'll suggest the right tier.",
    },
    {
      _key: "about-credibility",
      _type: "aboutCredibilityBlock",
      eyebrow: "About MagicWorks Host",
      title: "A decade of infrastructure built to just work",
      description: "MagicWorks Host is a division of MagicWorks IT Solutions, serving businesses across India since 2012 with hosting that's fast by default and supported by people who actually pick up the phone.",
      bullets: [
        "Manage everything from a single cPanel dashboard",
        "24/7 phone and ticket support, every day of the year",
        "Free migration assistance when you switch to us",
      ],
      cta: { label: "Learn more about us", href: "/about-us" },
      highlights: [
        { _key: "h1", label: "Years in operation", value: "13+" },
        { _key: "h2", label: "Businesses hosted", value: "12,000+" },
        { _key: "h3", label: "Support availability", value: "24/7" },
        { _key: "h4", label: "Uptime commitment", value: "99.9%" },
      ],
    },
    {
      _key: "testimonials",
      _type: "testimonialsBlock",
      title: "What our customers say",
      description: "A few of the businesses running on MagicWorks Host infrastructure.",
      testimonials: [
        { _key: "t1", _type: "reference", _ref: "testimonial.anita-sharma" },
        { _key: "t2", _type: "reference", _ref: "testimonial.rohit-verma" },
        { _key: "t3", _type: "reference", _ref: "testimonial.priya-nair" },
      ],
      ctaLabel: "Join our happy customers",
    },
    {
      _key: "faqs",
      _type: "faqBlock",
      title: "Frequently asked questions",
      description: "Everything you need to know before you switch.",
      contactCta: false,
      faqs: [
        { _key: "f1", _type: "reference", _ref: "faq.home-getting-started" },
        { _key: "f2", _type: "reference", _ref: "faq.home-money-back" },
        { _key: "f3", _type: "reference", _ref: "faq.home-upgrade-plan" },
        { _key: "f4", _type: "reference", _ref: "faq.home-migration-help" },
      ],
    },
    {
      _key: "cta",
      _type: "ctaBannerBlock",
      title: "Ready to move your website to MagicWorks Host?",
      description: "Free migration assistance included on every annual plan.",
      primaryCta: { label: "View plans", href: "#pricing" },
      secondaryCta: { label: "Talk to sales", href: "#lead" },
      background: "navy",
    },
  ],
}

// --- About page — mirrors src/app/(site)/(marketing)/about-us/page.tsx exactly. `seo` is
// populated with the same fallback values the page component already used, so buildMetadata()
// produces byte-identical output whether sourced from CMS or the old ?? fallback. ---

const aboutPageDoc = {
  _id: "aboutPage",
  _type: "aboutPage",
  title: "About",
  seo: {
    metaTitle: "About Us",
    metaDescription: "MagicWorks Host is a division of MagicWorks IT Solutions, hosting businesses across India since 2012 with NVMe-powered infrastructure and 24/7 support.",
  },
  pageBuilder: [
    {
      _key: "hero",
      _type: "pageHeroBlock",
      title: "Hosting infrastructure built by people who actually use it",
      description: "MagicWorks Host is a division of MagicWorks IT Solutions — we've been keeping Indian businesses online since 2012, one NVMe server at a time.",
      breadcrumbs: [
        { _key: "b1", label: "Home", href: "/" },
        { _key: "b2", label: "About Us" },
      ],
      background: "navy",
    },
    {
      _key: "story",
      _type: "richTextBlock",
      eyebrow: "Our story",
      title: "From a small Pune office to 12,000+ hosted businesses",
      content: [
        {
          _key: "b1",
          _type: "block",
          style: "normal",
          children: [
            {
              _key: "s1",
              _type: "span",
              text: "MagicWorks Host started inside MagicWorks IT Solutions with a simple observation: most hosting providers made customers choose between speed, support, and price. We didn't think that trade-off should exist.",
            },
          ],
        },
        {
          _key: "b2",
          _type: "block",
          style: "normal",
          children: [
            {
              _key: "s1",
              _type: "span",
              text: "Since 2012, we've grown from a handful of shared-hosting customers in Bavdhan, Pune, to a full hosting stack — shared, VPS, dedicated servers, domains, SSL, and business email — all built on NVMe storage and backed by a support team that answers the phone.",
            },
          ],
        },
        {
          _key: "b3",
          _type: "block",
          style: "normal",
          children: [
            {
              _key: "s1",
              _type: "span",
              text: "We're still a focused, independent team. That means decisions about infrastructure and support don't go through layers of a call center script — they go through people who know what a slow TTFB actually costs a small business.",
            },
          ],
        },
      ],
    },
    {
      _key: "mission-vision",
      _type: "featureGridBlock",
      eyebrow: "What drives us",
      title: "Mission and vision",
      variant: "grid",
      columns: 2,
      background: "alt",
      items: [
        { _key: "i1", title: "Our mission", description: "Make enterprise-grade hosting infrastructure — NVMe storage, real support, transparent pricing — accessible to every business in India, not just the ones with enterprise budgets.", icon: "Target" },
        { _key: "i2", title: "Our vision", description: "To be the hosting provider Indian businesses recommend to each other, because the service held up when it mattered, not because of a discount code.", icon: "Eye" },
      ],
    },
    {
      _key: "why-choose-us",
      _type: "featureGridBlock",
      eyebrow: "How we work",
      title: "Our approach to hosting",
      description: "Four principles that shape every infrastructure and support decision we make.",
      variant: "cards",
      background: "none",
      items: [
        { _key: "i1", title: "Performance-first", description: "NVMe storage is standard on every plan, not an add-on you pay extra to unlock.", icon: "Zap" },
        { _key: "i2", title: "Real hosting expertise", description: "Our support team runs cPanel, WHM, and Linux servers daily — not a script-reading queue.", icon: "Gauge" },
        { _key: "i3", title: "Customer-focused support", description: "24/7 phone and ticket support, with a 30-day money-back guarantee on every plan.", icon: "HeartHandshake" },
        { _key: "i4", title: "Security by default", description: "Free SSL, daily JetBackup snapshots, and hardened server configurations out of the box.", icon: "ShieldCheck" },
        { _key: "i5", title: "Straightforward pricing", description: "The price you see is the price you pay — no surprise renewal hikes buried in fine print.", icon: "Users" },
        { _key: "i6", title: "Always reachable", description: "Sales and support run seven days a week, because websites don't only break on weekdays.", icon: "HeadphonesIcon" },
      ],
    },
    {
      _key: "stats",
      _type: "statsBlock",
      eyebrow: "MagicWorks Host by the numbers",
      title: "A decade of infrastructure, not a pitch deck",
      stats: [
        { _key: "s1", label: "Years in operation", value: "13+" },
        { _key: "s2", label: "Businesses hosted", value: "12,000+" },
        { _key: "s3", label: "Uptime commitment", value: "99.9%" },
        { _key: "s4", label: "Support availability", value: "24/7" },
      ],
    },
    {
      _key: "cta",
      _type: "ctaBannerBlock",
      title: "Want to talk to the team before you switch?",
      description: "Share a few details and we'll walk you through the right plan for your website — no pressure, no script.",
      primaryCta: { label: "Talk to us", href: "#lead" },
      secondaryCta: { label: "View pricing", href: "/#pricing" },
      background: "navy",
    },
  ],
}

// --- Contact page & services hub pages (hosting/domain/email-hosting) — SEO only, no
// `pageBuilder`. These pages embed lead-capture forms (GetQuoteForm/LeadForm) that have no
// pageBuilder block equivalent; a full `pageBuilder` takeover would silently drop those forms
// (the page components fully replace their body with <PageBuilder> when pageBuilder is
// non-empty). Populating just `seo` moves that field to CMS with zero risk of content loss. ---

const contactPageDoc = {
  _id: "contactPage",
  _type: "contactPage",
  title: "Contact",
  seo: {
    metaTitle: "Contact Us",
    metaDescription: "Get in touch with MagicWorks Host — call, email, or send us your details and our team will respond within a few hours.",
  },
}

const servicesPages = [
  { slug: "hosting", title: "Hosting Hub", metaTitle: "Web Hosting", metaDescription: "NVMe-powered shared hosting plans for every kind of website — general web hosting, SEO, WordPress, Linux, and unlimited tiers." },
  { slug: "domain", title: "Domain Hub", metaTitle: "Domain Names", metaDescription: "Register, host, or transfer your domain — .com, .in, .co.in, and .org, backed by registrar lock and auto-renewal." },
  { slug: "email-hosting", title: "Email Hosting Hub", metaTitle: "Email Hosting", metaDescription: "Professional business email hosting on your own domain — Business and Enterprise tiers, billed per mailbox." },
].map(({ slug, title, metaTitle, metaDescription }) => ({
  _id: `servicesPage.${slug}`,
  _type: "servicesPage",
  title,
  slug: { _type: "slug", current: slug },
  seo: { metaTitle, metaDescription },
}))

// --- Blog configuration (categories only — blogListingPage and author skipped, see report) ---

const blogCategoryDocs = [
  { slug: "performance", title: "Performance" },
  { slug: "security", title: "Security" },
  { slug: "wordpress", title: "WordPress" },
  { slug: "business", title: "Running a Business" },
].map((c) => ({ _id: `category.${c.slug}`, _type: "category", title: c.title, slug: { _type: "slug", current: c.slug } }))

async function run() {
  const docs = [
    ...legalPages.map((doc) => ({ ...doc, sections: withKeys(doc.sections) })),
    supportPage,
    affiliatePage,
    comparisonPage,
    knowledgeBasePage,
    ...kbCategories,
    ...kbArticles,
    thankYouPage,
    navigationDoc,
    siteSettingsDoc,
    ...pricingPlans,
    ...hostingServicePages,
    ...domainServicePages,
    ...dedicatedServicePages,
    ...emailServicePages,
    sslServicePage,
    vpsServicePage,
    ...blogCategoryDocs,
    ...homeTestimonials,
    ...homeFaqs,
    homePageDoc,
    aboutPageDoc,
    contactPageDoc,
    ...servicesPages,
  ]

  // Documents that reference other documents (kbArticle -> kbCategory, servicePage.email -> pricingPlan,
  // homePage -> pricingPlan/testimonial/faq) must be created after their targets. Sort referencing types last.
  const referencingTypes = new Set(["kbArticle", "servicePage", "homePage"])
  const ordered = [...docs].sort((a, b) => Number(referencingTypes.has(a._type)) - Number(referencingTypes.has(b._type)))

  for (const doc of ordered) {
    await client.createOrReplace(doc)
    console.log(`✓ ${doc._id}`)
  }

  console.log(`\nDone. Migrated ${ordered.length} documents to dataset "${dataset}".`)
}

run().catch((error) => {
  console.error("Migration failed:", error)
  process.exit(1)
})

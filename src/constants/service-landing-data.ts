import type { LucideIcon } from "lucide-react"
import {
  ArrowRightLeft,
  Boxes,
  Cloud,
  Code,
  DatabaseBackup,
  Gauge,
  Globe,
  HeadphonesIcon,
  LayoutTemplate,
  Lock,
  Mail,
  MapPin,
  RefreshCw,
  Server,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react"

import type { FAQItem } from "@/types/content"

/**
 * The six service pages added for launch (cloud, reseller, development, maintenance, migration,
 * security), served at their own URLs (/cloud-hosting/ … — see WORDPRESS_ROUTES) by
 * app/(site)/(marketing)/services/[slug].
 *
 * Content rule: every statement about MagicWorks Host restates something the site already says
 * (plans, policies, the WordPress site). Where the business hasn't published the details yet —
 * prices, scope, turnaround — the page asks for a quote instead of promising anything, and the
 * gap is listed in `review` (never rendered) for the owner to fill in. docs/17-content-review.md
 * collects those notes.
 */
export type ServiceLanding = {
  slug: string
  cluster: "hosting" | "business"
  /** Service name — eyebrow, breadcrumb, nav label and schema name. */
  name: string
  /** H1. */
  title: string
  description: string
  /** <title>, ≤ 60 characters. */
  metaTitle: string
  metaDescription: string
  bullets: string[]
  /** Value of the quote form's "service" dropdown. */
  quoteService: string
  /** Hero illustration — "service" shows only verified facts. */
  heroVisual: "service"
  /** Answer-first block: the question people search and a direct 40–60 word answer. */
  answer: { question: string; answer: string; facts: string[] }
  steps: { name: string; text: string }[]
  includes: { eyebrow: string; title: string; description?: string; items: { title: string; description: string; icon: LucideIcon }[] }
  /** Cloud hosting shows the cloud VPS tiers; the others are quoted. */
  pricing: "vps" | "quote"
  quote: { title: string; description: string }
  faqs: FAQItem[]
  /** Internal route paths of related service pages (cluster links). */
  related: string[]
  /** Knowledge-base guide slugs. */
  guides: string[]
  /** Information the business still has to supply — not rendered. */
  review: string[]
}

const supportFact = "24/7 phone and ticket support from our team in Pune"

export const serviceLandings: ServiceLanding[] = [
  {
    slug: "cloud-hosting",
    cluster: "hosting",
    name: "Cloud Hosting",
    title: "Cloud hosting on NVMe cloud VPS, in India or the USA",
    description:
      "Run your website or application on a cloud VPS with its own CPU and RAM, NVMe storage and full root access — deployed on the MagicWorksHost cloud platform in India or the USA.",
    metaTitle: "Cloud Hosting – NVMe Cloud VPS in India & USA",
    metaDescription:
      "Cloud hosting from MagicWorks Host: NVMe cloud VPS with guaranteed CPU and RAM, full root access and a choice of India or USA servers. Compare cloud VPS plans.",
    bullets: ["Guaranteed CPU and RAM, never shared", "Full root access", "NVMe storage on every tier", "Upgrade without a migration project"],
    quoteService: "cloud-hosting",
    heroVisual: "service",
    answer: {
      question: "What is cloud hosting?",
      answer:
        "Cloud hosting runs your website on virtual servers created from a pool of physical hardware, instead of on one shared server. Each cloud server has its own allocated CPU, RAM and storage, can be resized as you grow, and is managed through a control platform. Cloud VPS is the most common form for business websites.",
      facts: ["Cloud VPS with dedicated CPU and RAM allocation", "Servers in India and the USA", supportFact],
    },
    steps: [
      { name: "Choose a tier and region", text: "Pick the CPU, RAM and NVMe storage you need, in India or the USA." },
      { name: "Check out securely", text: "Complete your order in our secure client area — pick the billing period and pay online." },
      { name: "Get your cloud server", text: "Your server is provisioned and the login details are emailed to you; our team can help move your sites across." },
    ],
    includes: {
      eyebrow: "What you get",
      title: "Cloud VPS with the control of your own server",
      items: [
        { title: "Allocated resources", description: "CPU and RAM reserved for your server, so a busy neighbour can't slow you down.", icon: Gauge },
        { title: "Full root access", description: "Install the software stack your application needs and configure the server your way.", icon: Server },
        { title: "NVMe storage", description: "Fast NVMe drives on every tier for quicker database queries and page loads.", icon: Boxes },
        { title: "India or USA", description: "Host close to your visitors — servers in India and in the United States.", icon: Globe },
        { title: "Grow without moving", description: "Move to a bigger tier as traffic grows, without a migration project.", icon: TrendingUp },
        { title: "24/7 support", description: "Phone and ticket support around the clock from our team in Pune.", icon: HeadphonesIcon },
      ],
    },
    pricing: "vps",
    quote: { title: "Need a custom cloud setup?", description: "Tell us about your application, traffic and region, and we'll recommend a cloud VPS tier." },
    faqs: [
      {
        question: "Is your cloud hosting the same as your VPS hosting?",
        answer:
          "Yes. Our cloud hosting is delivered as cloud VPS: each server is a virtual machine with its own CPU, RAM and NVMe storage, deployed on the MagicWorksHost cloud platform. The tiers and prices are the VPS plans shown on this page.",
      },
      {
        question: "Do I get root access?",
        answer: "Yes. Every cloud VPS comes with full root access, so you can install and configure the software your site or application needs.",
      },
      {
        question: "Which region should I choose?",
        answer: "Choose the region closest to most of your visitors: India for an Indian audience, the USA for visitors in North America. Shorter distance means lower latency.",
      },
      {
        question: "Can I upgrade my cloud server later?",
        answer: "Yes. You can move to a bigger tier as your traffic grows without rebuilding your server from scratch.",
      },
      {
        question: "Is cloud hosting better than shared hosting?",
        answer:
          "Cloud hosting gives you reserved resources and full control, which suits growing sites, online stores and applications. A small business website or blog usually runs well on shared hosting, which costs less and needs no server administration.",
      },
    ],
    related: ["/vps-hosting", "/hosting/buy-web-hosting", "/dedicated-hosting/managed-dedicated-server", "/services/website-migration"],
    guides: ["what-is-cloud-hosting", "what-is-vps-hosting", "what-is-shared-hosting"],
    review: [
      "Confirm that 'cloud hosting' should be sold as the cloud VPS tiers (the WordPress site describes VPS as cloud VPS on the MagicWorksHost cloud management platform).",
      "Add any cloud-specific features actually offered (snapshots, hourly billing, scaling, multiple regions) — none are claimed today.",
    ],
  },
  {
    slug: "reseller-hosting",
    cluster: "hosting",
    name: "Reseller Hosting",
    title: "Reseller hosting for agencies, freelancers and IT providers",
    description:
      "Host your clients' websites under your own business. Tell us how many sites, how much storage and which region you need, and our team will propose a reseller account that fits.",
    metaTitle: "Reseller Hosting for Agencies & Freelancers",
    metaDescription:
      "Reseller hosting from MagicWorks Host for web agencies and freelancers. Share your client count, storage and region, and get a reseller hosting quote from our team.",
    bullets: ["Host many client websites from one account", "Servers in India and the USA", "Quoted for your client base", "24/7 phone and ticket support"],
    quoteService: "reseller-hosting",
    heroVisual: "service",
    answer: {
      question: "What is reseller hosting?",
      answer:
        "Reseller hosting is a hosting account that lets you create and manage separate hosting accounts for other people — usually your clients — and bill them under your own business. The hosting company runs the servers and network; you set up client accounts, decide what to charge and give your clients first-line support.",
      facts: ["Suited to web designers, agencies and IT service providers", "Quoted to match your client count and storage", supportFact],
    },
    steps: [
      { name: "Tell us about your clients", text: "Share how many websites you host, their storage and email needs, and the region your clients are in." },
      { name: "Get a proposal", text: "Our team recommends a reseller setup and sends you the pricing." },
      { name: "Move your clients in", text: "Once your account is ready, create client accounts and bring their sites across." },
    ],
    includes: {
      eyebrow: "Plan your reseller account",
      title: "What to include in your quote request",
      description: "The more we know, the more accurate the proposal. These are the details our team will ask about.",
      items: [
        { title: "Number of client sites", description: "How many websites you host today, and how many you expect to add this year.", icon: Users },
        { title: "Storage and traffic", description: "Total disk space and monthly bandwidth across your clients' sites.", icon: Boxes },
        { title: "Email accounts", description: "Whether your clients use email on their own domains, and roughly how many mailboxes.", icon: Mail },
        { title: "Region", description: "Where your clients' visitors are — we have servers in India and the USA.", icon: MapPin },
        { title: "Domains and SSL", description: "Whether you also want to register domains and buy SSL certificates for clients.", icon: Lock },
        { title: "Existing host", description: "Where the sites are hosted now, so we can plan the move with you.", icon: ArrowRightLeft },
      ],
    },
    pricing: "quote",
    quote: { title: "Request a reseller hosting quote", description: "Share your requirements and our team will follow up with a reseller proposal and pricing." },
    faqs: [
      {
        question: "How much does reseller hosting cost?",
        answer: "Reseller accounts are priced to your client base — the number of sites, storage, bandwidth and email you need. Request a quote and our team will send you a proposal.",
      },
      {
        question: "Who is reseller hosting for?",
        answer:
          "It suits web designers, development agencies and IT providers who build or manage websites for clients and want to host those sites themselves under one account.",
      },
      {
        question: "What's the difference between reseller and shared hosting?",
        answer:
          "Shared hosting gives you one hosting account for your own websites. Reseller hosting lets you create separate accounts for different clients, each with its own login and resources, so you can host and bill them independently.",
      },
      {
        question: "Can I move my existing clients to MagicWorks Host?",
        answer: "Yes. Tell us where the sites are hosted today in your quote request and our team will plan the move with you.",
      },
      {
        question: "Do I need technical skills to run a reseller account?",
        answer: "You should be comfortable setting up hosting accounts and handling your clients' day-to-day questions. We manage the servers and network, with 24/7 support for you.",
      },
    ],
    related: ["/hosting/buy-web-hosting", "/services/cloud-hosting", "/services/website-migration", "/domain/domain-name-registration"],
    guides: ["what-is-reseller-hosting", "what-is-shared-hosting", "website-migration-checklist"],
    review: [
      "No reseller plans are published (WHMCS store and WordPress site list none). Add plans, prices and limits once decided — the page currently asks for a quote.",
      "Confirm which control panel reseller customers get (e.g. WHM/cPanel) and whether white-label branding is offered before mentioning either.",
    ],
  },
  {
    slug: "website-development",
    cluster: "business",
    name: "Website Development",
    title: "Website development for businesses that want it done right",
    description:
      "Tell us what your website needs to do — a company site, a WordPress site or an online store — and our team will scope it, quote it and set it up on fast hosting with your domain, SSL and email.",
    metaTitle: "Website Development Services – Get a Quote",
    metaDescription:
      "Website development from MagicWorks Host: business websites, WordPress sites and online stores, delivered with domain, hosting, SSL and email. Request a project quote.",
    bullets: ["Business websites, WordPress and online stores", "Hosting, domain, SSL and email in one place", "Scoped and quoted before work starts", "Pune-based team since 2012"],
    quoteService: "website-development",
    heroVisual: "service",
    answer: {
      question: "What does a website development service include?",
      answer:
        "A website development service plans, designs and builds your site, then launches it on hosting with your domain connected and HTTPS enabled. A typical project covers the page structure, design, content entry, contact forms, mobile layout, basic on-page SEO and launch; the exact scope and price are agreed in a quote before work begins.",
      facts: ["Domain, hosting, SSL and business email from one provider", "Every project scoped and quoted up front", supportFact],
    },
    steps: [
      { name: "Share your requirements", text: "Tell us about your business, the pages and features you need, and any sites you like." },
      { name: "Agree the scope and quote", text: "Our team confirms what will be built, the timeline and the price before any work starts." },
      { name: "Review and launch", text: "Review the site, request changes, then launch it on your hosting with your domain and SSL." },
    ],
    includes: {
      eyebrow: "Typical projects",
      title: "What we can build with you",
      description: "Every project is scoped individually — your quote confirms exactly what's included.",
      items: [
        { title: "Business websites", description: "Company, service and portfolio sites that explain what you do and how to reach you.", icon: LayoutTemplate },
        { title: "WordPress websites", description: "Sites you can update yourself, built on the CMS our hosting is tuned for.", icon: Code },
        { title: "Online stores", description: "WooCommerce stores for selling products or services online.", icon: ShoppingCart },
        { title: "Domain and email setup", description: "Register your domain and set up business email on it alongside the build.", icon: Mail },
        { title: "SSL and HTTPS", description: "Every MagicWorks hosting plan includes a free SSL certificate.", icon: Lock },
        { title: "Launch on fast hosting", description: "Go live on NVMe hosting with daily JetBackup snapshots and 24/7 support.", icon: Server },
      ],
    },
    pricing: "quote",
    quote: { title: "Request a website development quote", description: "Describe your project and our team will follow up with a scope, timeline and price." },
    faqs: [
      {
        question: "How much does a website cost?",
        answer:
          "It depends on the number of pages, the features (such as online payments or bookings) and how much content needs creating. Share your requirements and we'll send a quote before any work starts.",
      },
      {
        question: "What should I prepare before asking for a quote?",
        answer:
          "A short description of your business, the pages you need, features like forms or an online store, your logo and brand colours if you have them, and two or three websites you like.",
      },
      {
        question: "Can you host the website as well?",
        answer:
          "Yes. We provide the hosting, domain registration, SSL certificates and business email, so the new site can launch with everything connected in one place.",
      },
      {
        question: "Can I update the website myself after launch?",
        answer: "If your site is built on WordPress, you can edit pages and posts from its dashboard. Ask for this in your quote request so the build is planned around it.",
      },
    ],
    related: ["/services/website-maintenance", "/services/website-security", "/hosting/wordpress-hosting", "/domain/domain-name-registration"],
    guides: ["domain-vs-hosting", "what-is-managed-wordpress-hosting", "how-to-speed-up-wordpress"],
    review: [
      "Add real scope, packages or starting prices, typical timelines and a portfolio link when available — the page currently quotes per project.",
      "Confirm the platforms you build on (WordPress/WooCommerce are mentioned only as project types) and ownership/handover terms before stating them.",
    ],
  },
  {
    slug: "website-maintenance",
    cluster: "business",
    name: "Website Maintenance",
    title: "Website maintenance that keeps your site updated, backed up and secure",
    description:
      "Hand over the routine work — updates, checks, fixes and small changes — and keep your website running smoothly. Tell us what your site needs and our team will quote a maintenance plan.",
    metaTitle: "Website Maintenance Services – Updates & Care",
    metaDescription:
      "Website maintenance from MagicWorks Host: updates, backup checks, security monitoring and small fixes for business websites and WordPress sites. Request a quote.",
    bullets: ["Updates, checks and small fixes", "Backed by daily JetBackup snapshots", "Daily malware scanning on our hosting", "Quoted to your site's needs"],
    quoteService: "website-maintenance",
    heroVisual: "service",
    answer: {
      question: "What is website maintenance?",
      answer:
        "Website maintenance is the ongoing work that keeps a site secure, fast and accurate after launch: updating the CMS, plugins and themes, checking backups, monitoring for malware and downtime, renewing the domain and SSL, and making small content changes. Skipping it is the most common reason small business sites get hacked or break.",
      facts: ["Daily JetBackup snapshots on our hosting", "Daily malware scanning on hosting accounts", supportFact],
    },
    steps: [
      { name: "Tell us about your site", text: "Share the platform, the plugins it uses, how often it changes and what worries you most." },
      { name: "Agree a maintenance plan", text: "Our team proposes the tasks and frequency that fit your site, with the price, before anything starts." },
      { name: "Hand over the routine", text: "We take care of the agreed tasks and keep you posted; you ask for changes when you need them." },
    ],
    includes: {
      eyebrow: "Typical maintenance tasks",
      title: "What a maintenance plan can cover",
      description: "Your quote lists exactly which tasks are included and how often.",
      items: [
        { title: "Core, plugin and theme updates", description: "Keeping WordPress and its plugins current closes the security holes attackers look for.", icon: RefreshCw },
        { title: "Backup checks", description: "Our hosting takes daily JetBackup snapshots; maintenance confirms you can restore from them.", icon: DatabaseBackup },
        { title: "Security monitoring", description: "Hosting accounts get daily malware scanning; maintenance follows up on anything it finds.", icon: ShieldCheck },
        { title: "Small content changes", description: "Text, image and page updates without you logging in.", icon: LayoutTemplate },
        { title: "Domain and SSL renewals", description: "Making sure the domain and certificate never lapse and take the site offline.", icon: Globe },
        { title: "Fixes when something breaks", description: "Help when an update, plugin conflict or error takes part of the site down.", icon: Wrench },
      ],
    },
    pricing: "quote",
    quote: { title: "Request a maintenance quote", description: "Tell us about your website and our team will propose a maintenance plan and price." },
    faqs: [
      {
        question: "How much does website maintenance cost?",
        answer: "It depends on the platform, the number of plugins and how often your site changes. Share the details and we'll quote a plan that covers what your site actually needs.",
      },
      {
        question: "How often should a website be updated?",
        answer:
          "Check for WordPress core, plugin and theme updates at least weekly and apply security releases as soon as possible. Content should be reviewed whenever your prices, services or contact details change.",
      },
      {
        question: "Do I need maintenance if my hosting includes backups?",
        answer:
          "Backups let you recover after something goes wrong; maintenance helps stop it going wrong. Our hosting includes daily JetBackup snapshots, and maintenance adds the updates, checks and fixes that backups don't cover.",
      },
      {
        question: "Can you maintain a site hosted elsewhere?",
        answer: "Tell us where it's hosted in your quote request. Moving it to our hosting is also an option — website migration is free on annual hosting plans.",
      },
    ],
    related: ["/services/website-security", "/services/website-development", "/hosting/wordpress-hosting", "/dedicated-hosting/managed-dedicated-server"],
    guides: ["how-website-backups-work", "common-website-security-threats", "how-to-speed-up-wordpress"],
    review: [
      "Publish the actual maintenance plans (tasks, frequency, response times, price) when decided — tasks are listed as typical and the quote confirms them.",
      "Confirm whether sites hosted elsewhere can be maintained.",
    ],
  },
  {
    slug: "website-migration",
    cluster: "business",
    name: "Website Migration",
    title: "Website migration to MagicWorks Host, handled by our team",
    description:
      "Move your website, databases and email from your current host without doing it yourself. Migration is free on annual hosting plans, and our team handles DNS and redirects carefully so your visitors and rankings aren't disrupted.",
    metaTitle: "Website Migration Service – Free on Annual Plans",
    metaDescription:
      "Move your website to MagicWorks Host: our team migrates your site, database and email, free on annual hosting plans, with DNS and redirects handled carefully.",
    bullets: ["Free on annual hosting plans", "Files, databases and email moved for you", "DNS and redirects handled carefully", "Moves between our India and USA servers too"],
    quoteService: "website-migration",
    heroVisual: "service",
    answer: {
      question: "What is website migration?",
      answer:
        "Website migration is moving a website — its files, databases, email and settings — from one hosting provider or server to another, then pointing the domain at the new server. Done carefully, the site is copied and tested on the new host before DNS is switched, so visitors never see it go down.",
      facts: ["Free migration on annual hosting plans", "Help moving mailboxes during email setup", supportFact],
    },
    steps: [
      { name: "Choose your new plan", text: "Pick a hosting plan — migration is free on annual plans — or ask us which plan fits your site." },
      { name: "Share access to your current host", text: "Give our team the access needed to copy your site, database and email." },
      { name: "We move it and switch DNS", text: "We copy and check the site on the new server, then update DNS and redirects so nothing breaks." },
    ],
    includes: {
      eyebrow: "What we move",
      title: "Everything your website needs, moved across",
      items: [
        { title: "Website files", description: "Your site's code, themes, uploads and media.", icon: Boxes },
        { title: "Databases", description: "The databases behind WordPress, WooCommerce and other PHP applications.", icon: DatabaseBackup },
        { title: "Email", description: "Help moving mailboxes when you set up email with us.", icon: Mail },
        { title: "DNS and redirects", description: "Handled carefully during the switch to avoid downtime and ranking disruption.", icon: ArrowRightLeft },
        { title: "Between our data centres", description: "Need to move from a USA plan to an India plan (or back)? Support moves it for you.", icon: Globe },
        { title: "Help when you need it", description: "Phone and ticket support around the clock, during and after the move.", icon: HeadphonesIcon },
      ],
    },
    pricing: "quote",
    quote: {
      title: "Plan your migration",
      description: "Free on annual hosting plans. For larger or unusual setups, tell us what you're moving and we'll plan it with you.",
    },
    faqs: [
      {
        question: "Is website migration really free?",
        answer: "Yes — our team migrates your existing website at no extra cost when you choose an annual hosting plan.",
      },
      {
        question: "Will my website go down during the migration?",
        answer:
          "The site is copied to the new server and checked before DNS is switched, and our team handles DNS and redirects carefully, so visitors keep reaching your site throughout.",
      },
      {
        question: "Will moving hosts affect my Google rankings?",
        answer: "Not if the URLs stay the same and the site stays reachable. We handle DNS and redirects carefully during the move to avoid ranking disruption.",
      },
      {
        question: "Can you move my email as well?",
        answer: "Yes. Our team can assist with mailbox migration when you set up email hosting with us.",
      },
      {
        question: "What do I need to give you?",
        answer: "Access to your current hosting account (or a full backup), your domain registrar login if DNS needs changing, and a list of email accounts to move.",
      },
    ],
    related: ["/hosting/buy-web-hosting", "/hosting/wordpress-hosting", "/services/cloud-hosting", "/domain/transfer-your-domain-name"],
    guides: ["website-migration-checklist", "wordpress-migration-guide", "how-to-transfer-a-domain"],
    review: [
      "State the price of migrations not covered by the free annual-plan offer (monthly plans, very large sites, VPS/dedicated) if one applies.",
      "Add a typical turnaround time once confirmed — none is promised today.",
    ],
  },
  {
    slug: "website-security",
    cluster: "business",
    name: "Website Security",
    title: "Website security that starts on the server, not after an attack",
    description:
      "Every MagicWorks hosting account gets free SSL, daily malware scanning, server-level hardening and daily backups. For anything beyond that — a hacked site, an audit, a paid certificate — our team can help.",
    metaTitle: "Website Security – SSL, Malware Scanning & Backups",
    metaDescription:
      "Website security from MagicWorks Host: free SSL, daily malware scanning, server hardening and daily JetBackup snapshots, plus help for hacked or at-risk sites.",
    bullets: ["Free SSL on every hosting plan", "Daily malware scanning", "Server-level hardening", "Daily JetBackup snapshots to roll back"],
    quoteService: "website-security",
    heroVisual: "service",
    answer: {
      question: "What is website security?",
      answer:
        "Website security is the set of measures that keep a site, its data and its visitors safe: HTTPS encryption, up-to-date software, strong logins, malware scanning, server hardening and backups you can restore from. Most attacks on small business sites exploit outdated plugins or weak passwords, so prevention covers most of the risk.",
      facts: ["Free SSL, daily malware scanning and hardening on every hosting account", "Paid DV, OV, EV and wildcard SSL installed free on our hosting", supportFact],
    },
    steps: [
      { name: "Start with secure hosting", text: "Every hosting plan includes free SSL, daily malware scanning, server hardening and daily backups." },
      { name: "Upgrade where it matters", text: "Add an OV, EV or wildcard certificate if your business needs stronger identity checks or subdomain coverage." },
      { name: "Ask us when something's wrong", text: "If your site is compromised or you want a security review, contact our team and we'll help." },
    ],
    includes: {
      eyebrow: "Protection on every hosting account",
      title: "Security that's built in, not bolted on",
      items: [
        { title: "Free SSL certificate", description: "HTTPS on your domain at no extra cost, activated automatically.", icon: Lock },
        { title: "Daily malware scanning", description: "Hosting accounts are scanned every day for malicious files.", icon: ShieldCheck },
        { title: "Server-level hardening", description: "Hardened server configuration applied before your account goes live.", icon: Server },
        { title: "Daily backup snapshots", description: "Roll back files or your whole account with JetBackup from cPanel.", icon: DatabaseBackup },
        { title: "Paid certificates", description: "DV, OV, EV and wildcard SSL from Sectigo, installed free on our hosting.", icon: Cloud },
        { title: "Help after an incident", description: "Talk to our team if your website has been compromised.", icon: HeadphonesIcon },
      ],
    },
    pricing: "quote",
    quote: {
      title: "Get help securing your website",
      description: "Hacked site, security review or a certificate question? Tell us what's happening and our team will get back to you.",
    },
    faqs: [
      {
        question: "Is SSL included with hosting?",
        answer: "Yes. Every MagicWorks Host hosting plan includes a free SSL certificate. Paid DV, OV, EV and wildcard certificates are available if you need stronger validation or subdomain coverage.",
      },
      {
        question: "Do you scan websites for malware?",
        answer: "Yes. Hosting accounts get daily malware scanning, on top of server-level hardening applied before an account goes live.",
      },
      {
        question: "What should I do if my website is hacked?",
        answer:
          "Change your hosting, CMS and email passwords, contact our support team, and restore a clean JetBackup snapshot from before the compromise once the cause is found. Updating outdated plugins and themes stops it happening again.",
      },
      {
        question: "Does website security affect SEO?",
        answer:
          "Yes. Browsers warn visitors about sites without HTTPS, and search engines can flag or drop pages that serve malware. Keeping the site secure protects both your visitors and your rankings.",
      },
    ],
    related: ["/ssl", "/services/website-maintenance", "/dedicated-hosting/managed-dedicated-server", "/hosting/wordpress-hosting"],
    guides: ["common-website-security-threats", "what-is-ssl", "how-website-backups-work"],
    review: [
      "Publish the scope and price of malware clean-up and security audits if these are paid services — the page currently asks visitors to contact the team.",
      "Name the malware scanner / WAF in use only if you want it shown (none is named today).",
    ],
  },
]

export function getServiceLanding(slug: string) {
  return serviceLandings.find((service) => service.slug === slug)
}

/** Route path of a service page (its public URL comes from WORDPRESS_ROUTES). */
export const serviceLandingPath = (slug: string) => `/services/${slug}`

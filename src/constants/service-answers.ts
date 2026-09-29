/**
 * Answer-first content for every product page: a direct definition answering the page's core
 * question (what featured snippets and AI answer engines quote), a few key facts, and the blog
 * category that forms this page's topic cluster. Written as plain, factual explanations —
 * product specifics stay in the page's own plans/FAQs.
 */
export type ServiceAnswer = {
  question: string
  answer: string
  facts: string[]
  /** Blog category (see blogCategories) whose articles support this page. */
  topic: string
}

const sharedFacts = ["Free SSL certificate included", "cPanel control panel", "24/7 phone and ticket support"]

export const serviceAnswers: Record<string, ServiceAnswer> = {
  "/hosting/buy-web-hosting": {
    question: "What is web hosting?",
    answer:
      "Web hosting is a service that stores your website's files, databases and email on a server that is connected to the internet around the clock, so anyone can open your site by typing its domain name. With shared hosting, many websites share one well-managed server, which keeps the cost low while the provider handles security, updates and uptime.",
    facts: ["NVMe SSD storage for faster page loads", ...sharedFacts],
    topic: "web-hosting",
  },
  "/hosting/seo-hosting": {
    question: "What is SEO hosting?",
    answer:
      "SEO hosting is web hosting chosen for the factors that affect search rankings: fast server response, reliable uptime, HTTPS and a clean IP reputation. Search engines use page speed and Core Web Vitals as ranking signals, so hosting on fast NVMe storage with a free SSL certificate helps pages load quickly and stay indexable.",
    facts: ["Faster time to first byte on NVMe storage", "Free SSL for HTTPS ranking signal", "99.9% uptime target so crawlers can reach your pages"],
    topic: "web-hosting",
  },
  "/hosting/wordpress-hosting": {
    question: "What is WordPress hosting?",
    answer:
      "WordPress hosting is web hosting configured for WordPress sites — the PHP version, database and caching are tuned for it and WordPress can be installed in one click. It is usually shared hosting with those optimisations, so it suits blogs, business sites and WooCommerce stores that don't yet need a VPS.",
    facts: ["One-click WordPress install via Softaculous", "Tuned PHP and database for WordPress", ...sharedFacts.slice(0, 2)],
    topic: "wordpress",
  },
  "/hosting/linux-shared-hosting": {
    question: "What is Linux shared hosting?",
    answer:
      "Linux shared hosting runs your website on a Linux server alongside other sites, using the standard LAMP stack (Linux, Apache/LiteSpeed, MySQL/MariaDB and PHP). It supports virtually every PHP application — WordPress, Joomla, Drupal, Laravel and more — and is the most common and affordable way to host a website.",
    facts: ["Runs PHP, MySQL/MariaDB and most CMS platforms", "cPanel with one-click app installs", "Free SSL and email accounts"],
    topic: "web-hosting",
  },
  "/hosting/unlimited-hosting": {
    question: "What does unlimited hosting mean?",
    answer:
      "Unlimited hosting is a shared hosting plan without fixed caps on the number of websites, bandwidth or email accounts you can create. It still runs on a shared server, so usage must stay within fair-use limits for CPU, memory and file counts; it is ideal for agencies and owners of several small sites.",
    facts: ["Host multiple websites on one plan", "Unlimited email accounts", "Subject to fair-use resource limits"],
    topic: "web-hosting",
  },
  "/hosting/usa-web-hosting": {
    question: "When should you choose USA web hosting?",
    answer:
      "Choose USA web hosting when most of your visitors are in North America. Data travels a shorter distance from a US server to US visitors, which lowers latency and speeds up page loads for that audience; for visitors in India, hosting in India is faster.",
    facts: ["Servers located in the United States", ...sharedFacts],
    topic: "web-hosting",
  },
  "/vps-hosting": {
    question: "What is VPS hosting?",
    answer:
      "VPS (Virtual Private Server) hosting splits one physical server into isolated virtual servers, each with its own guaranteed CPU, RAM, storage and operating system. You get root access and dedicated resources like a dedicated server, at a fraction of the cost — the usual next step when a site outgrows shared hosting.",
    facts: ["Guaranteed vCPU and RAM, not shared", "Full root access and choice of OS", "Available in India and USA data centres"],
    topic: "web-hosting",
  },
  "/dedicated-hosting/dedicated-server": {
    question: "What is a dedicated server?",
    answer:
      "A dedicated server is a physical server rented entirely to one customer — no other websites share its CPU, memory, disks or network. It delivers the highest performance, isolation and control, which is why it is used for high-traffic sites, large databases and applications with strict security needs.",
    facts: ["Whole physical server for one customer", "Full root access", "India and USA locations"],
    topic: "web-hosting",
  },
  "/dedicated-hosting/managed-dedicated-server": {
    question: "What is a managed dedicated server?",
    answer:
      "A managed dedicated server is a dedicated server where the hosting provider's engineers handle setup, operating-system updates, security patching, monitoring and backups for you. You get the power of a whole server without needing an in-house system administrator.",
    facts: ["OS updates and security patching handled for you", "Proactive monitoring", "Expert support for server issues"],
    topic: "web-hosting",
  },
  "/dedicated-hosting/linux-dedicated-server": {
    question: "What is a Linux dedicated server?",
    answer:
      "A Linux dedicated server is a physical server running a Linux distribution such as AlmaLinux or Ubuntu, rented to a single customer. Linux is the most widely used server operating system: it is stable, secure, free of licence fees and runs the full open-source web stack.",
    facts: ["Choice of Linux distribution", "No OS licence cost", "Full root access"],
    topic: "web-hosting",
  },
  "/domain/domain-name-registration": {
    question: "What is domain name registration?",
    answer:
      "Domain name registration is reserving a web address — such as yourbusiness.com — through an accredited registrar for a set period, usually one year or more. While it stays registered and renewed, only you can use that name for your website and email.",
    facts: ["Register for 1 year or more", "Manage DNS from your client area", "Renew before expiry to keep the name"],
    topic: "domains-email",
  },
  "/domain/indian-domain": {
    question: "What is an Indian domain (.in)?",
    answer:
      "An Indian domain uses India's country-code extension — .in, or second-level extensions such as .co.in — and tells visitors and search engines that a site is focused on India. It is a strong choice for businesses whose customers are mainly in India, and it is often available when the .com name is taken.",
    facts: [".in and .co.in extensions", "Signals an India-focused business", "Often available when .com is taken"],
    topic: "domains-email",
  },
  "/domain/domain-hosting": {
    question: "What is the difference between a domain and hosting?",
    answer:
      "A domain is your website's address; hosting is the server space where the website's files live. You need both: the domain's DNS points visitors to the hosting server. Keeping them with one provider means one account, one bill and DNS that is connected for you.",
    facts: ["Domain = address, hosting = storage", "DNS connects the two", "One account for both simplifies renewals"],
    topic: "domains-email",
  },
  "/domain/buy-domain-name": {
    question: "How do you buy a domain name?",
    answer:
      "Search for the name you want, pick an available extension (.com, .in, .co.in, .org…), add it to your cart and pay for the registration period. The domain is registered to you immediately and you can point it to your website and email from your client area.",
    facts: ["Check availability instantly", "Choose the extension that fits your audience", "Registered to you on payment"],
    topic: "domains-email",
  },
  "/domain/transfer-your-domain-name": {
    question: "How does a domain transfer work?",
    answer:
      "To transfer a domain, unlock it at your current registrar, get its authorisation (EPP) code and start the transfer with the new registrar using that code. After you approve the request by email the transfer usually completes within 5–7 days, and a year is typically added to the registration.",
    facts: ["Unlock the domain and get the EPP code", "Approve the transfer by email", "Usually completes within 5–7 days"],
    topic: "domains-email",
  },
  "/domain/renew": {
    question: "What happens if a domain isn't renewed?",
    answer:
      "If a domain isn't renewed by its expiry date, the website and email on it stop working. It then enters a grace period and a redemption period — renewing becomes more expensive — and after that the name is released and anyone can register it. Renewing early or enabling auto-renew avoids losing it.",
    facts: ["Website and email stop at expiry", "Grace and redemption periods follow", "Auto-renew prevents accidental loss"],
    topic: "domains-email",
  },
  "/email-hosting/business": {
    question: "What is business email hosting?",
    answer:
      "Business email hosting gives you professional mailboxes on your own domain — like you@yourbusiness.com — with spam filtering, webmail and standard IMAP/POP/SMTP access for phones and email apps. It looks more trustworthy than a free webmail address and keeps company email under your control.",
    facts: ["Email on your own domain", "Spam and virus filtering", "Works with webmail, Outlook and mobile apps"],
    topic: "domains-email",
  },
  "/email-hosting/enterprise": {
    question: "What is enterprise email hosting?",
    answer:
      "Enterprise email hosting adds larger mailboxes and collaboration tools — shared calendars, contacts and file storage — on top of business email, for teams that work together all day. It suits growing companies that need more storage per user and shared scheduling.",
    facts: ["Larger mailbox storage", "Shared calendars and contacts", "File storage for teams"],
    topic: "domains-email",
  },
  "/ssl": {
    question: "What is an SSL certificate?",
    answer:
      "An SSL (TLS) certificate encrypts the connection between a visitor's browser and your website and proves the site's identity, which is what enables HTTPS and the padlock icon. Browsers label sites without it 'Not secure', and search engines use HTTPS as a ranking signal.",
    facts: ["Encrypts data in transit (256-bit)", "Enables HTTPS and the padlock", "Validation levels: DV, OV and EV"],
    topic: "security",
  },
  "/ssl/domain-validated": {
    question: "What is a Domain Validated (DV) SSL certificate?",
    answer:
      "A Domain Validated certificate is the basic SSL level: the certificate authority only checks that you control the domain, usually by email or DNS, so it can be issued within minutes. It gives full encryption and the padlock, making it ideal for blogs, portfolios and small business sites.",
    facts: ["Issued in minutes", "Verifies domain control only", "Same 256-bit encryption as higher levels"],
    topic: "security",
  },
  "/ssl/domain-validated-sni": {
    question: "What is SNI SSL?",
    answer:
      "SNI (Server Name Indication) is a TLS extension that lets one IP address serve SSL certificates for many domains. A DV certificate delivered with SNI works in every modern browser, so you don't need to pay for a dedicated IP address just to run HTTPS.",
    facts: ["No dedicated IP required", "Supported by all modern browsers", "Same DV encryption strength"],
    topic: "security",
  },
  "/ssl/business-validated": {
    question: "What is a Business (Organization) Validated SSL certificate?",
    answer:
      "An Organization Validated (OV) certificate confirms both domain control and that your business legally exists; the verified company name is shown in the certificate details. It takes a few days to issue and gives customers more confidence on business and login pages.",
    facts: ["Verifies your organisation's identity", "Company name in certificate details", "Issued in 1–3 business days"],
    topic: "security",
  },
  "/ssl/extended-validated": {
    question: "What is an Extended Validation (EV) SSL certificate?",
    answer:
      "An Extended Validation certificate is the highest level of SSL assurance: the certificate authority performs a full legal, physical and operational check of the organisation before issuing it. It is used by banks, e-commerce and payment pages where proving identity matters most.",
    facts: ["Most rigorous identity verification", "Best for e-commerce and payments", "Highest assurance level"],
    topic: "security",
  },
  "/ssl/wildcard": {
    question: "What is a wildcard SSL certificate?",
    answer:
      "A wildcard SSL certificate secures a domain and all of its first-level subdomains with a single certificate — for example *.yourbusiness.com covers shop., blog. and mail.yourbusiness.com. It is simpler and usually cheaper than buying a separate certificate for each subdomain.",
    facts: ["Covers unlimited first-level subdomains", "One certificate to manage and renew", "Domain-validated issuance"],
    topic: "security",
  },
}

/** Steps shown in "How to get started" on product pages (and exposed as HowTo schema). */
export function gettingStartedSteps(kind: "hosting" | "server" | "domain" | "email" | "ssl"): { name: string; text: string }[] {
  const checkout = { name: "Check out securely", text: "Complete your order in our secure client area — pick the billing period, apply any promo and pay online." }
  switch (kind) {
    case "domain":
      return [
        { name: "Search for your name", text: "Type the domain you want and check which extensions (.com, .in, .co.in, .org) are available." },
        checkout,
        { name: "Point it to your website", text: "Manage DNS from your client area, or add hosting and we'll connect the domain for you." },
      ]
    case "email":
      return [
        { name: "Choose mailboxes", text: "Pick the plan and how many mailboxes your team needs on your own domain." },
        checkout,
        { name: "Connect your devices", text: "We set up the DNS records; then sign in on webmail, Outlook or your phone." },
      ]
    case "ssl":
      return [
        { name: "Pick the validation level", text: "DV for most sites, OV to show your organisation, EV for the highest assurance, wildcard for subdomains." },
        checkout,
        { name: "Validate and install", text: "Complete the validation step and our team installs the certificate on your hosting for free." },
      ]
    case "server":
      return [
        { name: "Choose a plan and region", text: "Select the CPU, RAM and storage you need, in India or the USA." },
        checkout,
        { name: "Get your server", text: "Your server is provisioned and the login details are emailed to you; our team can help migrate your sites." },
      ]
    default:
      return [
        { name: "Choose a plan", text: "Compare storage, bandwidth and email accounts and pick the plan that fits your site." },
        checkout,
        { name: "Launch your site", text: "Your account is ready within minutes: install WordPress in one click or ask us to migrate your existing site for free." },
      ]
  }
}

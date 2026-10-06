import type { KBGuide } from "./types"

export const wordpressGuides: KBGuide[] = [
  {
    slug: "what-is-managed-wordpress-hosting",
    categorySlug: "wordpress",
    title: "What Is Managed WordPress Hosting?",
    description:
      "Managed WordPress hosting means the host runs updates, backups, security and caching for you. Learn what it covers, what you give up and who needs it.",
    excerpt:
      "What managed WordPress hosting usually includes, what control you trade for it, and how it compares with WordPress-optimised shared hosting.",
    readTime: "5 min read",
    updated: "2026-10-03",
    answer:
      "Managed WordPress hosting is a service where the provider runs the WordPress layer for you: core and plugin updates, backups, security hardening, caching and performance tuning are handled by the host, usually with fewer server controls in return. It suits owners who want to focus on content and sales rather than maintenance.",
    keyTakeaways: [
      "Managed WordPress hosting means the host takes on routine WordPress upkeep such as updates, backups and caching.",
      "In exchange you usually get less control, such as restricted plugins, no cPanel and limited server settings.",
      "WordPress-optimised shared hosting is a different product: the server is tuned for WordPress, but you manage the site yourself.",
      "MagicWorks Host's WordPress hosting is optimised shared hosting with full cPanel access, not a fully managed WordPress service.",
      "If you want the work done for you, you can pair self-managed hosting with a maintenance service or choose a managed server.",
    ],
    sections: [
      {
        heading: "What does managed WordPress hosting mean?",
        body: [
          "The word managed describes who does the ongoing work. On ordinary hosting, the provider keeps the server running and you look after everything inside your account: installing WordPress, updating it, adding plugins, taking backups and fixing problems. On managed WordPress hosting, the provider takes on a large part of that second list.",
          "There is no fixed industry definition, so two managed WordPress plans from different companies can include quite different things. Always read what a plan actually covers rather than relying on the label.",
        ],
      },
      {
        heading: "What does a managed WordPress host usually take care of?",
        body: [
          "Most managed WordPress services include some combination of the following:",
          {
            list: [
              "Automatic updates to WordPress core, and often to plugins and themes, sometimes with a check that the site still loads afterwards.",
              "Scheduled backups with a simple way to restore a previous copy of the site.",
              "Server-level caching configured for WordPress, so you do not need to set up a caching plugin yourself.",
              "Security measures such as a web application firewall, malware scanning and login protection.",
              "A staging site where you can test changes before they go live.",
              "Support staff who understand WordPress and will look at site-level problems, not just server problems.",
            ],
          },
        ],
      },
      {
        heading: "What do you give up with managed WordPress hosting?",
        body: [
          "Because the host is responsible for keeping your site stable, it usually limits what you can change. Common restrictions include a list of disallowed plugins (often caching, backup or security plugins that clash with the host's own tools), no cPanel or a cut-down control panel, limited email hosting, and no option to run other applications in the same account.",
          "Managed plans also tend to be priced per website, so a business running several small sites may pay noticeably more than it would on shared hosting.",
        ],
      },
      {
        heading: "Managed WordPress hosting vs WordPress-optimised shared hosting",
        body: [
          "These two are often confused. The table below shows the usual differences.",
          {
            table: {
              headers: ["", "Managed WordPress hosting", "WordPress-optimised shared hosting"],
              rows: [
                ["Who updates WordPress and plugins", "Usually the host", "You"],
                ["Control panel", "Often a custom dashboard", "Usually cPanel with full access"],
                ["Plugin choice", "Some plugins may be blocked", "Install whatever you need"],
                ["Other apps and email", "Often limited", "Usually included in the same account"],
                ["Best for", "Owners who want hands-off upkeep", "Owners who want control at a lower cost"],
              ],
            },
          },
        ],
      },
      {
        heading: "Is MagicWorks Host's WordPress hosting managed?",
        body: [
          "No, and it is worth being clear about this. MagicWorks Host's WordPress hosting is WordPress-optimised shared hosting with full cPanel access: you keep full control of your site, and the team keeps the server fast. You handle WordPress updates and plugin choices yourself, the same as you would on any cPanel hosting.",
          "The plans run on NVMe storage and include free SSL, one-click WordPress and WooCommerce installs through Softaculous, daily JetBackup snapshots and daily malware scanning, with servers in India and the USA. Support is available 24/7 by phone and ticket.",
          "If you want someone else to handle the work, there are two routes. You can add the website maintenance service, where help with updates and upkeep is available on request, or you can move to a managed dedicated server, where the server itself is run for you.",
        ],
      },
      {
        heading: "Which option suits your business?",
        body: [
          {
            list: [
              "Choose managed WordPress hosting if you have one important site, no technical person, and are happy to accept the host's restrictions.",
              "Choose WordPress-optimised shared hosting if you are comfortable clicking Update in the WordPress dashboard, want cPanel and email in one place, or run more than one site.",
              "Choose optimised hosting plus a maintenance service if you want control over your hosting but do not have time for routine upkeep.",
            ],
          },
          "Whichever you pick, keep at least one backup that you can restore yourself, and keep your plugin list short.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is managed WordPress hosting faster than shared hosting?",
        answer:
          "Not automatically. Speed depends on the server, caching, your theme and your plugins, and a well-tuned shared plan can serve a small business site quickly.",
      },
      {
        question: "Do I need managed WordPress hosting for WooCommerce?",
        answer:
          "No. WooCommerce runs on any hosting that meets WordPress requirements, including WordPress-optimised shared hosting. What matters more is keeping WooCommerce and its extensions updated and taking regular backups.",
      },
      {
        question: "Does MagicWorks Host update my WordPress plugins for me?",
        answer:
          "Not on the WordPress hosting plans, which are self-managed with full cPanel access. If you want help with updates and upkeep, the website maintenance service is available on request.",
      },
      {
        question: "Can I move from managed WordPress hosting to cPanel hosting?",
        answer:
          "Yes. A WordPress site can be moved by copying its files and database to the new host. MagicWorks Host offers free migration of an existing site on annual plans.",
      },
    ],
    relatedServices: [
      { label: "WordPress Hosting", href: "/hosting/wordpress-hosting" },
      { label: "Website Maintenance", href: "/services/website-maintenance" },
      { label: "Managed Dedicated Server", href: "/dedicated-hosting/managed-dedicated-server" },
      { label: "Website Migration", href: "/services/website-migration" },
    ],
    relatedGuides: ["wordpress-hosting-vs-shared-hosting", "how-to-speed-up-wordpress", "what-is-shared-hosting", "wordpress-migration-guide"],
  },
  {
    slug: "wordpress-hosting-vs-shared-hosting",
    categorySlug: "wordpress",
    title: "WordPress Hosting vs Shared Hosting: What's the Difference?",
    metaTitle: "WordPress Hosting vs Shared Hosting: Key Differences",
    description:
      "WordPress hosting is often shared hosting tuned for WordPress. Compare the two side by side and learn which one suits a small business website in India.",
    excerpt:
      "How WordPress hosting differs from regular shared hosting, where the two are the same, and how to choose between them.",
    readTime: "5 min read",
    updated: "2026-10-03",
    answer:
      "Shared hosting is a general-purpose plan where many websites share one server's resources. WordPress hosting is usually shared hosting configured specifically for WordPress, with suitable PHP settings, caching and a one-click installer. Both can run WordPress; WordPress hosting simply removes setup work and is tuned for how WordPress uses the server.",
    keyTakeaways: [
      "Most WordPress hosting plans are shared hosting with WordPress-specific configuration on top.",
      "Regular shared hosting can run WordPress perfectly well, along with other PHP sites and applications.",
      "WordPress hosting is worth it mainly for the server tuning and convenience, not for any WordPress-only feature.",
      "Fully managed WordPress hosting is a separate category in which the host also maintains your site.",
      "If a WordPress site outgrows shared resources, the next step is usually a VPS, whichever shared plan you started on.",
    ],
    sections: [
      {
        heading: "What is shared hosting?",
        body: [
          "On shared hosting, many customer accounts live on one physical server and share its processor, memory and storage. Each account is separated from the others and gets a control panel, usually cPanel, to manage files, databases, email and domains. Because the server cost is split, shared hosting is the cheapest way to put a website online.",
          "A shared plan does not care what software you run, as long as it uses the languages the server supports, typically PHP and MySQL or MariaDB. That includes WordPress, other content management systems and hand-built PHP sites.",
        ],
      },
      {
        heading: "What makes a plan WordPress hosting?",
        body: [
          "WordPress hosting is a label, not a different technology. In most cases it means shared hosting where the provider has adjusted the setup for WordPress, for example:",
          {
            list: [
              "A recent PHP version with the extensions and memory limits WordPress and WooCommerce need.",
              "Caching configured to work with WordPress, so pages are served faster.",
              "A one-click installer that sets up WordPress, the database and an admin login in a few minutes.",
              "Fewer, more WordPress-focused sites per server on some providers, which can mean steadier performance.",
            ],
          },
          "Some companies also sell fully managed WordPress hosting, where they update and maintain your site for you. That is a separate product with its own trade-offs, covered in our guide to managed WordPress hosting.",
        ],
      },
      {
        heading: "How do they compare side by side?",
        body: [
          {
            table: {
              headers: ["", "Regular shared hosting", "WordPress hosting"],
              rows: [
                ["Can run WordPress", "Yes", "Yes"],
                ["Can run non-WordPress sites", "Yes", "Usually yes, though it is not the focus"],
                ["Server settings", "General-purpose", "Tuned for WordPress"],
                ["WordPress setup", "Manual or via installer", "One-click, often preconfigured"],
                ["Who maintains the site", "You", "You, unless the plan is fully managed"],
                ["Typical user", "Mixed or non-WordPress sites", "Sites built entirely on WordPress"],
              ],
            },
          },
        ],
      },
      {
        heading: "When is regular shared hosting enough?",
        body: [
          "If you run a small brochure site, a blog with modest traffic, or a mix of WordPress and plain HTML or PHP sites, regular shared hosting is usually enough. Most cPanel hosts include an installer such as Softaculous, so getting WordPress running is quick on either plan type.",
          "Shared hosting is also the sensible choice if you are not yet sure you will use WordPress at all.",
        ],
      },
      {
        heading: "When should you choose WordPress hosting?",
        body: [
          "Pick a WordPress plan when your site is, and will stay, built on WordPress, and especially if you run WooCommerce or a content-heavy site with many plugins. The WordPress-specific tuning helps most when the site does more work per page, such as building product listings, running searches or handling a basket and checkout.",
        ],
      },
      {
        heading: "What do MagicWorks Host's plans include?",
        body: [
          "At MagicWorks Host, WordPress hosting is WordPress-optimised shared hosting with full cPanel access: you keep full control, and the team keeps the server fast. It is not a fully managed service, so you update WordPress and plugins yourself.",
          "Both the WordPress and the Linux shared hosting plans run on NVMe storage with cPanel, free SSL, Softaculous one-click installs, daily JetBackup snapshots and daily malware scanning, on servers in India and the USA. New shared-hosting customers have a 30-day refund window, and free migration of an existing site is included on annual plans. If you are unsure which plan fits, the plan comparison page lists them side by side.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I install WordPress on regular shared hosting?",
        answer:
          "Yes. Any shared hosting that supports PHP and MySQL or MariaDB can run WordPress, and cPanel hosts usually include a one-click installer.",
      },
      {
        question: "Is WordPress hosting the same as managed WordPress hosting?",
        answer:
          "Not always. Many WordPress hosting plans, including those at MagicWorks Host, are WordPress-optimised shared hosting that you manage yourself, while managed WordPress hosting means the provider also maintains your site.",
      },
      {
        question: "When should a WordPress site move from shared hosting to a VPS?",
        answer:
          "Consider a VPS when the site regularly hits resource limits, slows down under normal traffic even after caching and image optimisation, or needs server software that shared hosting does not allow.",
      },
      {
        question: "Can I switch from shared hosting to WordPress hosting later?",
        answer:
          "Yes. Because both are cPanel-based, moving a WordPress site between them is a routine migration of files and a database.",
      },
    ],
    relatedServices: [
      { label: "WordPress Hosting", href: "/hosting/wordpress-hosting" },
      { label: "Linux Shared Hosting", href: "/hosting/linux-shared-hosting" },
      { label: "Compare hosting plans", href: "/compare-hosting-plans" },
      { label: "VPS Hosting", href: "/vps-hosting" },
    ],
    relatedGuides: ["what-is-managed-wordpress-hosting", "what-is-shared-hosting", "how-to-speed-up-wordpress", "what-is-vps-hosting"],
  },
  {
    slug: "how-to-speed-up-wordpress",
    categorySlug: "wordpress",
    title: "How to Speed Up a WordPress Website",
    metaTitle: "How to Speed Up a WordPress Website: Practical Steps",
    description:
      "A practical checklist to speed up a WordPress site: measure first, add caching, optimise images, trim plugins, update PHP and pick the right server.",
    excerpt:
      "Step-by-step fixes for a slow WordPress site, in the order that usually makes the biggest difference.",
    readTime: "6 min read",
    updated: "2026-10-03",
    answer:
      "To speed up WordPress, measure the site first, then turn on page caching, compress and resize images, remove plugins you do not need, switch to a lightweight theme, run a current PHP version and clean the database. If the site is still slow, check whether your hosting is the bottleneck or the server is far from your visitors.",
    keyTakeaways: [
      "Measure before and after each change, so you know what actually helped.",
      "Page caching and image optimisation usually give the largest improvement for the least effort.",
      "Every plugin adds code that runs on each page load, so remove the ones you do not use.",
      "A current, supported PHP version is generally faster and safer than an old one.",
      "Hosting close to your visitors, on fast storage, sets the baseline that all other fixes build on.",
    ],
    sections: [
      {
        heading: "Why do WordPress sites become slow?",
        body: [
          "WordPress builds most pages on the fly: PHP code runs, the database is queried, and the result is sent to the visitor's browser along with images, stylesheets and scripts. A site slows down when any part of that chain does too much work. The usual causes are large images, too many plugins, a heavy theme or page builder, an old PHP version, a cluttered database, no caching, or a server that is overloaded or far away from visitors.",
        ],
      },
      {
        heading: "How do you measure WordPress speed?",
        body: [
          "Test before you change anything. Free tools such as Google PageSpeed Insights show how long the page takes to load and which files are the heaviest. Test the home page and one or two of your most visited inner pages, such as a product or service page, because they often behave differently.",
          "Run each test two or three times and note the results. Change one thing at a time and test again, so you can tell which change helped and undo any that broke something.",
        ],
      },
      {
        heading: "Step-by-step: how to speed up WordPress",
        body: [
          {
            list: [
              "Take a full backup of files and database before you start.",
              "Turn on page caching with one well-supported caching plugin, or the server-level cache if your host provides one.",
              "Resize images to the size they are actually displayed at, compress them, and serve modern formats such as WebP where your setup supports it.",
              "Enable lazy loading for images and embedded videos below the first screen. Recent WordPress versions do this for images by default.",
              "Deactivate and delete plugins you do not use, and replace any that do the job of several smaller plugins badly.",
              "Switch to a lightweight theme if yours loads large scripts, sliders or fonts on every page.",
              "Update to a current, supported PHP version after checking that your theme and plugins are compatible.",
              "Clean the database by removing old post revisions, spam comments and expired temporary data.",
              "Retest the same pages and compare with your earlier results.",
            ],
            ordered: true,
          },
        ],
      },
      {
        heading: "Which plugins and themes slow WordPress down?",
        body: [
          "The number of plugins matters less than what each one does. A plugin that loads its own scripts and styles on every page, runs heavy database queries, or calls outside services can slow the whole site. Common examples are sliders, social sharing widgets and statistics plugins that store data in your own database.",
          "To find the culprit, deactivate plugins one at a time on a copy of the site, or during a quiet period, and retest. Keep a short list of plugins you actually need and remove the rest, because unused plugins also add security risk.",
        ],
      },
      {
        heading: "How do PHP version and hosting affect speed?",
        body: [
          "Newer PHP releases are generally faster than old ones, and old versions stop receiving security fixes. On cPanel hosting you can usually change the PHP version yourself from a tool such as MultiPHP Manager or Select PHP Version, depending on how the server is set up. Check the WordPress recommended version and your plugins' requirements first.",
          "Hosting sets the floor for everything else. Storage type, server load, available memory and server location all affect how quickly the first byte of a page arrives. A server close to most of your visitors cuts network delay, so an Indian business serving Indian customers usually benefits from hosting in India.",
          {
            table: {
              headers: ["Fix", "Effort", "Typical impact"],
              rows: [
                ["Page caching", "Low", "High for most sites"],
                ["Image resizing and compression", "Low to medium", "High on image-heavy pages"],
                ["Removing unused plugins", "Low", "Varies by plugin"],
                ["Updating PHP", "Low, after compatibility checks", "Moderate"],
                ["Changing theme", "High", "High if the current theme is heavy"],
                ["Upgrading hosting", "Medium", "High if the server is the bottleneck"],
              ],
            },
          },
        ],
      },
      {
        heading: "Where can MagicWorks Host help?",
        body: [
          "MagicWorks Host's WordPress hosting is WordPress-optimised shared hosting on NVMe storage, with full cPanel access and a choice of servers in India and the USA. Because you keep control of the site, the steps above are yours to carry out, and daily JetBackup snapshots give you a restore point if a change goes wrong. If you would rather not do it yourself, website maintenance help is available on request. If your site has outgrown shared hosting, a VPS gives it dedicated resources.",
        ],
      },
    ],
    faqs: [
      {
        question: "Does adding a caching plugin always make WordPress faster?",
        answer:
          "Usually, but running two caching plugins together, or a plugin alongside a conflicting server cache, can cause errors or stale pages. Use one caching tool and test after enabling it.",
      },
      {
        question: "How many plugins is too many for WordPress?",
        answer:
          "There is no fixed number. One badly built plugin can slow a site more than ten light ones, so judge plugins by what they load and do rather than by how many there are.",
      },
      {
        question: "Will a CDN speed up my WordPress site?",
        answer:
          "A content delivery network helps most when visitors are spread across many countries, because it serves images and files from locations near them. For a site whose visitors are mostly in one country, good hosting in that country and caching often matter more.",
      },
      {
        question: "Is it safe to change my site's PHP version?",
        answer:
          "Generally yes, if your theme and plugins support the new version. Take a backup first, switch the version, and check key pages; if something breaks, switch back and update the incompatible plugin or theme.",
      },
    ],
    relatedServices: [
      { label: "WordPress Hosting", href: "/hosting/wordpress-hosting" },
      { label: "Website Maintenance", href: "/services/website-maintenance" },
      { label: "VPS Hosting", href: "/vps-hosting" },
    ],
    relatedGuides: ["wordpress-hosting-vs-shared-hosting", "what-is-managed-wordpress-hosting", "how-website-backups-work", "what-is-vps-hosting"],
  },
]

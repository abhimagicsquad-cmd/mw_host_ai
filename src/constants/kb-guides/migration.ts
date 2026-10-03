import type { KBGuide } from "./types"

export const migrationGuides: KBGuide[] = [
  {
    slug: "website-migration-checklist",
    categorySlug: "migration",
    title: "Website Migration Checklist: Move Hosts Without Downtime",
    metaTitle: "Website Migration Checklist: Move Hosts Without Downtime",
    description:
      "A step-by-step website migration checklist: back up, lower DNS TTL, copy and test on the new host, switch DNS, then check email, SSL and redirects.",
    excerpt: "The steps to move a website to a new host without downtime, lost email or broken links.",
    readTime: "6 min read",
    updated: "2026-10-03",
    answer:
      "To move hosts without downtime, keep the old hosting running while you copy the site to the new server. Back up everything, lower your DNS TTL a day or two ahead, copy files, databases and email, test the site on the new server, then switch DNS. Cancel the old hosting only after everything is confirmed working.",
    keyTakeaways: [
      "Never cancel the old hosting until the new site, email and SSL are confirmed working.",
      "Lowering DNS TTL a day or two in advance makes the final switch take effect faster.",
      "Test the copied site on the new server before changing DNS, using a hosts file entry or temporary URL.",
      "Email is the part most often forgotten; plan MX records and mailbox moves as carefully as the website.",
    ],
    sections: [
      {
        heading: "What does moving a website to a new host involve?",
        body: [
          "A migration copies three things to the new server: website files, databases and, if your host also runs your email, mailboxes. DNS then points your domain at the new server. Downtime usually comes from doing these in the wrong order, such as switching DNS before the copy is complete or cancelling the old plan too early.",
        ],
      },
      {
        heading: "What should you do before the move?",
        body: [
          {
            ordered: true,
            list: [
              "Take a full backup of files, databases and email, and download it to your own computer.",
              "List everything the site uses: domains, subdomains, email accounts, cron jobs, PHP version and any special server settings.",
              "Check you have login details for the domain registrar, the DNS provider and both hosting accounts.",
              "Lower the TTL on your DNS records to around 300 seconds, 24 to 48 hours before the switch.",
              "Pick a quiet time for the switch and pause content changes, orders or sign-ups if you can.",
            ],
          },
        ],
      },
      {
        heading: "Why lower the DNS TTL before migrating?",
        body: [
          "TTL (time to live) tells resolvers how long to cache a DNS record. If your A record has a TTL of a day, some visitors may keep reaching the old server for up to a day after you change it. Lowering the TTL in advance, and waiting for the old value to expire, means the change spreads within minutes. Raise it again once the move is settled.",
        ],
      },
      {
        heading: "How do you copy and test the site?",
        body: [
          {
            ordered: true,
            list: [
              "Upload the files to the new hosting account.",
              "Create the database and user on the new server and import the database.",
              "Update the site's configuration file with the new database details.",
              "Recreate email accounts, forwarders and cron jobs.",
              "Preview the site on the new server by editing your computer's hosts file or using a temporary URL.",
              "Test pages, forms, logins, search and checkout before touching DNS.",
            ],
          },
        ],
      },
      {
        heading: "Should you change nameservers or DNS records?",
        body: [
          {
            table: {
              headers: ["Method", "What you change", "Speed of switch", "Watch out for"],
              rows: [
                ["Change A records", "IP address of the domain at your current DNS provider", "Follows your lowered TTL, often minutes", "Update every record that points to the old server"],
                ["Change nameservers", "Nameservers at your domain registrar", "Can take up to 24 to 48 hours", "Copy all DNS records, including MX and TXT, to the new DNS zone first"],
              ],
            },
          },
        ],
      },
      {
        heading: "What should you check after the move?",
        body: [
          {
            list: [
              "The site loads over HTTPS with a valid SSL certificate on the new server.",
              "Contact forms send email and new mail arrives in the right mailboxes.",
              "Old URLs still work or redirect with 301 redirects, so search rankings are preserved.",
              "Scheduled tasks, payment gateways and third-party integrations still work.",
              "Wait several days, then copy any email or orders that reached the old server before cancelling it.",
            ],
          },
        ],
      },
      {
        heading: "Can MagicWorks Host move the site for you?",
        body: [
          "Yes. On annual plans, the MagicWorks Host team moves your existing website from your current host at no extra cost, handling DNS and redirects carefully to avoid downtime and ranking disruption. If you are already a customer and want to move between the India and USA data centres, support does this on request. For larger or more complex projects, ask about the paid website migration service.",
        ],
      },
    ],
    faqs: [
      {
        question: "Will my website go down during migration?",
        answer:
          "It should not, as long as the old hosting stays active until DNS has fully switched. Visitors reach either the old or the new copy during the changeover, and both work.",
      },
      {
        question: "How long does DNS propagation take?",
        answer:
          "A record changes follow the TTL, so with a lowered TTL most visitors switch within minutes. Nameserver changes can take up to 24 to 48 hours.",
      },
      {
        question: "Will moving hosts affect my Google rankings?",
        answer:
          "Not if URLs stay the same and the site keeps working. Rankings are at risk when pages break, go missing or the domain changes without 301 redirects.",
      },
      {
        question: "Do I need to transfer my domain to change hosts?",
        answer:
          "No. Hosting and domain registration are separate, so you can point the domain at the new server and transfer the domain later or never.",
      },
    ],
    relatedServices: [
      { label: "Website Migration", href: "/services/website-migration" },
      { label: "Web hosting plans", href: "/hosting" },
      { label: "Domain Transfer", href: "/domain/transfer-your-domain-name" },
      { label: "Business Email Hosting", href: "/email-hosting/business" },
    ],
    relatedGuides: ["wordpress-migration-guide", "how-to-transfer-a-domain", "domain-vs-hosting", "how-website-backups-work"],
  },
  {
    slug: "wordpress-migration-guide",
    categorySlug: "migration",
    title: "WordPress Migration Guide: Moving a WordPress Site to a New Host",
    metaTitle: "WordPress Migration Guide: Move WordPress to a New Host",
    description:
      "How to move a WordPress site to a new host: plugin vs manual migration, exporting the database, editing wp-config.php and replacing URLs safely.",
    excerpt: "Move WordPress to a new host by plugin or by hand, update wp-config.php, and replace URLs without breaking data.",
    readTime: "7 min read",
    updated: "2026-10-03",
    answer:
      "Moving WordPress means copying two parts, the site files including wp-content and the MySQL database, to the new host. Import the database, update wp-config.php with the new database details, test the site before changing DNS, and run a serialisation-safe search and replace only if the domain or protocol changes.",
    keyTakeaways: [
      "A WordPress site is its files plus its database; both must be moved together.",
      "Migration plugins suit most small sites, while large sites are often easier to move manually.",
      "Update DB_NAME, DB_USER, DB_PASSWORD and DB_HOST in wp-config.php on the new server.",
      "Use a serialisation-safe tool for URL search and replace; a plain text replace can break settings.",
      "Test on the new server before switching DNS, and keep the old host running until you are done.",
    ],
    sections: [
      {
        heading: "What are the ways to migrate a WordPress site?",
        body: [
          {
            table: {
              headers: ["Method", "Best for", "Things to know"],
              rows: [
                ["Migration plugin", "Small to medium sites", "Easiest route, but free versions often have size limits and very large sites can time out"],
                ["Manual migration", "Large sites or anyone comfortable with cPanel", "Full control; needs File Manager or FTP and phpMyAdmin"],
                ["Host's migration team", "Owners who prefer not to do it themselves", "The new host copies and checks the site for you"],
              ],
            },
          },
        ],
      },
      {
        heading: "What should you check before you start?",
        body: [
          {
            list: [
              "Take a full backup of files and database and keep a copy on your own computer.",
              "Match or exceed the PHP version and memory limits your current site uses.",
              "Update WordPress, themes and plugins first, and remove ones you no longer use.",
              "Clear caches and temporarily disable caching or security plugins that may block the copy.",
              "Note the site's total size, since large uploads folders take longer to move.",
            ],
          },
        ],
      },
      {
        heading: "How do you migrate WordPress manually?",
        body: [
          {
            ordered: true,
            list: [
              "Download all WordPress files from the old host, including wp-content and wp-config.php.",
              "Export the database from phpMyAdmin on the old host as an SQL file.",
              "On the new host, create a new MySQL database and user in cPanel and give the user all privileges on it.",
              "Upload the files to the new site's document root, usually public_html.",
              "Import the SQL file into the new database using phpMyAdmin.",
              "Edit wp-config.php and set DB_NAME, DB_USER, DB_PASSWORD and DB_HOST to the new values.",
              "Preview the site through a hosts file entry and test it fully.",
              "Switch DNS to the new server once everything works.",
            ],
          },
        ],
      },
      {
        heading: "When do you need to search and replace URLs?",
        body: [
          "If the domain stays the same and only the host changes, the database URLs are already correct. You need a search and replace when the address changes, for example moving from a temporary URL, switching to a new domain, or moving from http to https.",
          "WordPress stores some settings as serialised data, which records the length of each text value. A plain find-and-replace in an SQL file changes the text but not the recorded length, which can break widgets and theme settings. Use WP-CLI's search-replace command or a plugin built for this, and take a database backup first.",
        ],
      },
      {
        heading: "What should you check after migrating?",
        body: [
          {
            list: [
              "Go to Settings, then Permalinks, and click Save to rebuild rewrite rules if inner pages show 404 errors.",
              "Confirm SSL is active and there are no mixed content warnings.",
              "Test contact forms, logins, checkout and any payment gateway.",
              "Re-enable caching and security plugins.",
              "If the domain changed, add 301 redirects from old URLs and update Google Search Console.",
            ],
          },
        ],
      },
      {
        heading: "Moving WordPress to MagicWorks Host",
        body: [
          "On annual plans, the MagicWorks Host team moves your existing WordPress site from your current host at no extra cost, taking care with DNS and redirects to avoid downtime and ranking disruption. If you would rather start fresh, Softaculous installs WordPress in one click from cPanel, and every plan includes a free SSL certificate activated by AutoSSL. For bigger projects, a paid website migration service is also available on request.",
        ],
      },
    ],
    faqs: [
      {
        question: "Why do I see Error establishing a database connection after moving?",
        answer:
          "WordPress cannot log in to the database. Check that DB_NAME, DB_USER, DB_PASSWORD and DB_HOST in wp-config.php match the database and user you created on the new host.",
      },
      {
        question: "Can I just export and import from the WordPress Tools menu?",
        answer:
          "The built-in export only moves posts, pages, comments and similar content. It does not move themes, plugins, settings or all media files, so it is not a full migration.",
      },
      {
        question: "Do I need to change URLs if my domain stays the same?",
        answer:
          "No. If the domain and protocol stay the same, the URLs in the database are already correct and no search and replace is needed.",
      },
      {
        question: "Will my plugins and theme settings move across?",
        answer:
          "Yes, if you move both the wp-content folder and the full database. Plugin licences tied to a domain may need reactivating if the domain changes.",
      },
    ],
    relatedServices: [
      { label: "Website Migration", href: "/services/website-migration" },
      { label: "WordPress Hosting", href: "/hosting/wordpress-hosting" },
      { label: "Website Maintenance", href: "/services/website-maintenance" },
    ],
    relatedGuides: ["website-migration-checklist", "what-is-managed-wordpress-hosting", "how-to-speed-up-wordpress", "how-website-backups-work"],
  },
]

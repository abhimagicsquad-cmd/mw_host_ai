import type { KBGuide } from "./types"

export const securityGuides: KBGuide[] = [
  {
    slug: "what-is-ssl",
    categorySlug: "ssl-security",
    title: "What Is SSL and How Does HTTPS Work?",
    metaTitle: "What Is SSL? How HTTPS and SSL Certificates Work",
    description:
      "Learn what SSL/TLS is, how HTTPS protects your visitors, the difference between DV, OV, EV and wildcard certificates, and how to fix mixed content.",
    excerpt: "How SSL/TLS encryption works, which certificate type you need, and how to avoid mixed content warnings.",
    readTime: "6 min read",
    updated: "2026-10-03",
    answer:
      "SSL, now formally called TLS, is the encryption that protects data travelling between a visitor's browser and your website. When a site has a valid certificate, the browser loads it over HTTPS, confirms the site's identity, and encrypts form entries, logins and payments so nobody in between can read or alter them.",
    keyTakeaways: [
      "SSL and TLS refer to the same idea; TLS is the current protocol, but the old name stuck.",
      "A certificate proves your site's identity, and the TLS handshake uses it to set up an encrypted connection.",
      "DV, OV and EV certificates encrypt equally well; they differ in how much the certificate authority checks about you.",
      "After switching to HTTPS, fix mixed content and redirect all HTTP traffic to HTTPS.",
      "Every MagicWorks Host plan includes a free SSL certificate, activated on your domain by AutoSSL.",
    ],
    sections: [
      {
        heading: "What is the difference between SSL, TLS and HTTPS?",
        body: [
          "SSL (Secure Sockets Layer) was the original protocol for encrypting web traffic. It was replaced by TLS (Transport Layer Security) years ago, and old SSL versions are now disabled in modern browsers. People still say SSL out of habit, and certificates are still sold as SSL certificates.",
          "HTTPS is simply HTTP, the language browsers and servers use, running inside a TLS-encrypted connection. Browsers mark plain HTTP pages as not secure, especially pages with forms, which puts visitors off before they read anything.",
        ],
      },
      {
        heading: "How does the TLS handshake work?",
        body: [
          "Before any page content is sent, the browser and server agree on how to talk securely. This takes a fraction of a second:",
          {
            ordered: true,
            list: [
              "The browser connects and says which TLS versions and encryption methods it supports.",
              "The server picks a method and sends its SSL certificate.",
              "The browser checks the certificate: it must be issued by a trusted certificate authority, be within its validity dates, and match the domain being visited.",
              "Both sides run a key exchange that lets them agree on a shared session key without ever sending that key across the network.",
              "Everything after that, including pages, passwords and payment details, is encrypted with the session key.",
            ],
          },
          "If the certificate check fails, the browser shows a full-page warning instead of your site. That is why expired or mismatched certificates cause such visible problems.",
        ],
      },
      {
        heading: "What are the types of SSL certificates?",
        body: [
          "All certificate types give the same strength of encryption. The difference is how thoroughly the certificate authority verifies who is behind the website, and how many names the certificate covers.",
          {
            table: {
              headers: ["Type", "What is verified", "Good fit for"],
              rows: [
                ["Domain Validated (DV)", "Only that you control the domain", "Blogs, brochure sites, small business websites"],
                ["Organization Validated (OV)", "Domain control plus your registered business details", "Company sites that collect enquiries or customer data"],
                ["Extended Validation (EV)", "A stricter check of the legal business, its address and the person requesting", "Banks, payment and ecommerce sites that want the highest verification"],
                ["Wildcard", "Usually domain control; covers all first-level subdomains of one domain", "Sites with many subdomains such as shop, blog and app"],
              ],
            },
          },
          "OV and EV details appear when a visitor views the certificate, which helps people confirm they are dealing with a real registered business.",
        ],
      },
      {
        heading: "Is a free SSL certificate enough?",
        body: [
          "For most small business sites, yes. A free domain-validated certificate encrypts traffic just as well as a paid one. A paid certificate makes sense when you want your organisation's identity verified in the certificate, need a wildcard for many subdomains, or a partner or payment provider asks for a specific validation level.",
        ],
      },
      {
        heading: "What is mixed content and how do you fix it?",
        body: [
          "Mixed content happens when an HTTPS page loads images, scripts or stylesheets over plain HTTP. Browsers block or flag those files, so the page can look broken or lose its secure status.",
          {
            list: [
              "Update the site address in your CMS settings to use https://.",
              "Replace hard-coded http:// links in content, themes and plugins.",
              "Add a site-wide 301 redirect from HTTP to HTTPS.",
              "Use your browser's developer console to find any files still loading over HTTP.",
            ],
          },
        ],
      },
      {
        heading: "How does SSL work on MagicWorks Host?",
        body: [
          "Every MagicWorks Host plan includes a free SSL certificate, and AutoSSL activates it on your domain. If you need more, MagicWorks Host sells Sectigo (formerly Comodo) certificates: Domain Validated, DV with SNI, Business (Organization) Validated, Extended Validation and wildcard. If you buy a certificate for a site hosted with MagicWorks Host, the team installs it for you at no charge.",
        ],
      },
    ],
    faqs: [
      {
        question: "Does SSL improve search rankings?",
        answer:
          "Google treats HTTPS as a lightweight ranking signal. The bigger benefit is that visitors do not see not secure warnings, so they are more likely to stay and fill in your forms.",
      },
      {
        question: "Do I need SSL if my site does not take payments?",
        answer:
          "Yes. Contact forms, login pages and even simple browsing benefit from encryption, and browsers label HTTP pages as not secure regardless of what the site sells.",
      },
      {
        question: "What happens when an SSL certificate expires?",
        answer:
          "Browsers show a full-page security warning and most visitors leave. Free certificates managed by AutoSSL renew automatically, while paid certificates need to be renewed before their end date.",
      },
      {
        question: "Does a wildcard certificate cover the main domain?",
        answer:
          "A wildcard covers first-level subdomains such as blog.example.com. Most wildcard certificates also include the bare domain, but check the certificate details before you buy.",
      },
    ],
    relatedServices: [
      { label: "SSL Certificates", href: "/ssl" },
      { label: "DV SSL", href: "/ssl/domain-validated" },
      { label: "Wildcard SSL", href: "/ssl/wildcard" },
      { label: "Web hosting plans", href: "/hosting" },
    ],
    relatedGuides: ["common-website-security-threats", "how-website-backups-work", "domain-vs-hosting"],
  },
  {
    slug: "common-website-security-threats",
    categorySlug: "ssl-security",
    title: "Common Website Security Threats and How to Prevent Them",
    metaTitle: "Common Website Security Threats and How to Prevent Them",
    description:
      "The most common website security threats explained in plain English, from outdated plugins and brute force logins to SQL injection, XSS and DDoS.",
    excerpt: "The attacks small business websites face most often, the warning signs, and the steps that prevent them.",
    readTime: "6 min read",
    updated: "2026-10-03",
    answer:
      "The most common website threats are outdated software with known flaws, weak or reused passwords targeted by brute force, SQL injection, cross-site scripting, malware injected into site files, phishing aimed at site owners, and DDoS traffic floods. Most are prevented by updating regularly, using strong unique passwords with two-factor login, and keeping tested backups.",
    keyTakeaways: [
      "Most attacks are automated bots scanning for known weaknesses, so small sites are targeted as often as large ones.",
      "Outdated plugins, themes and CMS versions are the easiest way in for attackers.",
      "Strong unique passwords, two-factor authentication and fewer admin accounts stop most login attacks.",
      "A recent, tested backup is what lets you recover quickly when prevention fails.",
    ],
    sections: [
      {
        heading: "Why would anyone attack a small business website?",
        body: [
          "Most attacks are not personal. Automated bots scan large numbers of websites looking for known weaknesses, such as an old plugin version or an admin login with a common password. A compromised site can be used to send spam, host phishing pages, redirect visitors to scams or mine visitor data, whatever the size of the business behind it.",
        ],
      },
      {
        heading: "What are the most common threats?",
        body: [
          {
            table: {
              headers: ["Threat", "What happens", "Main prevention"],
              rows: [
                ["Outdated software", "Attackers exploit published flaws in old CMS, plugin or theme versions", "Update promptly and remove unused plugins and themes"],
                ["Brute force logins", "Bots try thousands of password combinations on your login page", "Strong unique passwords, two-factor login, login attempt limits"],
                ["SQL injection", "Malicious input tricks the site into running database commands", "Keep code updated; developers must use parameterised queries"],
                ["Cross-site scripting (XSS)", "Injected scripts run in visitors' browsers and can steal sessions", "Updated plugins, input filtering and output escaping in code"],
                ["Malware injection", "Hidden code is added to files to spam, redirect or steal data", "Malware scanning, updates and correct file permissions"],
                ["Phishing", "Fake emails trick you into handing over hosting or admin passwords", "Check sender and link addresses; log in only through bookmarked URLs"],
                ["DDoS", "A flood of traffic from many machines overwhelms the server", "Network-level filtering, a CDN and a host that can absorb attacks"],
              ],
            },
          },
        ],
      },
      {
        heading: "How do you protect your website?",
        body: [
          {
            ordered: true,
            list: [
              "Update your CMS, plugins and themes as soon as security updates are released.",
              "Delete plugins, themes and old test installs you no longer use.",
              "Use a strong, unique password for hosting, CMS admin, email and domain accounts, stored in a password manager.",
              "Turn on two-factor authentication wherever it is offered.",
              "Give each person their own login with only the access they need.",
              "Serve the whole site over HTTPS.",
              "Install software only from official sources; nulled or pirated plugins often carry malware.",
              "Keep regular backups and confirm you know how to restore them.",
            ],
          },
        ],
      },
      {
        heading: "What are the warning signs of a hacked website?",
        body: [
          {
            list: [
              "Visitors are redirected to unrelated or spammy sites.",
              "Search results show strange titles or pages in other languages under your domain.",
              "Browsers or Google display a dangerous site warning.",
              "New admin users, files or scheduled tasks appear that you did not create.",
              "Your email starts bouncing or landing in spam because the server sent junk mail.",
            ],
          },
        ],
      },
      {
        heading: "What should you do if your site is hacked?",
        body: [
          {
            ordered: true,
            list: [
              "Contact your hosting provider so they can help contain the problem.",
              "Change all passwords: hosting, CMS admin, database, FTP and email.",
              "Restore a clean backup from before the infection, or have the malicious code removed.",
              "Update everything and remove the weakness that let the attacker in.",
              "If Google flagged the site, request a review in Search Console once it is clean.",
            ],
          },
        ],
      },
      {
        heading: "What does MagicWorks Host do to protect your site?",
        body: [
          "MagicWorks Host accounts get daily malware scanning and server-level hardening, and daily JetBackup snapshots let you roll back files or the whole account from cPanel. Every plan includes a free SSL certificate. Support is available 24/7 by phone and ticket. Server protection does not replace updating your own site software, so if you would rather hand that work over, ask about the website security or website maintenance service.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is a small website really at risk?",
        answer:
          "Yes. Most attacks are automated and look for known weaknesses rather than particular businesses, so any site running outdated software or weak passwords can be hit.",
      },
      {
        question: "Does an SSL certificate stop hackers?",
        answer:
          "No. SSL encrypts data in transit between the browser and server. It does not fix outdated plugins, weak passwords or vulnerable code, which is how most sites are compromised.",
      },
      {
        question: "How often should I update WordPress plugins?",
        answer:
          "Apply security updates as soon as they are released, and check for other updates at least weekly. Take a backup before major updates so you can roll back if something breaks.",
      },
      {
        question: "Can my hosting provider prevent every attack?",
        answer:
          "No. A host can harden the server, scan for malware and keep backups, but the site owner still controls software updates, passwords and who has admin access.",
      },
    ],
    relatedServices: [
      { label: "Website Security", href: "/services/website-security" },
      { label: "Website Maintenance", href: "/services/website-maintenance" },
      { label: "SSL Certificates", href: "/ssl" },
      { label: "Support", href: "/support" },
    ],
    relatedGuides: ["what-is-ssl", "how-website-backups-work", "how-to-speed-up-wordpress"],
  },
  {
    slug: "how-website-backups-work",
    categorySlug: "ssl-security",
    title: "How Website Backups Work",
    metaTitle: "How Website Backups Work: Types, 3-2-1 Rule, Restores",
    description:
      "How website backups work: what they include, full vs incremental vs differential backups, the 3-2-1 rule, how often to back up and how to restore.",
    excerpt: "What a website backup contains, the main backup types, how often to back up and how to restore safely.",
    readTime: "6 min read",
    updated: "2026-10-03",
    answer:
      "A website backup is a saved copy of your site's files, databases and often email and settings, taken at a point in time. If the site is hacked, broken by an update or accidentally deleted, you restore that copy to bring it back. Good backups are automatic, stored in more than one place, and tested.",
    keyTakeaways: [
      "A complete backup covers files and databases; a site cannot be rebuilt from either alone.",
      "Incremental backups save only changes, so they are faster and smaller than repeated full backups.",
      "Back up as often as you can afford to lose data, and keep at least one copy away from your hosting account.",
      "A backup you have never restored is untested; check restores before you need them.",
    ],
    sections: [
      {
        heading: "What does a website backup include?",
        body: [
          "A dynamic website lives in two places. The files hold the code, themes, plugins and uploaded images. The database holds the content, users, orders and settings. A backup that misses either part cannot rebuild the site. A full hosting account backup may also include email accounts, DNS zones, cron jobs and other cPanel settings.",
        ],
      },
      {
        heading: "What is the difference between full, incremental and differential backups?",
        body: [
          {
            table: {
              headers: ["Type", "What it saves", "Pros", "Cons"],
              rows: [
                ["Full", "Everything, every time", "Simplest to restore from", "Slow and uses the most storage"],
                ["Incremental", "Only changes since the last backup of any kind", "Fast and storage-efficient, so it can run often", "A restore needs the full backup plus the chain of increments"],
                ["Differential", "All changes since the last full backup", "Restore needs only the full backup and the latest differential", "Grows larger each day until the next full backup"],
              ],
            },
          },
          "Many hosting backup systems combine these: a full copy, then incremental snapshots, presented to you as a list of restore points.",
        ],
      },
      {
        heading: "What is the 3-2-1 backup rule?",
        body: [
          "The 3-2-1 rule is a simple way to avoid losing everything at once:",
          {
            list: [
              "Keep 3 copies of your data: the live site plus two backups.",
              "Store them on 2 different types of storage or systems.",
              "Keep 1 copy off-site, away from your hosting account.",
            ],
          },
          "For a small business, that usually means relying on your host's automatic backups and also downloading a copy regularly to your own computer or cloud storage.",
        ],
      },
      {
        heading: "How often should you back up your website?",
        body: [
          "Use the recovery point objective (RPO): the most data you could afford to lose, measured in time. A brochure site that changes monthly can live with weekly copies. An online shop taking daily orders needs at least daily backups, and ideally more frequent database backups. Always take a manual backup before updates, theme changes or a migration.",
        ],
      },
      {
        heading: "How do you restore a website from a backup?",
        body: [
          {
            ordered: true,
            list: [
              "Find out when the problem started, so you choose a restore point from before it.",
              "Download a copy of the current site first, in case you need anything from it.",
              "Restore only what is needed: a single file, the database, or the whole account.",
              "Check the site, forms, logins and checkout after the restore.",
              "Fix the cause, such as an outdated plugin, so the problem does not return.",
            ],
          },
          "Remember that restoring an older database removes any orders, comments or sign-ups made after that point.",
        ],
      },
      {
        heading: "How do backups work on MagicWorks Host?",
        body: [
          "MagicWorks Host takes daily JetBackup snapshots of hosting accounts. From cPanel you can roll back individual files or the whole account to a previous snapshot without raising a ticket. For extra safety under the 3-2-1 rule, keep your own off-site copy as well, and contact 24/7 support by phone or ticket if you need help choosing a restore point.",
        ],
      },
    ],
    faqs: [
      {
        question: "Are hosting backups enough on their own?",
        answer:
          "They cover most everyday problems, but it is wise to keep your own off-site copy too. That protects you if you lose access to the hosting account or need a copy older than the host keeps.",
      },
      {
        question: "Does restoring a backup delete new content?",
        answer:
          "Restoring a database replaces it with the older version, so anything added after that backup, such as orders or posts, is lost unless you save it first.",
      },
      {
        question: "Should I back up before updating plugins?",
        answer:
          "Yes. A backup taken just before an update lets you roll back in minutes if the update breaks the site.",
      },
      {
        question: "Can I restore a single file instead of the whole site?",
        answer:
          "Usually yes. On MagicWorks Host, JetBackup in cPanel lets you roll back individual files or the whole account to a previous snapshot.",
      },
    ],
    relatedServices: [
      { label: "Web hosting plans", href: "/hosting" },
      { label: "Website Maintenance", href: "/services/website-maintenance" },
      { label: "Website Security", href: "/services/website-security" },
    ],
    relatedGuides: ["common-website-security-threats", "website-migration-checklist", "what-is-shared-hosting"],
  },
]

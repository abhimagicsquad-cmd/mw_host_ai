import type { KBGuide } from "./types"

export const domainGuides: KBGuide[] = [
  {
    slug: "domain-vs-hosting",
    categorySlug: "domains",
    title: "Domain vs Hosting: What's the Difference?",
    description:
      "A domain is your website's address; hosting is the server space where the site lives. Learn how they differ, how they connect and whether to buy both.",
    excerpt:
      "What a domain name is, what web hosting is, why you need both for a website, and how the two are connected.",
    readTime: "5 min read",
    updated: "2026-10-03",
    answer:
      "A domain name is the address people type to find your website, such as yourbusiness.in. Web hosting is the server space where your website's files, database and often email are stored. You need both: the domain points visitors to the hosting server, and the hosting delivers the site. They are separate services and can be bought separately.",
    keyTakeaways: [
      "A domain is an address that you register and renew; hosting is server space that you rent.",
      "DNS settings, either nameservers or individual records, connect a domain to a hosting server.",
      "You can buy the domain and hosting from the same company or from different ones.",
      "Domain and hosting renewals are separate, and letting either one lapse takes the website offline.",
      "Keep the domain registered in your own name and account, even if someone else builds the site.",
    ],
    sections: [
      {
        heading: "What is a domain name?",
        body: [
          "A domain name is the human-readable address of a website, such as yourbusiness.com or yourbusiness.co.in. Computers find each other using numeric IP addresses, and the Domain Name System (DNS) translates the name into the right IP address.",
          "You do not buy a domain outright. You register it through a registrar for a period, usually one year or more, and renew it to keep it. While it is registered to you, nobody else can use that name.",
        ],
      },
      {
        heading: "What is web hosting?",
        body: [
          "Web hosting is space and computing power on a server that is connected to the internet all the time. Your website's files, images and database are stored there, and the server sends pages to visitors' browsers when they ask for them. Most hosting plans also let you create email accounts for your domain.",
          "Hosting comes in several types, from shared hosting, where many sites share one server, to VPS and dedicated servers, which give you more resources and control.",
        ],
      },
      {
        heading: "How do domain and hosting compare?",
        body: [
          "A simple way to think about it: the domain is your shop's address, and the hosting is the shop itself. An address with no shop leads nowhere, and a shop with no address is hard to find.",
          {
            table: {
              headers: ["", "Domain name", "Web hosting"],
              rows: [
                ["What it is", "The address of your website", "The server space where the site is stored"],
                ["What you pay for", "The right to use the name for a period", "Storage, bandwidth and server resources"],
                ["Who provides it", "A domain registrar", "A hosting provider"],
                ["Example", "yourbusiness.in", "A shared, VPS or dedicated hosting plan"],
                ["If it expires", "The address stops working and can eventually be lost", "The site and email stop working"],
              ],
            },
          },
        ],
      },
      {
        heading: "How are a domain and hosting connected?",
        body: [
          "The link between them is DNS. There are two common ways to set it up:",
          {
            list: [
              "Change the domain's nameservers to the ones your hosting provider gives you. The host then manages all the DNS records for the domain.",
              "Keep the current nameservers and add or edit an A record that points the domain to your hosting server's IP address. This suits setups where email or other services are run elsewhere.",
            ],
          },
          "After a change, DNS updates can take from a few minutes up to 24 to 48 hours to reach every network, a delay known as DNS propagation. During that time some visitors may still see the old server.",
        ],
      },
      {
        heading: "Should you buy the domain and hosting from the same company?",
        body: [
          "Buying both from one provider means one account, one support team and less DNS setup. Keeping them separate means that changing hosting providers later does not involve moving the domain. Both approaches work. What matters most is that the domain is registered in your business's name, in an account you control, with renewal reminders going to an email address you check.",
        ],
      },
      {
        heading: "How does this work at MagicWorks Host?",
        body: [
          "MagicWorks Host registers .com, .in, .co.in, .org and other extensions, with registrar lock and auto-renewal included. Domains and their DNS are managed from the client area. If you buy hosting together with a domain, the team connects the two for you. If your domain is already registered elsewhere, you can either point it to your hosting or transfer it in.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I have a domain without hosting?",
        answer:
          "Yes. Many businesses register a domain to reserve the name before they have a website. Without hosting it will not show a site, though it can still be used for email if you set up an email service.",
      },
      {
        question: "Can I have hosting without a domain?",
        answer:
          "Technically yes, but visitors would have to use the server's IP address or a temporary address. For a real business website you need a domain pointed at the hosting.",
      },
      {
        question: "If I change hosting providers, do I lose my domain?",
        answer:
          "No. The domain stays registered to you; you only update its DNS to point to the new server. You can keep the domain with its current registrar or transfer it separately.",
      },
      {
        question: "Does buying a domain include email?",
        answer:
          "A domain on its own does not include mailboxes. Email for your domain usually comes with a hosting plan or a separate business email service.",
      },
    ],
    relatedServices: [
      { label: "Domain + Hosting", href: "/domain/domain-hosting" },
      { label: "Domain Registration", href: "/domain/domain-name-registration" },
      { label: "Web hosting plans", href: "/hosting" },
      { label: "Business Email Hosting", href: "/email-hosting/business" },
    ],
    relatedGuides: ["how-domain-registration-works", "what-is-shared-hosting", "how-to-transfer-a-domain"],
  },
  {
    slug: "how-domain-registration-works",
    categorySlug: "domains",
    title: "How Domain Registration Works",
    metaTitle: "How Domain Registration Works: Registry, Registrar, Renewal",
    description:
      "How domain registration works: registries, registrars, WHOIS, privacy, renewal and expiry periods, explained for small businesses registering a domain.",
    excerpt:
      "Who controls domain names, what happens when you register one, and how renewal, expiry and ownership details work.",
    readTime: "5 min read",
    updated: "2026-10-03",
    answer:
      "When you register a domain, a registrar checks that the name is free and records you as the registrant with the registry that runs that extension, such as .com or .in. You hold the right to use the name for the period you paid for, usually one to ten years, and must renew it before it expires.",
    keyTakeaways: [
      "Registries run each extension, registrars sell names to the public, and you are the registrant.",
      "You rent a domain for a fixed period and keep it only as long as you renew it on time.",
      "Your contact details are recorded with the registration, and privacy options vary by extension.",
      "After expiry there are usually grace and redemption periods, but their length and cost vary by registry.",
      "Registrar lock and auto-renewal are the two simplest ways to protect a domain.",
    ],
    sections: [
      {
        heading: "Who is involved in registering a domain?",
        body: [
          "Four parties are involved in every domain registration:",
          {
            list: [
              "ICANN, the non-profit body that coordinates the domain name system and sets rules for generic extensions such as .com and .org.",
              "The registry, the organisation that runs a particular extension and keeps its master database. For example, the .in and .co.in extensions are run under NIXI, the National Internet Exchange of India.",
              "The registrar, an accredited company that sells domain names to the public and submits registrations to the registry.",
              "The registrant, which is you or your business, the holder of the domain.",
            ],
          },
        ],
      },
      {
        heading: "What happens when you register a domain?",
        body: [
          {
            list: [
              "You search for the name you want. The registrar checks with the registry whether it is available.",
              "You choose a registration period, usually from one to ten years depending on the extension.",
              "You enter the registrant's contact details. Use your business's legal name and an email address you will keep long term.",
              "You pay, and the registrar submits the registration to the registry. Most registrations are active within minutes.",
              "You point the domain to your hosting by setting nameservers or DNS records.",
            ],
            ordered: true,
          },
        ],
      },
      {
        heading: "Which extension should you choose?",
        body: [
          "For a business that mainly serves customers in India, a .in or .co.in domain signals a local presence. A .com is widely recognised and suits businesses that serve customers in several countries. A .org is traditionally used by non-profits and community groups. Many businesses register both the .com and the .in for their name, and point one to the other, to stop someone else from taking the second one.",
          {
            table: {
              headers: ["Extension", "Type", "Commonly used by"],
              rows: [
                [".com", "Generic", "Businesses of any kind, worldwide"],
                [".in", "Country code (India)", "Businesses and individuals targeting India"],
                [".co.in", "Country code (India)", "Companies and commercial sites in India"],
                [".org", "Generic", "Non-profits, trusts and community groups"],
              ],
            },
          },
        ],
      },
      {
        heading: "What is WHOIS and domain privacy?",
        body: [
          "Every registration records contact details for the registrant. Historically these were published in a public directory called WHOIS. Data protection rules have since led many registries and registrars to hide personal details by default, and many registrars also offer a privacy service that replaces your details with theirs in public records.",
          "Rules differ by extension, and some country-code extensions restrict privacy services. Whatever is shown publicly, keep the underlying details accurate, because the registrant email is used for important notices and ownership checks.",
        ],
      },
      {
        heading: "What happens when a domain expires?",
        body: [
          "If a domain is not renewed by its expiry date, it usually stops resolving, which takes the website and email offline. Most extensions then have a grace period during which the registrant can still renew at the normal price, followed by a redemption period during which recovery is possible but usually costs extra. After that the name is released and anyone can register it.",
          "The length of these periods and the recovery fees vary by registry and registrar, so do not count on them. Turn on auto-renewal and keep a valid payment method on file.",
        ],
      },
      {
        heading: "Registering a domain with MagicWorks Host",
        body: [
          "MagicWorks Host registers .com, .in, .co.in and .org domains as well as other extensions. Registrar lock and auto-renewal are included, and you manage the domain and its DNS from the client area. If you buy hosting with the domain, the team connects the two for you. Support is available 24/7 by phone and ticket if you need help choosing a name or setting up DNS.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do I own my domain name forever?",
        answer:
          "No. You hold the right to use it for the period you have paid for. As long as you renew it on time, you can keep it indefinitely.",
      },
      {
        question: "Can I register a domain for more than one year?",
        answer:
          "Yes. Most extensions allow registration for one to ten years. A longer term reduces the risk of missing a renewal.",
      },
      {
        question: "What is a registrar lock?",
        answer:
          "A registrar lock is a setting that blocks the domain from being transferred to another registrar until you remove it. It helps prevent unauthorised transfers.",
      },
      {
        question: "Can I change who the domain is registered to?",
        answer:
          "Yes. You can update the registrant details through your registrar. Some extensions apply extra checks or a temporary transfer restriction after a change of registrant.",
      },
    ],
    relatedServices: [
      { label: "Domain Registration", href: "/domain/domain-name-registration" },
      { label: "Indian Domains", href: "/domain/indian-domain" },
      { label: "Domain search", href: "/domain/search" },
      { label: "Domain Renewal", href: "/domain/renew" },
    ],
    relatedGuides: ["domain-vs-hosting", "how-to-transfer-a-domain", "what-is-ssl"],
  },
  {
    slug: "how-to-transfer-a-domain",
    categorySlug: "domains",
    title: "How to Transfer a Domain to a New Registrar",
    description:
      "Step-by-step guide to transferring a domain to a new registrar: eligibility, unlocking, the auth code, approval, timelines and avoiding site downtime.",
    excerpt:
      "What you need before a domain transfer, the steps in order, how long it takes and how to keep your website and email online.",
    readTime: "6 min read",
    updated: "2026-10-03",
    answer:
      "To transfer a domain, confirm it is more than 60 days since registration or the last transfer, unlock it at your current registrar, get the authorisation (EPP) code, and start the transfer at the new registrar. After you approve it, the transfer usually completes within a few days and normally adds a year to the registration.",
    keyTakeaways: [
      "Domains generally cannot be transferred within 60 days of registration or a previous transfer.",
      "You need the domain unlocked and its authorisation code from your current registrar.",
      "A transfer usually adds one year to the registration, so you do not lose remaining time.",
      "Keeping the same nameservers during the transfer keeps the website and email online.",
      "Do not leave a transfer until the last few days before expiry.",
    ],
    sections: [
      {
        heading: "Why transfer a domain?",
        body: [
          "Businesses move domains to bring everything under one account with their hosting, to get better support, to escape high renewal prices, or because the domain was registered by a former developer or agency and needs to come back under the business's control. A transfer changes which registrar manages the domain. It does not change who owns it, and it does not have to move your website.",
        ],
      },
      {
        heading: "Is your domain eligible for transfer?",
        body: [
          "Check these points before you start:",
          {
            list: [
              "At least 60 days have passed since the domain was registered or last transferred. This is an ICANN rule for generic extensions such as .com and .org, and many country-code registries apply similar limits. ICANN has approved changes to its Transfer Policy that may shorten some of these locks, so check the current rules with your registrar.",
              "The domain is not expired or in its redemption period. If it is close to expiry, renew it first or transfer well before the date.",
              "The domain is not under dispute or locked by the registry for legal reasons.",
              "You can receive email at the registrant or admin address, because some registrars send approval messages there.",
              "Some registrars also apply a 60-day transfer lock after a change of registrant details, unless you opted out when making the change.",
            ],
          },
        ],
      },
      {
        heading: "How to transfer a domain, step by step",
        body: [
          {
            list: [
              "Note the domain's current nameservers and DNS records, or take a screenshot, so nothing is lost.",
              "At your current registrar, turn off the registrar lock, sometimes called transfer lock or theft protection.",
              "Request the authorisation code, also known as the EPP code or auth code. It is usually shown in the domain panel or sent by email.",
              "At the new registrar, start a transfer for the domain and enter the authorisation code.",
              "Pay for the transfer. For most extensions this adds one year to the existing registration.",
              "Approve the transfer if you receive a confirmation email from either registrar. Approving it at the old registrar can speed things up.",
              "Wait for the transfer to complete, then check that the domain appears in your new account with registrar lock and auto-renewal turned on.",
            ],
            ordered: true,
          },
        ],
      },
      {
        heading: "How long does a domain transfer take?",
        body: [
          "For generic extensions, the old registrar has up to five days to approve or reject a transfer before it goes through automatically, so most transfers finish within about a week. Approving the transfer at the old registrar often completes it sooner. Country-code extensions follow their own registry's process, and timings can differ.",
          {
            table: {
              headers: ["Problem", "Likely cause", "What to do"],
              rows: [
                ["Transfer rejected immediately", "Domain still locked", "Turn off registrar lock and restart"],
                ["Invalid authorisation code", "Code mistyped or expired", "Request a fresh code"],
                ["Transfer not allowed", "Within 60 days of registration or transfer", "Wait until the period ends"],
                ["No approval email arrives", "Outdated registrant email", "Update contact details at the old registrar"],
              ],
            },
          },
        ],
      },
      {
        heading: "Will my website or email go down during a transfer?",
        body: [
          "It should not. A transfer moves the registration, not the DNS. If the domain's nameservers stay the same before and after the transfer, the website and email keep working throughout. Problems usually happen when the old registrar was also providing the DNS service and stops when the domain leaves. If so, set up the same DNS records with your host or the new registrar and switch the nameservers before you start the transfer.",
        ],
      },
      {
        heading: "Transferring a domain to MagicWorks Host",
        body: [
          "MagicWorks Host accepts transfers for .com, .in, .co.in, .org and other extensions. A transfer in adds one year to the registration, and most transfers complete in 1 to 7 days with zero site downtime. Once the domain arrives, registrar lock and auto-renewal are included, and you manage the domain and its DNS from the client area. If you need help with any step, support is available 24/7 by phone and ticket.",
        ],
      },
    ],
    faqs: [
      {
        question: "What is an EPP or authorisation code?",
        answer:
          "It is a unique password for the domain, issued by the current registrar, that proves you are allowed to transfer it. The new registrar needs it to start the transfer.",
      },
      {
        question: "Can I transfer a domain I registered last month?",
        answer:
          "Usually not. Most domains cannot be transferred within 60 days of registration or a previous transfer, so you need to wait until that period ends.",
      },
      {
        question: "Do I lose the time left on my domain when I transfer it?",
        answer:
          "No. For most extensions the remaining time carries over and the transfer adds one more year to the registration.",
      },
      {
        question: "Do I need to move my hosting when I transfer my domain?",
        answer:
          "No. Domain registration and hosting are separate, so you can transfer the domain and leave the website where it is, or move them at different times.",
      },
    ],
    relatedServices: [
      { label: "Domain Transfer", href: "/domain/transfer-your-domain-name" },
      { label: "Domain Renewal", href: "/domain/renew" },
      { label: "Website Migration", href: "/services/website-migration" },
    ],
    relatedGuides: ["how-domain-registration-works", "domain-vs-hosting", "website-migration-checklist"],
  },
]

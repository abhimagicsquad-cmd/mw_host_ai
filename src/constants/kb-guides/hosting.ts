import type { KBGuide } from "./types"

export const hostingGuides: KBGuide[] = [
  {
    slug: "what-is-shared-hosting",
    categorySlug: "web-hosting",
    title: "What Is Shared Hosting?",
    metaTitle: "What Is Shared Hosting? A Plain Guide for Small Businesses",
    description:
      "Shared hosting explained: how one server hosts many websites, who it suits, its limits, and what to check before you buy a plan for your business site.",
    excerpt: "How shared hosting works, who it suits, where it falls short and what to check before you buy.",
    readTime: "6 min read",
    updated: "2026-10-03",
    answer:
      "Shared hosting is a type of web hosting where many websites live on one physical server and share its CPU, memory and storage. The hosting company manages the server, security and software, so you only manage your website. It is the cheapest and simplest way to put a small business site, blog or portfolio online.",
    keyTakeaways: [
      "Shared hosting puts many websites on one server, which keeps the cost per website low.",
      "The host handles server maintenance, security patching and software updates, so no technical server skills are needed.",
      "Each account gets a fair share of resources, so a sudden spike in traffic or heavy code can hit limits.",
      "It suits brochure sites, blogs, small WordPress sites and modest online shops.",
      "When a site outgrows shared hosting, the usual next step is a VPS.",
    ],
    sections: [
      {
        heading: "How does shared hosting work?",
        body: [
          "A web server is a computer that stays connected to the internet and sends your website's files to visitors' browsers. With shared hosting, the hosting company splits one powerful server into many separate accounts. Each account has its own login, files, databases and email addresses, but all of them draw on the same processor, memory, disk and network connection.",
          "Software on the server keeps accounts apart, so one customer cannot see or change another customer's files. Most hosts also cap how much CPU and memory a single account can use at once, so one busy site cannot slow everyone else down.",
          "You manage your account through a control panel, most commonly cPanel. From there you can upload files, create email accounts, set up databases, install SSL certificates and install apps such as WordPress with a few clicks.",
          "You also need a domain name, such as yourbusiness.in. The domain is registered separately or with the same company, and its DNS records point to the hosting account so that visitors who type your address reach your site and emails reach your mailboxes.",
        ],
      },
      {
        heading: "Who is shared hosting for?",
        body: [
          "Shared hosting is a good fit when your website is important but not resource-heavy. Typical examples:",
          {
            list: [
              "A business website with a few service pages, a contact form and a blog.",
              "A WordPress site for a clinic, consultancy, school, restaurant or local shop.",
              "A small WooCommerce store with a modest product catalogue and steady traffic.",
              "A portfolio, landing page or personal blog.",
              "Several small websites for the same owner, if the plan allows more than one domain.",
            ],
          },
          "It is less suited to sites with large, unpredictable traffic spikes, custom server software, or applications that need to run background processes all day.",
        ],
      },
      {
        heading: "What are the pros and limitations?",
        body: [
          "The main advantages are cost and convenience. Because the server cost is split across many customers, shared hosting is the lowest-priced option. The host looks after the operating system, security updates and hardware, and a control panel makes everyday tasks simple.",
          "The limitations come from sharing:",
          {
            list: [
              "Resources are capped per account, so very busy or poorly optimised sites can hit limits and slow down.",
              "You cannot install custom server software or change server-wide settings, because you do not have root access.",
              "Activity on other accounts can occasionally affect performance, although good hosts limit this with per-account caps.",
              "Plans described as unlimited still have fair-use limits on CPU, memory and files.",
            ],
          },
        ],
      },
      {
        heading: "Shared vs VPS vs dedicated hosting",
        body: [
          "The three main hosting types differ in how much of a server you get and how much you manage yourself.",
          {
            table: {
              headers: ["", "Shared hosting", "VPS hosting", "Dedicated server"],
              rows: [
                ["Server", "One server shared by many accounts", "A virtual server with reserved resources", "A whole physical server for you"],
                ["Root access", "No", "Yes", "Yes"],
                ["Who manages the server", "The host", "Usually you, unless managed", "You, or the host on a managed plan"],
                ["Relative cost", "Lowest", "Medium", "Highest"],
                ["Best for", "Small business sites and blogs", "Growing sites and custom apps", "Large, high-traffic or specialised workloads"],
              ],
            },
          },
        ],
      },
      {
        heading: "What should you look for in a shared hosting plan?",
        body: [
          {
            list: [
              "Storage type: NVMe or SSD storage loads pages faster than older hard disks.",
              "Server location: a server close to your visitors, such as India for an Indian audience, usually responds faster.",
              "Backups: check how often backups are taken and whether you can restore them yourself.",
              "Free SSL: every site needs HTTPS, and it should not cost extra.",
              "One-click installers: tools such as Softaculous make installing WordPress and other apps quick.",
              "Support: check whether support is available by phone as well as ticket, and at what hours.",
              "Renewal price and term: compare the renewal cost, not just the first-year price.",
              "Refund policy and migration help, in case you are moving from another host.",
            ],
          },
        ],
      },
      {
        heading: "How to get started with shared hosting at MagicWorks Host",
        body: [
          "MagicWorks Host, based in Pune and operating since 2012, offers shared hosting on NVMe storage with cPanel, free SSL certificates, Softaculous one-click installs for WordPress, WooCommerce and other apps, and daily JetBackup snapshots you can restore from. Servers are available in India and the USA, and plans can be bought on 1-, 2- or 3-year terms.",
          "Hosting accounts get daily malware scanning and server-level hardening, and support is available 24/7 by phone and ticket. If you already have a website, the team will migrate it free on annual plans. New shared-hosting customers can request a full refund within 30 days. See the web hosting plans page to compare options.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is shared hosting good enough for a business website?",
        answer:
          "Yes, for most small business websites. A site with service pages, a blog and a contact form, or a small online shop, runs well on a good shared hosting plan.",
      },
      {
        question: "Is shared hosting safe if other people's websites are on the same server?",
        answer:
          "Accounts are kept separate, so other customers cannot access your files. Your own site's security still depends on keeping software updated, using strong passwords and having backups.",
      },
      {
        question: "Can I upgrade from shared hosting to a VPS later?",
        answer:
          "Yes. When your site needs more resources or root access, you can move it to a VPS. Your website files, databases and emails are copied across to the new server.",
      },
      {
        question: "Can I host more than one website on a shared hosting plan?",
        answer:
          "It depends on the plan. Some shared plans allow a single website, while higher tiers allow several domains in one account.",
      },
    ],
    relatedServices: [
      { label: "Web hosting plans", href: "/hosting" },
      { label: "Linux Shared Hosting", href: "/hosting/linux-shared-hosting" },
      { label: "WordPress Hosting", href: "/hosting/wordpress-hosting" },
      { label: "Compare hosting plans", href: "/compare-hosting-plans" },
    ],
    relatedGuides: ["what-is-vps-hosting", "wordpress-hosting-vs-shared-hosting", "domain-vs-hosting", "how-website-backups-work"],
  },
  {
    slug: "what-is-vps-hosting",
    categorySlug: "web-hosting",
    title: "What Is VPS Hosting?",
    metaTitle: "What Is VPS Hosting? How It Works and When to Use It",
    description:
      "VPS hosting explained: how virtual private servers work, how they compare with shared and dedicated hosting, and when your business site needs one.",
    excerpt: "How a virtual private server works, what root access means and when to move up from shared hosting.",
    readTime: "6 min read",
    updated: "2026-10-03",
    answer:
      "VPS hosting gives you a virtual private server: a section of a physical server with its own reserved CPU, memory, storage and operating system. You get root access to install software and change settings, without paying for a whole machine. It sits between shared hosting and a dedicated server in cost, control and performance.",
    keyTakeaways: [
      "A VPS is a virtual machine with reserved resources and its own operating system.",
      "Root access lets you install custom software and change server settings.",
      "Unless the VPS is managed, you are responsible for updates, security and backups on the server.",
      "A VPS is the usual next step when a site outgrows shared hosting.",
    ],
    sections: [
      {
        heading: "How does VPS hosting work?",
        body: [
          "A physical server runs software called a hypervisor, which divides the machine into several virtual servers. Each virtual server gets a fixed share of processor cores, memory and storage, and runs its own operating system, usually a Linux distribution.",
          "From the inside, a VPS behaves like a separate computer. You can restart it, install packages, run background services and configure the web server, database and firewall the way your application needs. Other virtual servers on the same hardware cannot see your data, and your reserved resources are not used by them.",
          "The word private refers to this isolation. You still share the underlying hardware, but you do not share an operating system or a pool of resources with other customers the way you do on shared hosting.",
        ],
      },
      {
        heading: "When should you choose a VPS?",
        body: [
          "A VPS makes sense when shared hosting starts to hold you back. Common signs:",
          {
            list: [
              "Your site regularly hits the CPU or memory limits of a shared plan, or slows down during busy periods.",
              "You run a growing online store, a membership site or a web application with many logged-in users.",
              "You need software that shared hosting does not allow, such as a specific PHP version, Node.js, a custom caching layer or scheduled jobs.",
              "You want to host several client or company websites with full control over the server.",
              "You need a dedicated IP address or specific firewall rules.",
            ],
          },
          "If your site is a small brochure site or blog that runs comfortably today, a VPS adds cost and work without much benefit.",
        ],
      },
      {
        heading: "What are the pros and limitations?",
        body: [
          "Advantages: reserved resources give more consistent performance than shared hosting; root access gives full control; and you can usually move to a bigger plan as traffic grows. It costs much less than renting a whole physical server.",
          "Limitations:",
          {
            list: [
              "Server administration is your job on an unmanaged VPS, including operating system updates, security hardening, monitoring and backups.",
              "Mistakes in configuration can take your site offline or leave it exposed.",
              "It costs more than shared hosting.",
              "You still share physical hardware, so a VPS is not the same as a dedicated server for very heavy workloads.",
            ],
          },
        ],
      },
      {
        heading: "VPS vs shared vs dedicated hosting",
        body: [
          {
            table: {
              headers: ["", "Shared hosting", "VPS hosting", "Dedicated server"],
              rows: [
                ["Resources", "Shared pool with per-account caps", "Reserved share of one server", "The entire server"],
                ["Root access", "No", "Yes", "Yes"],
                ["Custom software", "Limited to what the host provides", "Yes", "Yes"],
                ["Technical skill needed", "Low", "Medium to high, unless managed", "High, unless managed"],
                ["Relative cost", "Lowest", "Medium", "Highest"],
              ],
            },
          },
        ],
      },
      {
        heading: "Managed or unmanaged: who looks after the server?",
        body: [
          "On an unmanaged VPS, the host keeps the hardware, network and virtualisation layer running, and everything inside your server is your responsibility. That includes installing and updating the operating system, configuring the web server and database, setting up a firewall, watching for problems and taking backups.",
          "On a managed server, the host's team takes on some or all of that work. The exact scope varies between providers, so ask for a written list of what is and is not covered. For a business without an in-house system administrator, the extra cost of management is often cheaper than the time and risk of doing it yourself.",
        ],
      },
      {
        heading: "What should you look for in a VPS plan?",
        body: [
          {
            list: [
              "Reserved CPU cores, memory and storage, and whether the storage is NVMe or SSD.",
              "Server location close to your customers.",
              "How easy it is to upgrade to a bigger tier without rebuilding the server.",
              "Which operating systems are available and whether a control panel is included or extra.",
              "Backups and snapshots: who takes them and how you restore.",
              "Support: what the host will help with on an unmanaged server, and whether a managed option exists.",
            ],
          },
          "If you do not have someone who can look after a Linux server, budget for management or choose a managed plan.",
        ],
      },
      {
        heading: "How to get started with VPS hosting at MagicWorks Host",
        body: [
          "MagicWorks Host offers cloud VPS hosting, deployed through the MagicWorksHost cloud management platform, with full root access and NVMe-backed storage on servers in India and the USA. You can upgrade to a bigger tier as you grow without a migration project.",
          "If you need a whole machine instead, the company also offers dedicated servers and managed dedicated servers, where the team handles setup, OS updates, security patching, monitoring and backups. Visit the VPS hosting page to see the available tiers, or contact the team if you are unsure which fits.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do I need technical knowledge to use a VPS?",
        answer:
          "For an unmanaged VPS, yes. You need to be comfortable with Linux server administration, including updates, security and backups, or have someone who can do it for you.",
      },
      {
        question: "Is a VPS faster than shared hosting?",
        answer:
          "Usually it is more consistent, because the CPU and memory are reserved for you. Actual speed also depends on how well your site and server are configured.",
      },
      {
        question: "What does root access mean?",
        answer:
          "Root access is full administrator access to the server's operating system. It lets you install any software and change any setting, which also means a wrong change can break the server.",
      },
      {
        question: "Can I run WordPress on a VPS?",
        answer:
          "Yes. WordPress runs well on a VPS and is a common choice for busy WordPress sites and WooCommerce stores that have outgrown shared hosting.",
      },
    ],
    relatedServices: [
      { label: "VPS Hosting", href: "/vps-hosting" },
      { label: "Cloud Hosting", href: "/services/cloud-hosting" },
      { label: "Managed Dedicated Server", href: "/dedicated-hosting/managed-dedicated-server" },
      { label: "Compare hosting plans", href: "/compare-hosting-plans" },
    ],
    relatedGuides: ["what-is-shared-hosting", "what-is-cloud-hosting", "website-migration-checklist"],
  },
  {
    slug: "what-is-cloud-hosting",
    categorySlug: "web-hosting",
    title: "What Is Cloud Hosting?",
    metaTitle: "What Is Cloud Hosting? Cloud vs VPS Explained",
    description:
      "Cloud hosting explained in plain English: how it works, how it differs from a traditional VPS, its trade-offs, and how to decide if your site needs it.",
    excerpt: "What cloud hosting actually means, how it compares with a VPS and how to tell whether you need it.",
    readTime: "6 min read",
    updated: "2026-10-03",
    answer:
      "Cloud hosting runs your website on virtual servers created from a large pool of connected hardware, rather than on one fixed physical machine. Servers can be created, resized or moved through software, which makes upgrades easier. For most small businesses, cloud hosting means a cloud VPS: a virtual server with reserved resources and root access.",
    keyTakeaways: [
      "Cloud hosting uses virtual servers drawn from a pool of hardware managed by software.",
      "The term covers many products, from a single cloud VPS to large multi-server setups.",
      "Features such as auto-scaling and usage-based billing depend on the provider and plan, so check what is actually included.",
      "For most small business sites, a cloud VPS gives enough control and room to grow.",
    ],
    sections: [
      {
        heading: "How does cloud hosting work?",
        body: [
          "In traditional hosting, your website lives on one specific physical server. In cloud hosting, the provider runs many servers and storage systems together and manages them through a cloud management platform. When you order a server, the platform creates a virtual machine for you from that shared pool of resources.",
          "Because the server is defined in software, the provider can resize it, take snapshots of it, or move it to different hardware more easily than with a fixed physical machine. You see a server with its own operating system, IP address and reserved CPU, memory and storage, much like a VPS.",
          "For a small business, the practical difference is mostly about flexibility. If your website needs more memory before a sale or a busy season, a cloud server can usually be moved to a bigger size through the platform instead of rebuilding everything on a new machine. Snapshots also make it easier to roll back after a bad update.",
        ],
      },
      {
        heading: "Is cloud hosting the same as a VPS?",
        body: [
          "The two overlap a great deal, and many providers use the terms together. A traditional VPS is a virtual server on one physical host. A cloud VPS is a virtual server created and managed through a cloud platform, which usually makes resizing and recovery simpler.",
          "Large public cloud platforms also offer extras such as automatic scaling across many servers, load balancers and billing by the hour. These are features of particular services, not of cloud hosting in general, so always read what a specific plan includes.",
          {
            table: {
              headers: ["", "Traditional VPS", "Cloud VPS", "Large public cloud platform"],
              rows: [
                ["Where it runs", "One physical server", "A pool of servers managed by a cloud platform", "Many servers across regions"],
                ["Root access", "Yes", "Yes", "Yes"],
                ["Resizing", "May need a rebuild or migration", "Usually done through the platform", "Usually done through the platform"],
                ["Billing", "Fixed monthly or yearly", "Depends on provider", "Often usage-based"],
                ["Who it suits", "Steady workloads", "Growing business sites and apps", "Teams with cloud engineering skills"],
              ],
            },
          },
        ],
      },
      {
        heading: "Who should consider cloud hosting?",
        body: [
          {
            list: [
              "Businesses whose website or application has outgrown shared hosting.",
              "Online stores and web apps that expect to need more resources over time.",
              "Developers and agencies that want root access and the ability to resize servers.",
              "Teams that need a specific software stack the shared environment cannot provide.",
            ],
          },
          "If your site is a small brochure site, shared hosting is usually simpler and cheaper. Cloud hosting pays off when you need control and room to grow.",
          "A useful test: if you cannot name a specific limit that shared hosting is causing you, such as slow pages under load, blocked software or resource warnings from your host, you probably do not need cloud hosting yet.",
        ],
      },
      {
        heading: "What are the pros and limitations?",
        body: [
          "Pros: reserved resources, root access, easier upgrades, and the ability to run custom software. Snapshots and resizing are often simpler than on a fixed physical server.",
          "Limitations:",
          {
            list: [
              "You or someone on your team must manage the server unless the plan is managed.",
              "It costs more than shared hosting.",
              "Marketing language around cloud can be vague, so features you assume are included may not be.",
              "Large public cloud platforms can be complex to set up and their usage-based bills can be hard to predict.",
            ],
          },
        ],
      },
      {
        heading: "What should you look for in a cloud hosting plan?",
        body: [
          {
            list: [
              "Exactly what resources are reserved: CPU cores, memory, storage type and bandwidth.",
              "How upgrades work and whether moving to a bigger tier needs a migration.",
              "Server locations close to your customers.",
              "Whether pricing is fixed or usage-based.",
              "Backups and snapshots, and who is responsible for them.",
              "What support covers on the server.",
            ],
          },
          "Also ask who will run the server day to day. A cloud server with nobody looking after updates and security is riskier than a well-run shared hosting account.",
        ],
      },
      {
        heading: "How to get started with cloud hosting at MagicWorks Host",
        body: [
          "At MagicWorks Host, cloud hosting is offered as cloud VPS, deployed through the MagicWorksHost cloud management platform. Each server has full root access and NVMe-backed storage, with locations in India and the USA, and you can upgrade to a bigger tier without a migration project.",
          "See the cloud hosting and VPS hosting pages for the available tiers, or contact the team to talk through what your site needs.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is cloud hosting better than shared hosting?",
        answer:
          "Not for every site. Cloud hosting gives more control and reserved resources, but shared hosting is simpler and cheaper and is enough for most small business websites.",
      },
      {
        question: "Does cloud hosting scale automatically?",
        answer:
          "Only if the specific plan includes auto-scaling. Many cloud VPS plans are resized manually by upgrading to a bigger tier, so check the plan details.",
      },
      {
        question: "What is the difference between cloud hosting and a VPS?",
        answer:
          "A VPS is a virtual server with reserved resources. A cloud VPS is the same kind of server created through a cloud management platform, which usually makes resizing and recovery easier.",
      },
      {
        question: "Do I need a developer to use cloud hosting?",
        answer:
          "If the server is unmanaged, you need someone comfortable administering a Linux server. Otherwise, consider a managed option or stay on shared hosting.",
      },
    ],
    relatedServices: [
      { label: "Cloud Hosting", href: "/services/cloud-hosting" },
      { label: "VPS Hosting", href: "/vps-hosting" },
      { label: "Compare hosting plans", href: "/compare-hosting-plans" },
    ],
    relatedGuides: ["what-is-vps-hosting", "what-is-shared-hosting", "website-migration-checklist"],
  },
  {
    slug: "what-is-reseller-hosting",
    categorySlug: "web-hosting",
    title: "What Is Reseller Hosting?",
    metaTitle: "What Is Reseller Hosting? How It Works and Who It Suits",
    description:
      "Reseller hosting explained: how you host client websites under your own account, who it suits, its trade-offs, and what to check before you start.",
    excerpt: "How reseller hosting lets agencies and freelancers host client websites, and what to check before you start.",
    readTime: "6 min read",
    updated: "2026-10-03",
    answer:
      "Reseller hosting is a hosting account that lets you create and manage separate hosting accounts for other people, usually your clients. You buy server resources from a hosting company and divide them into individual client accounts, each with its own control panel. It suits web designers, developers and agencies who want to host the websites they build.",
    keyTakeaways: [
      "A reseller account lets you split your hosting resources into separate accounts for clients.",
      "Each client account is isolated, with its own login, files and email.",
      "The hosting company runs the server; you look after your clients and their accounts.",
      "It suits agencies and freelancers more than single-site owners.",
      "Check the limits, support arrangement and billing tools before you commit.",
    ],
    sections: [
      {
        heading: "How does reseller hosting work?",
        body: [
          "The hosting company owns and maintains the servers. You buy a reseller account with an allocation of disk space, bandwidth and number of accounts. Using a management panel, commonly WHM on cPanel servers, you create a separate hosting account for each client and assign each one a share of your resources.",
          "Each client gets their own control panel to manage files, email and databases, and cannot see other clients' accounts. You decide what to charge clients and how to bill them. Many reseller setups let you present the service under your own business name, though the details vary by provider.",
          "In most setups, responsibilities are split like this:",
          {
            list: [
              "The hosting company: server hardware, network, operating system, server security and the control panel software.",
              "You: creating and suspending client accounts, setting each account's limits, pointing client domains to the server, and first-line help for your clients.",
              "Your clients: the content of their own websites and mailboxes.",
            ],
          },
        ],
      },
      {
        heading: "Who is reseller hosting for?",
        body: [
          {
            list: [
              "Web designers and developers who build sites and want to host them for clients.",
              "Digital marketing agencies that manage many client websites.",
              "IT service providers who offer website and email as part of a wider package.",
              "Businesses that run several brands or websites and want each in its own account.",
            ],
          },
          "If you only run one or two websites of your own, a regular shared hosting plan is usually simpler and cheaper.",
          "Reseller hosting works best when you already have clients who trust you with their website and would rather pay you for hosting than deal with a hosting company themselves.",
        ],
      },
      {
        heading: "What are the pros and limitations?",
        body: [
          "Pros: you can offer hosting to clients without running your own servers; each client is isolated, so one client's problem does not affect the others' files; and hosting can become a recurring source of income alongside design or maintenance work.",
          "Limitations:",
          {
            list: [
              "Your clients will usually come to you first for support, so you need to be ready to answer hosting questions or escalate them.",
              "All your accounts still sit on shared server resources, so heavy client sites can hit limits.",
              "You are responsible for client billing, renewals and collecting payments.",
              "Moving many client sites to a different provider later takes planning.",
            ],
          },
        ],
      },
      {
        heading: "Reseller hosting vs shared hosting",
        body: [
          {
            table: {
              headers: ["", "Shared hosting", "Reseller hosting"],
              rows: [
                ["Who uses it", "A site owner", "An agency, freelancer or IT provider"],
                ["Number of control panels", "One account", "Many separate client accounts"],
                ["Client isolation", "Not applicable", "Each client has their own account"],
                ["Billing clients", "Not applicable", "Handled by you"],
                ["First-line support", "The host supports you", "You support clients; the host supports you"],
              ],
            },
          },
        ],
      },
      {
        heading: "How do resellers charge their clients?",
        body: [
          "You set your own prices. Common approaches are a yearly hosting fee per website, a bundle that includes hosting, domain renewal and email, or a monthly care plan that covers hosting together with updates, backups and small content changes.",
          "Whatever model you choose, keep a clear record of each client's renewal dates for both hosting and domains. A missed domain renewal can take a client's website and email offline, and it is usually the reseller who gets the call. Agree in writing what your fee includes, especially around support hours, backups and site repairs after a hack.",
        ],
      },
      {
        heading: "What should you check before choosing reseller hosting?",
        body: [
          {
            list: [
              "How many client accounts you can create, and the disk and bandwidth allocation.",
              "Whether clients get their own control panel and email.",
              "Backup frequency and whether you or your clients can restore files.",
              "Server locations that suit your clients' audiences.",
              "What support the host gives you, and whether it is available when your clients need it.",
              "Whether you can brand the service as your own.",
              "How free SSL certificates work for client domains.",
            ],
          },
        ],
      },
      {
        heading: "How to get reseller hosting from MagicWorks Host",
        body: [
          "MagicWorks Host offers reseller hosting on request rather than as fixed published plans. If you build or manage websites for clients, talk to the team about a reseller account and what you need, and they will advise on the options. Start from the reseller hosting page or the contact page.",
          "It helps to have a few details ready: roughly how many client websites you plan to host, what kind of sites they are, and where most of your clients' visitors are located.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do I need technical skills to run a reseller hosting business?",
        answer:
          "You do not need to manage servers, because the hosting company does that. You do need to be comfortable creating accounts, handling DNS and email setup, and answering basic client questions.",
      },
      {
        question: "Can my clients see that I use another hosting company?",
        answer:
          "It depends on the provider. Some reseller setups let you present hosting under your own brand, while others show the provider's name in places such as nameservers.",
      },
      {
        question: "Is reseller hosting the same as shared hosting?",
        answer:
          "Both usually run on shared servers. The difference is that reseller hosting lets you create and manage many separate accounts for other people.",
      },
      {
        question: "Does MagicWorks Host offer reseller hosting?",
        answer:
          "Yes, on request. Contact the team through the reseller hosting page to discuss a reseller account.",
      },
    ],
    relatedServices: [
      { label: "Reseller Hosting", href: "/services/reseller-hosting" },
      { label: "Contact us", href: "/contact-us" },
      { label: "Web hosting plans", href: "/hosting" },
      { label: "Website Development", href: "/services/website-development" },
    ],
    relatedGuides: ["what-is-shared-hosting", "what-is-vps-hosting", "domain-vs-hosting", "what-is-ssl"],
  },
]

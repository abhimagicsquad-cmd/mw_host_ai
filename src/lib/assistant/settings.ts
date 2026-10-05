import { serviceOptions } from "../../constants/service-options"
import {
  FLOW_OPTION_KINDS,
  isPlanCategory,
  QUICK_ACTION_KINDS,
  type ActionKind,
  type AssistantSettings,
  type ConversationFlow,
  type ConversationStarter,
  type FlowOption,
  type FlowStep,
  type FlowStepNode,
  type FlowStepOption,
  type PublicAssistantConfig,
  type QuickAction,
  type RecommendationFlow,
} from "./types"

/** `settings` row that holds the assistant's configuration. */
export const ASSISTANT_SETTINGS_KEY = "chatbot"

export const DEFAULT_WELCOME_MESSAGE = `Hi 👋 Welcome to MagicWorks Host.

Looking for fast, secure and high-performance hosting?

I can help you compare hosting plans, recommend the best option for your needs, and connect you with our team for a quote.`

export const isServiceValue = (value: unknown): value is string => serviceOptions.some((option) => option.value === value)

// --- Default conversation flows --------------------------------------------------------------
// Every statement restates something already published on the site (plans, service pages,
// Knowledge Base). Edit them in Admin → Hosting Assistant → Conversation Flows.

type O = FlowStepOption
const step = (id: string, label: string, value: string, response?: string): O => ({ id, label, kind: "step", value, ...(response ? { response } : {}) })
const flowTo = (id: string, label: string, value: string): O => ({ id, label, kind: "flow", value })
const lead = (id: string, label: string, service: string, response?: string): O => ({ id, label, kind: "lead", value: service, ...(response ? { response } : {}) })
const link = (id: string, label: string, href: string): O => ({ id, label, kind: "link", value: href })
const plans = (id: string, label: string, category: string): O => ({ id, label, kind: "plans", value: category })
const recommendOpt = (id: string, label: string): O => ({ id, label, kind: "recommend" })

export const DEFAULT_FLOWS: ConversationFlow[] = [
  {
    id: "menu",
    name: "Main topics",
    triggers: ["menu", "help", "options", "what can you do", "start over"],
    steps: [
      {
        id: "start",
        message: "Here's what I can help you with:",
        options: [
          recommendOpt("choose", "Find the right hosting"),
          flowTo("vps", "VPS & cloud hosting", "vps"),
          flowTo("domain", "Domains & DNS", "domain"),
          flowTo("ssl", "SSL certificates", "ssl"),
          flowTo("migration", "Website migration", "migration"),
          flowTo("maintenance", "Maintenance & security", "maintenance"),
          flowTo("development", "Website development", "development"),
          lead("expert", "Talk to an expert", "not-sure"),
        ],
      },
    ],
  },
  {
    id: "hosting",
    name: "Need Hosting",
    triggers: ["need hosting", "buy hosting", "web hosting", "hosting plan", "hosting plans", "shared hosting", "looking for hosting"],
    steps: [
      {
        id: "start",
        message:
          "Happy to help you find the right hosting. 🙂\n\nOur shared hosting plans include **NVMe storage**, **free SSL**, cPanel and JetBackup backups — with **24/7 phone and ticket support**.\n\nWhere would you like to start?",
        options: [
          recommendOpt("choose", "Help me choose a plan"),
          plans("shared", "Shared hosting plans", "shared"),
          plans("wordpress", "WordPress hosting", "wordpress"),
          flowTo("vps", "VPS hosting", "vps"),
          lead("expert", "Talk to an expert", "shared-hosting"),
        ],
      },
    ],
  },
  {
    id: "speed",
    name: "Need a Faster Website",
    triggers: ["slow", "speed", "faster", "speed up", "performance", "load time", "loading", "optimise", "optimize"],
    steps: [
      {
        id: "start",
        message:
          "A faster website usually depends on:\n\n• **Better hosting**\n• **CDN configuration**\n• **Caching**\n• **Image optimisation**\n• **Database optimisation**\n\nWhat would you like help with?",
        options: [
          recommendOpt("upgrade", "Hosting Upgrade"),
          lead("audit", "Website Speed Audit", "website-maintenance", "Good idea — a speed review shows exactly what's slowing your site down, so you fix the right things first."),
          step("optimise", "Performance Optimization", "optimise"),
          lead("expert", "Talk To Expert", "not-sure"),
        ],
      },
      {
        id: "optimise",
        message:
          "Here's what usually makes the biggest difference:\n\n• **Caching** — serve pages without rebuilding them on every visit\n• **Image optimisation** — compress images and use modern formats\n• **CDN** — deliver files from servers close to your visitors\n• **Database clean-up** — remove bloat and slow queries\n• **Faster hosting** — NVMe storage, or a VPS for busy sites\n\nWould you like help with any of these?",
        options: [
          lead("help", "Help me optimise my site", "website-maintenance"),
          recommendOpt("upgrade", "Upgrade my hosting"),
          link("wp", "WordPress speed guide", "/knowledge-base/how-to-speed-up-wordpress/"),
          flowTo("maintenance", "Ongoing maintenance", "maintenance"),
        ],
      },
    ],
  },
  {
    id: "vps",
    name: "VPS Hosting",
    triggers: ["vps", "virtual private server", "root access"],
    steps: [
      {
        id: "start",
        message:
          "**VPS hosting** gives you your own virtual server: a guaranteed CPU and RAM allocation, **full root access** and your choice of software — the usual next step when a site outgrows shared hosting.\n\nOur VPS plans run in **India and the USA** and are delivered within 24 hours.",
        options: [
          plans("plans", "See VPS plans", "vps"),
          step("fit", "Is VPS right for me?", "fit"),
          flowTo("cloud", "Cloud hosting", "cloud"),
          lead("expert", "Talk to an expert", "vps-hosting"),
        ],
      },
      {
        id: "fit",
        message:
          "A VPS is a good fit if:\n\n• Your site gets steady traffic or regular spikes\n• You run an online store or a custom application\n• You need root access or custom server software\n• Shared hosting feels slow or limiting\n\nFor most new business sites and blogs, shared hosting is plenty to start with.",
        options: [recommendOpt("choose", "Recommend a plan for me"), plans("plans", "See VPS plans", "vps"), lead("expert", "Talk to an expert", "vps-hosting")],
      },
    ],
  },
  {
    id: "cloud",
    name: "Cloud Hosting",
    triggers: ["cloud", "cloud hosting", "cloud server"],
    steps: [
      {
        id: "start",
        message:
          "**Cloud hosting** at MagicWorks Host is offered as cloud VPS: your own virtual server with its own CPU and RAM, **full root access** and servers in **India or the USA** — built for sites and applications that need room to grow.",
        options: [plans("plans", "See cloud plans", "cloud"), step("diff", "Cloud vs VPS", "diff"), lead("expert", "Talk to an expert", "cloud-hosting")],
      },
      {
        id: "diff",
        message:
          "On our platform, cloud hosting uses the same cloud VPS tiers as VPS hosting — so the choice is really about the size of server your workload needs and how you expect it to grow.\n\nTell me about your project and I'll point you to the right size.",
        options: [recommendOpt("choose", "Help me choose"), plans("plans", "See plans", "cloud"), lead("expert", "Talk to an expert", "cloud-hosting")],
      },
    ],
  },
  {
    id: "domain",
    name: "Domain Registration",
    triggers: ["domain", "domains", "domain name", "dns", "nameserver", "nameservers", "register a domain"],
    steps: [
      {
        id: "start",
        message: "A domain name is your website's address on the internet — like **yourbusiness.com**.\n\nHow can I help?",
        options: [
          step("register", "Register New Domain", "register"),
          step("transfer", "Transfer Existing Domain", "transfer"),
          step("pricing", "Domain Pricing", "pricing"),
          step("dns", "DNS Help", "dns"),
        ],
      },
      {
        id: "register",
        message:
          "Great — start by searching for the name you want. Domains are usually active within a few minutes of payment, and **WHOIS privacy is free** on supported extensions.\n\nTip: keep it short, easy to spell and close to your business name.",
        options: [
          link("search", "Search for a domain", "/domain-name-search-landing-page/"),
          recommendOpt("hosting", "I need hosting too"),
          lead("expert", "Help me pick a name", "domain"),
        ],
      },
      {
        id: "transfer",
        message:
          "Moving a domain to us takes a few steps:\n\n• **Unlock** the domain at your current registrar\n• Get its **authorisation (EPP) code**\n• **Start the transfer** here and approve it by email\n\nMost transfers complete in **1–7 days**, depending on your current registrar.",
        options: [
          link("start", "Start a transfer", "/transfer-your-domain-name/"),
          link("guide", "Step-by-step transfer guide", "/knowledge-base/how-to-transfer-a-domain/"),
          lead("expert", "Help me transfer", "domain"),
        ],
      },
      {
        id: "pricing",
        message: "Prices depend on the extension (.com, .in, .org…). You'll find current registration, renewal and transfer prices on our domain page.",
        options: [link("prices", "See domain prices", "/domain/"), link("search", "Search for a domain", "/domain-name-search-landing-page/"), lead("expert", "Ask about a specific domain", "domain")],
      },
      {
        id: "dns",
        message:
          "DNS tells the internet where your domain points:\n\n• **A record** — points your domain to your website's server\n• **CNAME** — points one name to another (e.g. www)\n• **MX records** — route your email\n• **Nameservers** — decide which provider manages your DNS\n\nChanges usually spread within 24–48 hours.",
        options: [lead("help", "Help me with my DNS", "domain"), link("guide", "Domain vs hosting explained", "/knowledge-base/domain-vs-hosting/"), step("back", "Other domain questions", "start")],
      },
    ],
  },
  {
    id: "ssl",
    name: "SSL Certificates",
    triggers: ["ssl", "https", "certificate", "padlock", "not secure"],
    steps: [
      {
        id: "start",
        message:
          "An **SSL certificate** encrypts the connection between your website and its visitors — that's the padlock and **https://** in the browser.\n\nWhy it matters:\n\n• Protects logins, forms and payments\n• Avoids the \"Not secure\" browser warning\n• Builds visitor trust\n• Search engines favour secure sites\n\nWhat do you need?",
        options: [step("free", "Free SSL", "free"), step("premium", "Premium SSL", "premium"), step("install", "SSL Installation Help", "install")],
      },
      {
        id: "free",
        message: "All our **shared hosting plans include a free SSL certificate**, issued and renewed automatically. It's domain-validated — the right choice for most blogs and business sites.",
        options: [plans("plans", "See hosting plans", "shared"), step("premium", "Premium SSL options", "premium"), lead("expert", "Talk to an expert", "ssl")],
      },
      {
        id: "premium",
        message:
          "For more trust or wider coverage we offer:\n\n• **Domain Validated (DV)** — fast encryption for one domain\n• **Business Validated (OV)** — confirms your organisation\n• **Extended Validation (EV)** — the highest identity assurance\n• **Wildcard** — covers all first-level subdomains\n\nPaid certificates are installed free on our hosting.",
        options: [step("choose", "Which one do I need?", "choose"), link("compare", "Compare SSL certificates", "/buy-ssl-certificate/"), lead("expert", "Talk to an expert", "ssl")],
      },
      {
        id: "choose",
        message:
          "A quick guide:\n\n• **Blog or small business site** → Domain Validated\n• **Company that wants its identity verified** → Business Validated\n• **Payments or sensitive data** → Extended Validation\n• **Many subdomains** (shop., blog., …) → Wildcard",
        options: [link("compare", "Compare certificates", "/buy-ssl-certificate/"), lead("expert", "Ask our team", "ssl")],
      },
      {
        id: "install",
        message:
          "If your site is hosted with us, the free SSL is set up automatically, and paid certificates are installed on our hosting at no extra cost.\n\nHosted somewhere else? Our team can guide you through it.",
        options: [lead("help", "Get installation help", "ssl"), flowTo("support", "Contact support", "support")],
      },
    ],
  },
  {
    id: "maintenance",
    name: "Website Maintenance",
    triggers: ["maintenance", "maintain", "website updates", "plugin updates", "backup", "backups", "hacked", "malware", "security"],
    steps: [
      {
        id: "start",
        message:
          "Website maintenance keeps your site **secure, fast and working**, so you can focus on your business. It typically covers:\n\n• **Updates** — core, theme and plugin updates\n• **Security** — monitoring and hardening\n• **Backups** — regular backups you can restore\n• **Monitoring** — uptime and performance checks\n\nWhat do you need help with?",
        options: [
          step("updates", "Website Updates", "updates"),
          step("security", "Security Hardening", "security"),
          step("backups", "Backup Management", "backups"),
          flowTo("speed", "Performance Optimization", "speed"),
        ],
      },
      {
        id: "updates",
        message:
          "Out-of-date software is the most common reason sites break or get hacked. Our maintenance service can keep WordPress core, themes and plugins updated and check your site after each update — we confirm the exact tasks in your quote.",
        options: [lead("quote", "Get a maintenance quote", "website-maintenance"), plans("plans", "See maintenance plans", "maintenance"), step("back", "Other maintenance topics", "start")],
      },
      {
        id: "security",
        message:
          "Security hardening reduces the risk of a hack:\n\n• Strong logins and limited admin access\n• Firewall and malware protection\n• Keeping everything updated\n• Backups you can restore quickly\n\nAlready hacked? Tell our team — we'll help you recover.",
        options: [lead("review", "Get a security review", "website-security"), link("page", "Website security services", "/website-security/"), step("back", "Other maintenance topics", "start")],
      },
      {
        id: "backups",
        message:
          "Good backups mean a bad update or a hack is never a disaster. Our hosting includes **JetBackup**, and maintenance can add regular restore checks so you know your backups actually work.",
        options: [lead("quote", "Get a maintenance quote", "website-maintenance"), link("guide", "How backups work", "/knowledge-base/how-website-backups-work/"), step("back", "Other maintenance topics", "start")],
      },
    ],
  },
  {
    id: "development",
    name: "Website Development",
    triggers: ["new website", "build a website", "website development", "web design", "web development", "make a website", "design a website"],
    steps: [
      {
        id: "start",
        message: "We'd love to help you build your website. 🚀\n\nWhat type of website are you looking for?",
        options: [
          step("business", "Business Website", "goal", "A business website — a great way to win customers online."),
          step("ecommerce", "Ecommerce Website", "goal", "An online store — exciting!"),
          step("portfolio", "Portfolio Website", "goal", "A portfolio — the best way to show off your work."),
          step("custom", "Custom Web Application", "goal", "A custom web application — let's understand it a bit better."),
        ],
      },
      {
        id: "goal",
        message: "What matters most for this project?",
        options: [
          step("fast", "Getting online quickly", "hosting"),
          step("design", "A custom design", "hosting"),
          step("features", "Special features or integrations", "hosting"),
          step("unsure", "Not sure yet", "hosting"),
        ],
      },
      {
        id: "hosting",
        message: "Do you already have a domain and hosting?",
        options: [
          lead("both", "Yes, I have both", "website-development", "Perfect — our development team will put together a proposal for you."),
          lead("need", "No, I need them too", "website-development", "No problem — we can set up the domain, hosting and website together."),
          lead("unsure", "Not sure", "website-development", "That's fine — we'll check what you have and advise."),
        ],
      },
    ],
  },
  {
    id: "migration",
    name: "Website Migration",
    triggers: ["migrate", "migration", "move my website", "move my site", "switch host", "switch hosting", "transfer my website", "change hosting"],
    steps: [
      {
        id: "start",
        message:
          "Moving to MagicWorks Host? Our team can help migrate your website — files, databases and, where needed, email — and plan the switch to keep downtime to a minimum.\n\nWhat are you migrating?",
        options: [
          step("wp", "WordPress Website", "size"),
          step("shared", "Shared Hosting Website", "size"),
          step("vps", "VPS Website", "size"),
          step("other", "Other Website", "size"),
        ],
      },
      {
        id: "size",
        message: "Roughly how large is the website (files and databases)?",
        options: [step("small", "Small (under 1 GB)", "email"), step("medium", "Medium (1–10 GB)", "email"), step("large", "Large or not sure", "email")],
      },
      {
        id: "email",
        message: "Do you also need your email accounts moved?",
        options: [
          lead("yes", "Yes, email too", "website-migration", "Thanks — that's everything we need to plan your migration."),
          lead("no", "No, website only", "website-migration", "Thanks — that's everything we need to plan your migration."),
          link("checklist", "Read the migration checklist first", "/knowledge-base/website-migration-checklist/"),
        ],
      },
    ],
  },
  {
    id: "support",
    name: "Contact Support",
    triggers: ["support", "ticket", "not working", "website down", "site down", "error", "problem", "issue", "invoice", "billing"],
    steps: [
      {
        id: "start",
        message: "Our support team is available **24/7** by phone and tickets. What do you need help with?",
        options: [step("tech", "Technical issue", "tech"), step("billing", "Billing or my account", "billing"), lead("talk", "Talk to someone", "not-sure")],
      },
      {
        id: "tech",
        message: "For the fastest help with a technical issue:\n\n• **Call us 24/7:** +91 9764746633\n• **Open a ticket** from your client area\n• **Browse the Knowledge Base** for step-by-step guides",
        options: [
          link("ticket", "Open a support ticket", "https://www.magicworkshost.com/clients/submitticket.php"),
          link("call", "Call +91 9764746633", "tel:+919764746633"),
          link("kb", "Knowledge Base", "/knowledge-base/"),
          lead("callback", "Ask for a call back", "not-sure"),
        ],
      },
      {
        id: "billing",
        message: "You can view invoices, renew services and update your details in the client area.",
        options: [link("client", "Open the client area", "https://www.magicworkshost.com/clients/clientarea.php"), lead("talk", "Talk to our team", "not-sure")],
      },
    ],
  },
]

export const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { id: "qa-hosting-plans", label: "Hosting Plans", kind: "recommend" },
  { id: "qa-vps", label: "VPS Hosting", kind: "flow", value: "vps" },
  { id: "qa-cloud", label: "Cloud Hosting", kind: "flow", value: "cloud" },
  { id: "qa-domain", label: "Domain Registration", kind: "flow", value: "domain" },
  { id: "qa-ssl", label: "SSL Certificates", kind: "flow", value: "ssl" },
  { id: "qa-migration", label: "Website Migration", kind: "flow", value: "migration" },
  { id: "qa-development", label: "Website Development", kind: "flow", value: "development" },
  { id: "qa-maintenance", label: "Website Maintenance", kind: "flow", value: "maintenance" },
  { id: "qa-support", label: "Contact Support", kind: "flow", value: "support" },
  { id: "qa-quote", label: "Request a Quote", kind: "lead", value: "not-sure" },
]

export const DEFAULT_STARTERS: ConversationStarter[] = [
  { id: "st-hosting", text: "Looking for Hosting?", flowId: "hosting" },
  { id: "st-maintenance", text: "Need Website Maintenance?", flowId: "maintenance" },
  { id: "st-faster", text: "Need a Faster Website?", flowId: "speed" },
  { id: "st-business", text: "Need a Website for Your Business?", flowId: "development" },
  { id: "st-choose", text: "Need Help Choosing a Hosting Plan?", actionId: "qa-hosting-plans" },
]

export const DEFAULT_FLOW: RecommendationFlow = {
  fallbackCategory: "shared",
  steps: [
    {
      id: "type",
      question: "What type of website are you hosting?",
      options: [
        { id: "business", label: "Business Website" },
        { id: "ecommerce", label: "Ecommerce", size: 2 },
        { id: "blog", label: "Blog", category: "wordpress" },
        { id: "portfolio", label: "Portfolio" },
        { id: "agency", label: "Agency Website", size: 2 },
      ],
    },
    {
      id: "visitors",
      question: "How many visitors do you expect monthly?",
      options: [
        { id: "small", label: "Under 5,000", size: 1 },
        { id: "medium", label: "5,000 - 25,000", size: 2 },
        { id: "large", label: "25,000+", category: "vps" },
      ],
    },
    {
      id: "email",
      question: "Do you need email hosting?",
      options: [
        { id: "yes", label: "Yes", note: "📧 Professional email on your own domain can be added — ask our team about Business or Enterprise Email." },
        { id: "no", label: "No" },
      ],
    },
    {
      id: "migration",
      question: "Do you need website migration?",
      options: [
        { id: "yes", label: "Yes", note: "🚚 Our team can help move your existing website — just mention it when you talk to us." },
        { id: "no", label: "No" },
      ],
    },
  ],
}

export const DEFAULT_ASSISTANT_SETTINGS: AssistantSettings = {
  enabled: false,
  brandName: "MW Host Hosting Assistant",
  welcomeMessage: DEFAULT_WELCOME_MESSAGE,
  introMessage: "Pick an option below, or type your question.",
  avatarUrl: "",
  position: "bottom-right",
  primaryColor: "#0B3B68",
  secondaryColor: "#F47C45",
  typingDelayMs: 700,
  autoOpenSeconds: 0,
  visibility: "all",
  pages: [],
  quickActions: DEFAULT_QUICK_ACTIONS,
  starters: DEFAULT_STARTERS,
  flow: DEFAULT_FLOW,
  flows: DEFAULT_FLOWS,
}

const HEX = /^#[0-9a-f]{6}$/i
const ID = /^[a-z0-9-]{1,40}$/i
const LINK = /^(\/(?!\/)|https:\/\/|tel:\+?[0-9]{6,15}$|mailto:[^\s@]+@[^\s@]+$)/

const text = (value: unknown, fallback: string, max: number) =>
  typeof value === "string" && value.trim() ? value.trim().slice(0, max) : fallback
const num = (value: unknown, fallback: number, min: number, max: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback
const list = <T>(value: unknown, parse: (item: Record<string, unknown>) => T | null, max: number): T[] | null =>
  Array.isArray(value) ? value.flatMap((item) => (item && typeof item === "object" ? [parse(item as Record<string, unknown>)] : [])).filter((item): item is T => item !== null).slice(0, max) : null

/** Checks an action's value; `flowIds`/`stepIds` are resolved after every flow is parsed. */
function validValue(kind: ActionKind, value: string | undefined) {
  switch (kind) {
    case "recommend":
      return true
    case "plans":
      return isPlanCategory(value)
    case "lead":
      return isServiceValue(value)
    case "link":
      return LINK.test(value ?? "")
    case "flow":
    case "step":
      return Boolean(value && ID.test(value))
    case "ask":
      return Boolean(value)
  }
}

function parseQuickAction(item: Record<string, unknown>): QuickAction | null {
  const kind = QUICK_ACTION_KINDS.find((k) => k.value === item.kind)?.value
  if (!kind || typeof item.id !== "string" || !ID.test(item.id)) return null
  const label = text(item.label, "", 40)
  if (!label) return null
  const value = typeof item.value === "string" ? item.value.trim().slice(0, 300) : undefined
  if (!validValue(kind, value)) return null
  return { id: item.id, label, kind, ...(kind === "recommend" ? {} : { value }) }
}

function parseStarter(item: Record<string, unknown>): ConversationStarter | null {
  if (typeof item.id !== "string" || !ID.test(item.id)) return null
  const starterText = text(item.text, "", 80)
  if (!starterText) return null
  const ref = (key: string) => (typeof item[key] === "string" && ID.test(item[key] as string) ? { [key]: item[key] as string } : {})
  return { id: item.id, text: starterText, ...(item.flowId ? ref("flowId") : ref("actionId")) }
}

function parseOption(item: Record<string, unknown>): FlowOption | null {
  if (typeof item.id !== "string" || !ID.test(item.id)) return null
  const label = text(item.label, "", 60)
  if (!label) return null
  const size = item.size === 1 || item.size === 2 || item.size === 3 ? item.size : undefined
  const note = typeof item.note === "string" && item.note.trim() ? item.note.trim().slice(0, 300) : undefined
  return { id: item.id, label, ...(isPlanCategory(item.category) ? { category: item.category } : {}), ...(size ? { size } : {}), ...(note ? { note } : {}) }
}

function parseStep(item: Record<string, unknown>): FlowStep | null {
  if (typeof item.id !== "string" || !ID.test(item.id)) return null
  const question = text(item.question, "", 200)
  const options = list(item.options, parseOption, 8)
  if (!question || !options?.length) return null
  return { id: item.id, question, options }
}

function parseFlowOption(item: Record<string, unknown>): FlowStepOption | null {
  const kind = FLOW_OPTION_KINDS.find((k) => k.value === item.kind)?.value
  if (!kind || typeof item.id !== "string" || !ID.test(item.id)) return null
  const label = text(item.label, "", 60)
  const value = typeof item.value === "string" ? item.value.trim().slice(0, 300) : undefined
  if (!label || !validValue(kind, value)) return null
  const response = typeof item.response === "string" && item.response.trim() ? item.response.trim().slice(0, 600) : undefined
  return { id: item.id, label, kind, ...(kind === "recommend" ? {} : { value }), ...(response ? { response } : {}) }
}

function parseFlowNode(item: Record<string, unknown>): FlowStepNode | null {
  if (typeof item.id !== "string" || !ID.test(item.id)) return null
  const message = text(item.message, "", 1500)
  if (!message) return null
  return { id: item.id, message, options: list(item.options, parseFlowOption, 8) ?? [] }
}

function parseFlow(item: Record<string, unknown>): ConversationFlow | null {
  if (typeof item.id !== "string" || !ID.test(item.id)) return null
  const name = text(item.name, "", 60)
  const steps = list(item.steps, parseFlowNode, 15)
  if (!name || !steps?.length) return null
  const triggers = Array.isArray(item.triggers)
    ? [...new Set(item.triggers.filter((t): t is string => typeof t === "string").map((t) => t.trim().toLowerCase().slice(0, 40)).filter(Boolean))].slice(0, 15)
    : []
  return { id: item.id, name, triggers, steps }
}

/** Drops flow options, quick actions and starters that point at flows or steps that don't exist. */
function resolveReferences(flows: ConversationFlow[], quickActions: QuickAction[], starters: ConversationStarter[]) {
  const flowIds = new Set(flows.map((f) => f.id))
  const resolvedFlows = flows.map((flow) => {
    const stepIds = new Set(flow.steps.map((s) => s.id))
    return {
      ...flow,
      steps: flow.steps.map((s) => ({
        ...s,
        options: s.options.filter((o) => (o.kind === "step" ? stepIds.has(o.value ?? "") : o.kind === "flow" ? flowIds.has(o.value ?? "") : true)),
      })),
    }
  })
  const actions = quickActions.filter((a) => a.kind !== "flow" || flowIds.has(a.value ?? ""))
  const actionIds = new Set(actions.map((a) => a.id))
  const resolvedStarters = starters.filter((s) => (s.flowId ? flowIds.has(s.flowId) : s.actionId ? actionIds.has(s.actionId) : true))
  return { flows: resolvedFlows, quickActions: actions, starters: resolvedStarters }
}

// --- Upgrading the first release's defaults --------------------------------------------------
// The first release saved FAQ- and form-style defaults (e.g. "Website Development" opened an
// enquiry straight away). Items that are still exactly those defaults are swapped for today's
// conversational ones when read; anything an admin changed is left alone. The next dashboard save
// stores the upgrade.

const V1_QUICK_ACTIONS: Record<string, string> = {
  "qa-hosting-plans": "Hosting Plans|recommend|",
  "qa-vps": "VPS Hosting|plans|vps",
  "qa-cloud": "Cloud Hosting|plans|cloud",
  "qa-domain": "Domain Registration|ask|domain registration",
  "qa-ssl": "SSL Certificates|ask|SSL certificate",
  "qa-migration": "Website Migration|ask|website migration",
  "qa-development": "Website Development|lead|website-development",
  "qa-maintenance": "Website Maintenance|plans|maintenance",
  "qa-support": "Contact Support|lead|not-sure",
  "qa-quote": "Request a Quote|lead|not-sure",
}
const V1_STARTERS: Record<string, string> = {
  "st-hosting": "Looking for Hosting?|qa-hosting-plans",
  "st-maintenance": "Need Website Maintenance?|qa-maintenance",
  "st-faster": "Need a Faster Website?|",
  "st-business": "Need a Website for Your Business?|qa-development",
  "st-choose": "Need Help Choosing a Hosting Plan?|qa-hosting-plans",
}
type RawStep = { id?: unknown; question?: unknown; options?: { id?: unknown; label?: unknown; category?: unknown; size?: unknown; note?: unknown }[] }
/** Content signature that ignores key order (Postgres jsonb reorders object keys). */
const flowSignature = (steps: RawStep[] | undefined) =>
  (steps ?? []).map((st) => [st.id, st.question, ...(st.options ?? []).map((o) => [o.id, o.label, o.category ?? "", o.size ?? "", o.note ?? ""].join("~"))].join("^")).join("|")
const V1_FLOW_SIGNATURE = flowSignature([
  { id: "websites", question: "How many websites do you want to host?", options: [{ id: "one", label: "1 Website", size: 1 }, { id: "few", label: "2–5 Websites", size: 2 }, { id: "many", label: "More than 5", size: 3 }] },
  { id: "type", question: "What type of website?", options: [{ id: "business", label: "Business Website" }, { id: "blog", label: "Blog", category: "wordpress" }, { id: "ecommerce", label: "Ecommerce", size: 2 }, { id: "portfolio", label: "Portfolio" }, { id: "webapp", label: "Custom Web App", category: "vps" }] },
  { id: "visitors", question: "Expected monthly visitors?", options: [{ id: "small", label: "Under 5,000", size: 1 }, { id: "medium", label: "5,000–25,000", size: 2 }, { id: "large", label: "25,000+", category: "vps" }] },
  { id: "email", question: "Do you need email hosting?", options: [{ id: "yes", label: "Yes", note: "Professional email on your own domain can be added — ask our team about Business or Enterprise Email." }, { id: "no", label: "No" }] },
  { id: "migration", question: "Do you need website migration?", options: [{ id: "yes", label: "Yes", note: "Our team can help move your existing website — mention it when you request a quote." }, { id: "no", label: "No" }] },
])

function upgradeFirstReleaseDefaults(value: Record<string, unknown>): Record<string, unknown> {
  const out = { ...value }
  if (Array.isArray(value.quickActions)) {
    out.quickActions = value.quickActions.map((item) => {
      const a = item as Record<string, unknown>
      const replacement = DEFAULT_QUICK_ACTIONS.find((d) => d.id === a?.id)
      return replacement && V1_QUICK_ACTIONS[String(a.id)] === `${a.label}|${a.kind}|${a.value ?? ""}` ? replacement : item
    })
  }
  if (Array.isArray(value.starters)) {
    out.starters = value.starters.map((item) => {
      const s = item as Record<string, unknown>
      const replacement = DEFAULT_STARTERS.find((d) => d.id === s?.id)
      return replacement && !s.flowId && V1_STARTERS[String(s.id)] === `${s.text}|${s.actionId ?? ""}` ? replacement : item
    })
  }
  const flow = value.flow as { steps?: RawStep[]; fallbackCategory?: unknown } | undefined
  if (flow?.steps && flowSignature(flow.steps) === V1_FLOW_SIGNATURE && (flow.fallbackCategory ?? "shared") === "shared") out.flow = DEFAULT_FLOW
  return out
}

/** Normalises whatever is stored under `settings.chatbot` (or a dashboard submission) onto the defaults. */
export function parseAssistantSettings(raw: unknown): AssistantSettings {
  const d = DEFAULT_ASSISTANT_SETTINGS
  const value = upgradeFirstReleaseDefaults(raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {})
  const flowRaw = value.flow && typeof value.flow === "object" ? (value.flow as Record<string, unknown>) : null
  const steps = flowRaw ? list(flowRaw.steps, parseStep, 10) : null
  const pages = Array.isArray(value.pages)
    ? value.pages.filter((p): p is string => typeof p === "string" && /^\/[A-Za-z0-9/_*.-]*$/.test(p.trim())).map((p) => p.trim()).slice(0, 100)
    : d.pages
  const resolved = resolveReferences(
    list(value.flows, parseFlow, 30) ?? d.flows,
    list(value.quickActions, parseQuickAction, 20) ?? d.quickActions,
    list(value.starters, parseStarter, 10) ?? d.starters
  )

  return {
    enabled: value.enabled === true,
    brandName: text(value.brandName, d.brandName, 60),
    welcomeMessage: text(value.welcomeMessage, d.welcomeMessage, 1000),
    introMessage: text(value.introMessage, d.introMessage, 300),
    avatarUrl: typeof value.avatarUrl === "string" && /^(\/(?!\/)|https:\/\/)/.test(value.avatarUrl.trim()) ? value.avatarUrl.trim().slice(0, 1000) : "",
    position: value.position === "bottom-left" ? "bottom-left" : "bottom-right",
    primaryColor: typeof value.primaryColor === "string" && HEX.test(value.primaryColor) ? value.primaryColor : d.primaryColor,
    secondaryColor: typeof value.secondaryColor === "string" && HEX.test(value.secondaryColor) ? value.secondaryColor : d.secondaryColor,
    typingDelayMs: num(value.typingDelayMs, d.typingDelayMs, 0, 3000),
    autoOpenSeconds: num(value.autoOpenSeconds, d.autoOpenSeconds, 0, 600),
    visibility: value.visibility === "selected" ? "selected" : "all",
    pages,
    quickActions: resolved.quickActions,
    starters: resolved.starters,
    flow: {
      steps: steps ?? d.flow.steps,
      fallbackCategory: flowRaw && isPlanCategory(flowRaw.fallbackCategory) ? flowRaw.fallbackCategory : d.flow.fallbackCategory,
    },
    flows: resolved.flows,
  }
}

export function toPublicConfig(settings: AssistantSettings): PublicAssistantConfig {
  const { brandName, welcomeMessage, introMessage, avatarUrl, position, primaryColor, secondaryColor, typingDelayMs, autoOpenSeconds, visibility, pages, quickActions, starters } = settings
  return { brandName, welcomeMessage, introMessage, avatarUrl, position, primaryColor, secondaryColor, typingDelayMs, autoOpenSeconds, visibility, pages, quickActions, starters }
}

/** Whether `pathname` matches one of the configured patterns ("/vps-hosting/" exact, "/hosting/*" prefix). */
export function pathMatches(pathname: string, patterns: string[]) {
  const path = pathname.replace(/\/+$/, "") || "/"
  return patterns.some((pattern) => {
    const p = pattern.trim()
    if (p.endsWith("*")) {
      const base = p.slice(0, -1).replace(/\/+$/, "")
      // "/hosting/*" matches /hosting and anything under it, but not /hosting-plans.
      return !base || path === base || path.startsWith(`${base}/`)
    }
    return path === (p.replace(/\/+$/, "") || "/")
  })
}

/** White or near-black text, whichever reads better on `hex` (keeps admin colour choices legible). */
export function readableTextOn(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  // Contrast against white (L = 1) vs against #111827 (L ≈ 0.0118).
  return 1.05 / (luminance + 0.05) >= (luminance + 0.05) / 0.0618 ? "#ffffff" : "#111827"
}

import {
  isPlanCategory,
  QUICK_ACTION_KINDS,
  type AssistantSettings,
  type ConversationStarter,
  type FlowOption,
  type FlowStep,
  type PublicAssistantConfig,
  type QuickAction,
  type RecommendationFlow,
} from "./types"

/** `settings` row that holds the assistant's configuration. */
export const ASSISTANT_SETTINGS_KEY = "chatbot"

export const DEFAULT_WELCOME_MESSAGE = `Hi 👋 Welcome to MagicWorks Host.

Looking for fast, secure and high-performance hosting?

I can help you compare hosting plans, recommend the best option for your needs, and connect you with our team for a quote.`

export const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { id: "qa-hosting-plans", label: "Hosting Plans", kind: "recommend" },
  { id: "qa-vps", label: "VPS Hosting", kind: "plans", value: "vps" },
  { id: "qa-cloud", label: "Cloud Hosting", kind: "plans", value: "cloud" },
  { id: "qa-domain", label: "Domain Registration", kind: "ask", value: "domain registration" },
  { id: "qa-ssl", label: "SSL Certificates", kind: "ask", value: "SSL certificate" },
  { id: "qa-migration", label: "Website Migration", kind: "ask", value: "website migration" },
  { id: "qa-development", label: "Website Development", kind: "lead", value: "website-development" },
  { id: "qa-maintenance", label: "Website Maintenance", kind: "plans", value: "maintenance" },
  { id: "qa-support", label: "Contact Support", kind: "lead", value: "not-sure" },
  { id: "qa-quote", label: "Request a Quote", kind: "lead", value: "not-sure" },
]

export const DEFAULT_STARTERS: ConversationStarter[] = [
  { id: "st-hosting", text: "Looking for Hosting?", actionId: "qa-hosting-plans" },
  { id: "st-maintenance", text: "Need Website Maintenance?", actionId: "qa-maintenance" },
  { id: "st-faster", text: "Need a Faster Website?" },
  { id: "st-business", text: "Need a Website for Your Business?", actionId: "qa-development" },
  { id: "st-choose", text: "Need Help Choosing a Hosting Plan?", actionId: "qa-hosting-plans" },
]

export const DEFAULT_FLOW: RecommendationFlow = {
  fallbackCategory: "shared",
  steps: [
    {
      id: "websites",
      question: "How many websites do you want to host?",
      options: [
        { id: "one", label: "1 Website", size: 1 },
        { id: "few", label: "2–5 Websites", size: 2 },
        { id: "many", label: "More than 5", size: 3 },
      ],
    },
    {
      id: "type",
      question: "What type of website?",
      options: [
        { id: "business", label: "Business Website" },
        { id: "blog", label: "Blog", category: "wordpress" },
        { id: "ecommerce", label: "Ecommerce", size: 2 },
        { id: "portfolio", label: "Portfolio" },
        { id: "webapp", label: "Custom Web App", category: "vps" },
      ],
    },
    {
      id: "visitors",
      question: "Expected monthly visitors?",
      options: [
        { id: "small", label: "Under 5,000", size: 1 },
        { id: "medium", label: "5,000–25,000", size: 2 },
        { id: "large", label: "25,000+", category: "vps" },
      ],
    },
    {
      id: "email",
      question: "Do you need email hosting?",
      options: [
        { id: "yes", label: "Yes", note: "Professional email on your own domain can be added — ask our team about Business or Enterprise Email." },
        { id: "no", label: "No" },
      ],
    },
    {
      id: "migration",
      question: "Do you need website migration?",
      options: [
        { id: "yes", label: "Yes", note: "Our team can help move your existing website — mention it when you request a quote." },
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
  typingDelayMs: 600,
  autoOpenSeconds: 0,
  visibility: "all",
  pages: [],
  quickActions: DEFAULT_QUICK_ACTIONS,
  starters: DEFAULT_STARTERS,
  flow: DEFAULT_FLOW,
}

const HEX = /^#[0-9a-f]{6}$/i
const ID = /^[a-z0-9-]{1,40}$/i

const text = (value: unknown, fallback: string, max: number) =>
  typeof value === "string" && value.trim() ? value.trim().slice(0, max) : fallback
const num = (value: unknown, fallback: number, min: number, max: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback
const list = <T>(value: unknown, parse: (item: Record<string, unknown>) => T | null, max: number): T[] | null =>
  Array.isArray(value) ? value.flatMap((item) => (item && typeof item === "object" ? [parse(item as Record<string, unknown>)] : [])).filter((item): item is T => item !== null).slice(0, max) : null

function parseQuickAction(item: Record<string, unknown>): QuickAction | null {
  const kind = QUICK_ACTION_KINDS.find((k) => k.value === item.kind)?.value
  if (!kind || typeof item.id !== "string" || !ID.test(item.id)) return null
  const label = text(item.label, "", 40)
  if (!label) return null
  const value = typeof item.value === "string" ? item.value.trim().slice(0, 300) : undefined
  if (kind !== "recommend" && !value) return null
  if (kind === "plans" && !isPlanCategory(value)) return null
  if (kind === "link" && !/^(\/(?!\/)|https:\/\/)/.test(value ?? "")) return null
  return { id: item.id, label, kind, ...(kind === "recommend" ? {} : { value }) }
}

function parseStarter(item: Record<string, unknown>): ConversationStarter | null {
  if (typeof item.id !== "string" || !ID.test(item.id)) return null
  const starterText = text(item.text, "", 80)
  if (!starterText) return null
  return { id: item.id, text: starterText, ...(typeof item.actionId === "string" && item.actionId ? { actionId: item.actionId } : {}) }
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

/** Normalises whatever is stored under `settings.chatbot` (or a dashboard submission) onto the defaults. */
export function parseAssistantSettings(raw: unknown): AssistantSettings {
  const d = DEFAULT_ASSISTANT_SETTINGS
  const value = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {}
  const flowRaw = value.flow && typeof value.flow === "object" ? (value.flow as Record<string, unknown>) : null
  const steps = flowRaw ? list(flowRaw.steps, parseStep, 10) : null
  const pages = Array.isArray(value.pages)
    ? value.pages.filter((p): p is string => typeof p === "string" && /^\/[A-Za-z0-9/_*.-]*$/.test(p.trim())).map((p) => p.trim()).slice(0, 100)
    : d.pages

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
    quickActions: list(value.quickActions, parseQuickAction, 20) ?? d.quickActions,
    starters: list(value.starters, parseStarter, 10) ?? d.starters,
    flow: {
      steps: steps ?? d.flow.steps,
      fallbackCategory: flowRaw && isPlanCategory(flowRaw.fallbackCategory) ? flowRaw.fallbackCategory : d.flow.fallbackCategory,
    },
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

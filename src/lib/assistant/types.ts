/**
 * Shared types for the MW Host Hosting Assistant (website widget + Admin → Hosting Assistant).
 * Client-safe: no server imports. Keep imports in src/lib/assistant relative so the engine can
 * be exercised outside Next (see engine.ts).
 */

export const PLAN_CATEGORIES = [
  { value: "shared", label: "Shared Hosting", service: "shared-hosting", page: "/web-hosting-cart/" },
  { value: "wordpress", label: "WordPress Hosting", service: "wordpress-hosting", page: "/wordpress-hosting/" },
  { value: "vps", label: "VPS Hosting", service: "vps-hosting", page: "/vps-hosting/" },
  { value: "cloud", label: "Cloud Hosting", service: "cloud-hosting", page: "/cloud-hosting/" },
  { value: "maintenance", label: "Maintenance Plans", service: "website-maintenance", page: "/website-maintenance/" },
] as const

export type PlanCategory = (typeof PLAN_CATEGORIES)[number]["value"]

export function isPlanCategory(value: unknown): value is PlanCategory {
  return PLAN_CATEGORIES.some((category) => category.value === value)
}

export function planCategoryLabel(value: PlanCategory) {
  return PLAN_CATEGORIES.find((category) => category.value === value)?.label ?? value
}

/** What a button does: shared by quick actions and conversation-flow options. */
export type ActionKind = "flow" | "step" | "recommend" | "plans" | "ask" | "lead" | "link"

/** Quick actions can do everything except jump to a step (steps belong to a flow). */
export type QuickActionKind = Exclude<ActionKind, "step">

export const QUICK_ACTION_KINDS: { value: QuickActionKind; label: string }[] = [
  { value: "flow", label: "Start a conversation flow" },
  { value: "recommend", label: "Start the plan recommendation" },
  { value: "plans", label: "Show plans in a category" },
  { value: "ask", label: "Answer a question (FAQ search)" },
  { value: "lead", label: "Connect with the team (asks name, email, phone)" },
  { value: "link", label: "Open a page" },
]

export const FLOW_OPTION_KINDS: { value: ActionKind; label: string }[] = [
  { value: "step", label: "Go to a step in this flow" },
  ...QUICK_ACTION_KINDS,
]

export type QuickAction = { id: string; label: string; kind: QuickActionKind; value?: string }

/** A suggested opening line. It runs a quick action or a flow, or is answered like a typed question. */
export type ConversationStarter = { id: string; text: string; actionId?: string; flowId?: string }

// --- Conversation flows (dashboard-managed) --------------------------------------------------

export type FlowStepOption = {
  id: string
  label: string
  kind: ActionKind
  /** Step id (step), flow id (flow), category (plans), question (ask), service (lead), URL (link). */
  value?: string
  /** Optional reply shown when the option is chosen, before the action runs. */
  response?: string
}

export type FlowStepNode = {
  id: string
  /** Supports **bold**, "• " bullet lines and line breaks. */
  message: string
  options: FlowStepOption[]
}

export type ConversationFlow = {
  id: string
  name: string
  /** Words or phrases that start this flow when typed (e.g. "slow", "speed up"). */
  triggers: string[]
  /** The first step is where the flow starts. */
  steps: FlowStepNode[]
}

// --- Plan recommendation flow ----------------------------------------------------------------

export type FlowOption = {
  id: string
  label: string
  /** Points the recommendation at this plan category (the "largest" chosen category wins). */
  category?: PlanCategory
  /** 1 = entry, 2 = mid, 3 = top tier within the category (the largest chosen size wins). */
  size?: 1 | 2 | 3
  /** Shown with the recommendation when this answer is chosen. */
  note?: string
}

export type FlowStep = { id: string; question: string; options: FlowOption[] }

export type RecommendationFlow = {
  steps: FlowStep[]
  /** Used when no answer names a category. */
  fallbackCategory: PlanCategory
}

export type AssistantSettings = {
  enabled: boolean
  brandName: string
  welcomeMessage: string
  introMessage: string
  avatarUrl: string
  position: "bottom-right" | "bottom-left"
  primaryColor: string
  secondaryColor: string
  /** Pause before each assistant reply, in milliseconds (the typing indicator shows meanwhile). */
  typingDelayMs: number
  /** Opens the chat by itself after this many seconds on a page; 0 = never. */
  autoOpenSeconds: number
  visibility: "all" | "selected"
  /** Path patterns for `visibility: "selected"`, e.g. "/vps-hosting/" or "/hosting/*". */
  pages: string[]
  quickActions: QuickAction[]
  starters: ConversationStarter[]
  flow: RecommendationFlow
  flows: ConversationFlow[]
}

/** The subset of settings the website widget needs (no admin-only data). */
export type PublicAssistantConfig = Omit<AssistantSettings, "enabled" | "flow" | "flows">

export type AssistantPlan = {
  id: string
  name: string
  category: PlanCategory
  currency: "INR" | "USD"
  monthlyPrice: number | null
  yearlyPrice: number | null
  features: string[]
  isPopular: boolean
  ctaUrl: string | null
  sortOrder: number
  isActive: boolean
}

export type AssistantFaq = {
  id: string
  question: string
  answer: string
  category: string
  keywords: string[]
  status: "published" | "draft"
}

/** A plan as sent to the widget. */
export type PlanCard = Pick<AssistantPlan, "id" | "name" | "category" | "currency" | "monthlyPrice" | "yearlyPrice" | "features" | "isPopular" | "ctaUrl"> & {
  categoryLabel: string
}

// --- Conversation state ----------------------------------------------------------------------

export type CaptureStep = "name" | "email" | "phone" | "requirement" | "verify"

/** Conversational lead capture in progress (the chat asks one detail at a time; no forms). */
export type LeadCapture = {
  step: CaptureStep
  service: string
  /** What the visitor was looking at when they asked for the team (e.g. "VPS Hosting › Talk to an expert"). */
  context?: string
  name?: string
  email?: string
  phone?: string
  requirement?: string
}

/** Small state the widget echoes back with each request, so the server stays stateless. */
export type ConversationState = {
  capture?: LeadCapture
  /** Consecutive questions the assistant couldn't place; the second one offers the team. */
  misses?: number
}

/** A button in a reply: clicking it sends `event` with `label` as the visitor's message. */
export type ReplyButton = { label: string; event: AssistantEvent; href?: never } | { label: string; href: string; event?: never }

/** One piece of an assistant reply, rendered by the widget. */
export type ReplyBlock =
  | { type: "text"; text: string }
  | { type: "buttons"; buttons: ReplyButton[]; title?: string }
  | { type: "plans"; plans: PlanCard[] }
  | { type: "suggestions"; faqs: { id: string; question: string }[] }
  | { type: "link"; label: string; href: string }
  /** Ask the widget to run the Cloudflare check (only when Turnstile is configured), then confirm. */
  | { type: "verify" }

/** What the visitor did. */
export type AssistantEvent =
  | { type: "message"; text: string }
  | { type: "quick_action"; actionId: string }
  | { type: "starter"; starterId: string }
  | { type: "faq"; faqId: string }
  | { type: "flow_answer"; answers: Record<string, string> }
  | { type: "flow_start"; flowId: string }
  | { type: "flow_option"; flowId: string; stepId: string; optionId: string; trail?: string[] }
  | { type: "show_plans"; category: PlanCategory }
  | { type: "lead_start"; service: string; context?: string }
  | { type: "lead_confirm"; turnstileToken?: string | null }

export type AssistantRequest = {
  visitorId: string
  conversationId?: string | null
  event: AssistantEvent
  state?: ConversationState
  pageUrl?: string
}

export type AssistantResponse = {
  conversationId: string | null
  replies: ReplyBlock[]
  state?: ConversationState
  /** True when this reply confirms an enquiry was delivered to the team. */
  leadSent?: boolean
  error?: string
}

/** A message to store for the transcript and analytics. */
export type LoggedMessage = {
  role: "visitor" | "assistant"
  kind: string
  body: string
  metadata?: Record<string, unknown>
}

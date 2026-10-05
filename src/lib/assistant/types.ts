/**
 * Shared types for the MW Host Hosting Assistant (website widget + Admin → Hosting Assistant).
 * Client-safe: no server imports. Keep imports in src/lib/assistant relative so the engine can
 * be exercised outside Next (see engine.ts).
 */

export const PLAN_CATEGORIES = [
  { value: "shared", label: "Shared Hosting", service: "shared-hosting" },
  { value: "wordpress", label: "WordPress Hosting", service: "wordpress-hosting" },
  { value: "vps", label: "VPS Hosting", service: "vps-hosting" },
  { value: "cloud", label: "Cloud Hosting", service: "cloud-hosting" },
  { value: "maintenance", label: "Maintenance Plans", service: "website-maintenance" },
] as const

export type PlanCategory = (typeof PLAN_CATEGORIES)[number]["value"]

export function isPlanCategory(value: unknown): value is PlanCategory {
  return PLAN_CATEGORIES.some((category) => category.value === value)
}

export function planCategoryLabel(value: PlanCategory) {
  return PLAN_CATEGORIES.find((category) => category.value === value)?.label ?? value
}

/** What a quick-action chip does when clicked. */
export type QuickActionKind = "recommend" | "plans" | "ask" | "lead" | "link"

export const QUICK_ACTION_KINDS: { value: QuickActionKind; label: string; valueLabel?: string }[] = [
  { value: "recommend", label: "Start the plan recommendation" },
  { value: "plans", label: "Show plans in a category", valueLabel: "Plan category" },
  { value: "ask", label: "Answer a question (FAQ search)", valueLabel: "Question to search for" },
  { value: "lead", label: "Open the enquiry form", valueLabel: "Service (lead form)" },
  { value: "link", label: "Open a page", valueLabel: "URL" },
]

export type QuickAction = { id: string; label: string; kind: QuickActionKind; value?: string }

/** A suggested opening line. With `actionId` it runs that quick action; otherwise it's sent as a question. */
export type ConversationStarter = { id: string; text: string; actionId?: string }

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
}

/** The subset of settings the website widget needs (no admin-only data). */
export type PublicAssistantConfig = Omit<AssistantSettings, "enabled" | "flow">

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

/** One piece of an assistant reply, rendered by the widget. */
export type ReplyBlock =
  | { type: "text"; text: string }
  | { type: "options"; stepId: string; options: { id: string; label: string }[] }
  | { type: "plans"; plans: PlanCard[] }
  | { type: "suggestions"; faqs: { id: string; question: string }[] }
  | { type: "lead_form"; service: string; requirement?: string }
  | { type: "link"; label: string; href: string }

/** What the visitor did. Flow answers carry every answer so far, so the server stays stateless. */
export type AssistantEvent =
  | { type: "message"; text: string }
  | { type: "quick_action"; actionId: string }
  | { type: "starter"; starterId: string }
  | { type: "faq"; faqId: string }
  | { type: "flow_answer"; answers: Record<string, string> }

export type AssistantRequest = {
  visitorId: string
  conversationId?: string | null
  event: AssistantEvent
  pageUrl?: string
}

export type AssistantResponse = {
  conversationId: string | null
  replies: ReplyBlock[]
  /** The flow answers to send back with the next step (present while a recommendation is in progress). */
  flowAnswers?: Record<string, string>
  error?: string
}

/** A message to store for the transcript and analytics. */
export type LoggedMessage = {
  role: "visitor" | "assistant"
  kind: string
  body: string
  metadata?: Record<string, unknown>
}

import type { ConversationState, ReplyBlock } from "@/lib/assistant/types"

export type ChatMessage =
  | { id: string; role: "visitor"; text: string; at: number }
  | { id: string; role: "assistant"; blocks: ReplyBlock[]; at: number }

export type ChatSession = {
  conversationId: string | null
  /** The state the server returned last time (lead capture progress, etc.), echoed with the next request. */
  state: ConversationState | null
  messages: ChatMessage[]
}

const VISITOR_KEY = "mwh:assistant-visitor"
const MAX_STORED_MESSAGES = 80

export const emptySession = (): ChatSession => ({ conversationId: null, state: null, messages: [] })

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID().replace(/-/g, "") : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`

/** Random, anonymous id kept in this browser so a returning visitor's chats group together. */
export function getVisitorId() {
  try {
    const existing = window.localStorage.getItem(VISITOR_KEY)
    if (existing && /^[A-Za-z0-9_-]{8,64}$/.test(existing)) return existing
    const id = `v${newId()}`.slice(0, 40)
    window.localStorage.setItem(VISITOR_KEY, id)
    return id
  } catch {
    return `v${newId()}`.slice(0, 40)
  }
}

/** The current chat survives page loads for this browser session (sessionStorage). */
export function loadSession(storageKey: string): ChatSession {
  try {
    const raw = window.sessionStorage.getItem(storageKey)
    if (!raw) return emptySession()
    const parsed = JSON.parse(raw) as Partial<ChatSession>
    return {
      conversationId: typeof parsed.conversationId === "string" ? parsed.conversationId : null,
      state: parsed.state && typeof parsed.state === "object" ? parsed.state : null,
      messages: Array.isArray(parsed.messages) ? parsed.messages.slice(-MAX_STORED_MESSAGES) : [],
    }
  } catch {
    return emptySession()
  }
}

export function saveSession(storageKey: string, session: ChatSession) {
  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify({ ...session, messages: session.messages.slice(-MAX_STORED_MESSAGES) }))
  } catch {
    // Storage blocked or full — the chat still works for this page view.
  }
}

export function clearSession(storageKey: string) {
  try {
    window.sessionStorage.removeItem(storageKey)
  } catch {
    // ignore
  }
}

export function formatTime(at: number) {
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(new Date(at))
}

export function formatPrice(value: number | null, currency: "INR" | "USD") {
  if (value === null) return null
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", { style: "currency", currency, maximumFractionDigits: value % 1 ? 2 : 0 }).format(value)
}

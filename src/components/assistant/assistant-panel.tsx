"use client"

import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { ArrowUpRight, Bot, Minus, RotateCcw, SendHorizontal, Sparkles } from "lucide-react"

import { TurnstileWidget, turnstileEnabled } from "@/components/forms/turnstile-widget"
import type { AssistantEvent, AssistantResponse, ConversationState, PublicAssistantConfig, ReplyBlock, ReplyButton } from "@/lib/assistant/types"
import { cn } from "@/lib/utils"

import { clearSession, emptySession, formatPrice, formatTime, loadSession, newId, saveSession, type ChatMessage, type ChatSession } from "./session"

export type AssistantTransport = {
  send: (request: { event: AssistantEvent; conversationId: string | null; state: ConversationState | null }) => Promise<AssistantResponse>
  /** Called after an enquiry is sent (analytics, suppressing the lead pop-up). */
  onLeadSent?: () => void
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** **bold** inline. Text only — never HTML. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={index} className="font-semibold text-slate-900">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    )
  )
}

/** Paragraphs, "• " / "- " bullet lists and **bold** — the rich text the dashboard flows use. */
export function RichText({ text }: { text: string }) {
  const blocks: ReactNode[] = []
  let bullets: string[] = []
  let paragraph: string[] = []
  const flushParagraph = () => {
    if (paragraph.length) blocks.push(<p key={`p${blocks.length}`}>{inline(paragraph.join("\n"))}</p>)
    paragraph = []
  }
  const flushBullets = () => {
    if (bullets.length) {
      blocks.push(
        <ul key={`u${blocks.length}`} className="space-y-1">
          {bullets.map((item, index) => (
            <li key={index} className="flex gap-2">
              <span className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-[var(--aw-secondary)]" aria-hidden />
              <span>{inline(item)}</span>
            </li>
          ))}
        </ul>
      )
    }
    bullets = []
  }
  for (const line of text.split("\n")) {
    const bullet = /^\s*(?:•|-|\*)\s+(.*)$/.exec(line)
    if (bullet) {
      flushParagraph()
      bullets.push(bullet[1])
    } else if (!line.trim()) {
      flushParagraph()
      flushBullets()
    } else {
      flushBullets()
      paragraph.push(line)
    }
  }
  flushParagraph()
  flushBullets()
  return <div className="space-y-2">{blocks}</div>
}

function Avatar({ config, size = "size-8" }: { config: PublicAssistantConfig; size?: string }) {
  return config.avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element -- dashboard-managed URL of any size/host
    <img src={config.avatarUrl} alt="" className={cn(size, "shrink-0 rounded-full bg-white object-cover")} />
  ) : (
    <span className={cn(size, "flex shrink-0 items-center justify-center rounded-full bg-[var(--aw-secondary)] text-[var(--aw-on-secondary)]")}>
      <Bot className="size-[60%]" aria-hidden />
    </span>
  )
}

const bubble = "rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-[13.5px] leading-relaxed text-slate-700 shadow-sm ring-1 ring-slate-200/70"

/** What the input asks for while the assistant is collecting contact details. */
const CAPTURE_INPUT: Record<string, { placeholder: string; type: string; inputMode?: "email" | "tel" | "text"; autoComplete: string }> = {
  name: { placeholder: "Type your name…", type: "text", inputMode: "text", autoComplete: "name" },
  email: { placeholder: "Type your email address…", type: "email", inputMode: "email", autoComplete: "email" },
  phone: { placeholder: "Type your phone number…", type: "tel", inputMode: "tel", autoComplete: "tel" },
  requirement: { placeholder: "Tell us what you need…", type: "text", inputMode: "text", autoComplete: "off" },
}

/**
 * The Hosting Assistant chat. Used by the website launcher (fetch transport) and the dashboard
 * preview (server-action transport), so the preview is the real widget. Everything happens in
 * the conversation: replies are text, plan cards and buttons — there are no forms.
 */
export function AssistantPanel({
  config,
  transport,
  storageKey,
  onMinimize,
  embedded = false,
  active = true,
}: {
  config: PublicAssistantConfig
  transport: AssistantTransport
  storageKey: string
  onMinimize?: () => void
  /** Render inline (dashboard preview) instead of as a floating window. */
  embedded?: boolean
  /** Whether the panel is visible (focus the input when it opens). */
  active?: boolean
}) {
  const [session, setSession] = useState<ChatSession>(emptySession)
  const [loaded, setLoaded] = useState(false)
  const [pending, setPending] = useState(false)
  const [draft, setDraft] = useState("")
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const sessionRef = useRef(session)

  useEffect(() => {
    sessionRef.current = session
  }, [session])

  // Restore this tab's chat (sessionStorage) after mount — never during SSR.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from browser storage
    setSession(loadSession(storageKey))
    setLoaded(true)
  }, [storageKey])

  useEffect(() => {
    if (loaded) saveSession(storageKey, session)
  }, [loaded, session, storageKey])

  // Keep the newest message in view.
  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: "smooth" })
  }, [session.messages.length, pending])

  useEffect(() => {
    if (active && !embedded) inputRef.current?.focus({ preventScroll: true })
  }, [active, embedded])

  const send = useCallback(
    async (event: AssistantEvent, visitorText: string | null) => {
      if (pending) return
      const startedAt = Date.now()
      if (visitorText) setSession((s) => ({ ...s, messages: [...s.messages, { id: newId(), role: "visitor", text: visitorText, at: startedAt }] }))
      setPending(true)
      let blocks: ReplyBlock[]
      let next: Partial<ChatSession> = {}
      try {
        const current = sessionRef.current
        const response = await transport.send({ event, conversationId: current.conversationId, state: current.state })
        blocks = response.error ? [{ type: "text", text: response.error }] : response.replies
        next = response.error ? {} : { conversationId: response.conversationId ?? current.conversationId, state: response.state ?? null }
        if (response.leadSent) transport.onLeadSent?.()
      } catch {
        blocks = [{ type: "text", text: "Sorry, I couldn't reach our server. Please check your connection and try again." }]
      }
      // The typing indicator stays up for at least the configured delay, so replies don't flash in.
      const remaining = config.typingDelayMs - (Date.now() - startedAt)
      if (remaining > 0) await wait(remaining)
      if (blocks.length) setSession((s) => ({ ...s, ...next, messages: [...s.messages, { id: newId(), role: "assistant", blocks, at: Date.now() }] }))
      else setSession((s) => ({ ...s, ...next }))
      setPending(false)
      if (!embedded) inputRef.current?.focus({ preventScroll: true })
    },
    [config.typingDelayMs, embedded, pending, transport]
  )

  function submitText(event: React.FormEvent) {
    event.preventDefault()
    const text = draft.trim().slice(0, 500)
    if (!text) return
    setDraft("")
    void send({ type: "message", text }, text)
  }

  function restart() {
    clearSession(storageKey)
    setSession(emptySession())
  }

  const lastMessage = session.messages.at(-1)
  const capture = session.state?.capture
  const inputMode = capture ? CAPTURE_INPUT[capture.step] : undefined

  function renderButton(button: ReplyButton, live: boolean, key: string) {
    const className =
      "inline-flex items-center gap-1 rounded-full border border-[var(--aw-primary)]/25 bg-white px-3 py-1.5 text-left text-[12.5px] font-medium text-[var(--aw-primary)] transition-colors hover:border-[var(--aw-primary)] hover:bg-[var(--aw-primary)] hover:text-[var(--aw-on-primary)] disabled:cursor-default disabled:opacity-45 disabled:hover:border-[var(--aw-primary)]/25 disabled:hover:bg-white disabled:hover:text-[var(--aw-primary)]"
    if (button.href) {
      const external = /^https?:/.test(button.href)
      return (
        <a key={key} href={button.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={className}>
          {button.label}
          <ArrowUpRight className="size-3.5" aria-hidden />
        </a>
      )
    }
    return (
      <button key={key} type="button" disabled={!live} onClick={() => button.event && void send(button.event, button.label)} className={className}>
        {button.label}
      </button>
    )
  }

  function renderBlock(block: ReplyBlock, message: ChatMessage, index: number): ReactNode {
    const key = `${message.id}-${index}`
    const live = message.id === lastMessage?.id && !pending
    switch (block.type) {
      case "text":
        return (
          <div key={key} className={bubble}>
            <RichText text={block.text} />
          </div>
        )
      case "buttons":
        return (
          <div key={key} className="flex flex-col gap-1.5">
            {block.title ? <p className="text-[11.5px] font-medium text-slate-500">{block.title}</p> : null}
            <div className="flex flex-wrap gap-1.5" role="group" aria-label={block.title ?? "Options"}>
              {block.buttons.map((button, i) => renderButton(button, live, `${key}-${i}`))}
            </div>
          </div>
        )
      case "plans":
        return (
          <div key={key} className="flex flex-col gap-2">
            {block.plans.map((plan) => {
              const monthly = formatPrice(plan.monthlyPrice, plan.currency)
              const yearly = formatPrice(plan.yearlyPrice, plan.currency)
              const external = plan.ctaUrl?.startsWith("http")
              return (
                <div key={plan.id} className={cn("rounded-xl bg-white p-3.5 shadow-sm ring-1", plan.isPopular ? "ring-2 ring-[var(--aw-secondary)]" : "ring-slate-200")}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">{plan.categoryLabel}</p>
                      <p className="text-[15px] font-semibold text-slate-900">{plan.name}</p>
                    </div>
                    {plan.isPopular ? (
                      <span className="shrink-0 rounded-full bg-[var(--aw-secondary)] px-2 py-0.5 text-[10.5px] font-semibold text-[var(--aw-on-secondary)]">Popular</span>
                    ) : null}
                  </div>
                  {monthly || yearly ? (
                    <p className="mt-1.5 text-[13px] text-slate-600">
                      {monthly ? (
                        <>
                          <span className="text-lg font-bold text-slate-900">{monthly}</span>/mo
                        </>
                      ) : null}
                      {monthly && yearly ? <span className="mx-1.5 text-slate-300">|</span> : null}
                      {yearly ? (
                        <>
                          <span className={monthly ? "font-semibold text-slate-900" : "text-lg font-bold text-slate-900"}>{yearly}</span>/yr
                        </>
                      ) : null}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-[13px] text-slate-600">Pricing on request</p>
                  )}
                  {plan.features.length ? (
                    <ul className="mt-2 space-y-0.5 text-[12.5px] text-slate-600">
                      {plan.features.slice(0, 5).map((feature) => (
                        <li key={feature} className="flex gap-1.5">
                          <span className="text-emerald-600" aria-hidden>
                            ✓
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {plan.ctaUrl ? (
                    <a
                      href={plan.ctaUrl}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="mt-2.5 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-[var(--aw-primary)] px-3 py-2 text-[12.5px] font-semibold text-[var(--aw-on-primary)] hover:opacity-90"
                    >
                      Choose {plan.name}
                      <ArrowUpRight className="size-3.5" aria-hidden />
                    </a>
                  ) : null}
                </div>
              )
            })}
          </div>
        )
      case "suggestions":
        return (
          <div key={key} className="flex flex-col gap-1">
            <p className="text-[11.5px] font-medium text-slate-500">Related questions</p>
            {block.faqs.map((faq) => (
              <button
                key={faq.id}
                type="button"
                disabled={!live}
                onClick={() => void send({ type: "faq", faqId: faq.id }, faq.question)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left text-[12.5px] text-[var(--aw-primary)] hover:border-[var(--aw-primary)]/40 disabled:opacity-50"
              >
                {faq.question}
              </button>
            ))}
          </div>
        )
      case "link":
        return (
          <a key={key} href={block.href} className="inline-flex w-fit items-center gap-1 rounded-lg bg-[var(--aw-primary)] px-3 py-1.5 text-[12.5px] font-semibold text-[var(--aw-on-primary)] hover:opacity-90">
            {block.label}
            <ArrowUpRight className="size-3.5" aria-hidden />
          </a>
        )
      case "verify":
        // Cloudflare's check (only sent when Turnstile is configured): passes automatically for most visitors.
        return live ? (
          <div key={key} className="w-fit">
            {turnstileEnabled ? (
              <TurnstileWidget onToken={(token) => token && void send({ type: "lead_confirm", turnstileToken: token }, null)} />
            ) : (
              renderButton({ label: "Send my details", event: { type: "lead_confirm" } }, live, `${key}-b`)
            )}
          </div>
        ) : null
      default:
        // Blocks from an older widget version (kept in a visitor's session) are skipped.
        return null
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden bg-slate-50 font-sans text-slate-900",
        embedded ? "h-full rounded-xl border border-slate-200" : "h-full rounded-2xl shadow-2xl ring-1 ring-black/10"
      )}
    >
      <div className="flex items-center gap-2.5 bg-[var(--aw-primary)] px-3.5 py-3 text-[var(--aw-on-primary)]">
        <Avatar config={config} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{config.brandName}</p>
          <p className="flex items-center gap-1 text-[11.5px] opacity-80">
            <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden />
            Online · replies instantly
          </p>
        </div>
        <button type="button" onClick={restart} className="rounded-md p-1.5 opacity-80 hover:bg-white/10 hover:opacity-100" aria-label="Start a new chat" title="Start a new chat">
          <RotateCcw className="size-4" aria-hidden />
        </button>
        {onMinimize ? (
          <button type="button" onClick={onMinimize} className="rounded-md p-1.5 opacity-80 hover:bg-white/10 hover:opacity-100" aria-label="Minimize chat" title="Minimize">
            <Minus className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>

      <div ref={listRef} className="flex-1 space-y-3.5 overflow-y-auto overscroll-contain px-3.5 py-4" role="log" aria-live="polite" aria-label="Conversation">
        <div className="flex gap-2">
          <Avatar config={config} size="size-7" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className={bubble}>
              <RichText text={config.welcomeMessage} />
            </div>
            {config.introMessage ? <p className="px-1 text-[12.5px] text-slate-600">{config.introMessage}</p> : null}
            {config.starters.length ? (
              <div className="flex flex-col items-start gap-1.5">
                {config.starters.map((starter) => (
                  <button
                    key={starter.id}
                    type="button"
                    disabled={pending}
                    onClick={() => void send({ type: "starter", starterId: starter.id }, starter.text)}
                    className="rounded-full border border-[var(--aw-secondary)] bg-white px-3 py-1.5 text-left text-[12.5px] font-medium text-slate-800 transition-colors hover:bg-[var(--aw-secondary)] hover:text-[var(--aw-on-secondary)] disabled:opacity-60"
                  >
                    {starter.text}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {session.messages.map((message) =>
          message.role === "visitor" ? (
            <div key={message.id} className="flex flex-col items-end">
              <p className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[var(--aw-primary)] px-3.5 py-2 text-[13.5px] leading-relaxed whitespace-pre-line text-[var(--aw-on-primary)]">
                {message.text}
              </p>
              <time className="mt-0.5 text-[10.5px] text-slate-500" dateTime={new Date(message.at).toISOString()}>
                {formatTime(message.at)}
              </time>
            </div>
          ) : (
            <div key={message.id} className="flex gap-2">
              <Avatar config={config} size="size-7" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                {message.blocks.map((block, index) => renderBlock(block, message, index))}
                <time className="text-[10.5px] text-slate-500" dateTime={new Date(message.at).toISOString()}>
                  {formatTime(message.at)}
                </time>
              </div>
            </div>
          )
        )}

        {pending ? (
          <div className="flex items-center gap-2" aria-label={`${config.brandName} is typing`}>
            <Avatar config={config} size="size-7" />
            <span className="flex gap-1 rounded-2xl rounded-tl-sm bg-white px-3 py-3 shadow-sm ring-1 ring-slate-200/70">
              {[0, 150, 300].map((delay) => (
                <span key={delay} className="size-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${delay}ms` }} />
              ))}
            </span>
          </div>
        ) : null}
      </div>

      {config.quickActions.length && !capture ? (
        <div className="flex gap-1.5 overflow-x-auto border-t border-slate-200 bg-white px-3 py-2 [scrollbar-width:thin]" role="group" aria-label="Quick actions">
          <Sparkles className="mt-1.5 size-3.5 shrink-0 text-[var(--aw-secondary)]" aria-hidden />
          {config.quickActions.map((action) => (
            <button
              key={action.id}
              type="button"
              disabled={pending}
              onClick={() => void send({ type: "quick_action", actionId: action.id }, action.label)}
              className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-medium whitespace-nowrap text-slate-700 transition-colors hover:bg-[var(--aw-primary)] hover:text-[var(--aw-on-primary)] disabled:opacity-60"
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
      {capture ? (
        <p className="border-t border-slate-200 bg-white px-3.5 pt-2 text-[11.5px] text-slate-500">
          Sharing your details with our team · type <span className="font-medium">cancel</span> to stop
        </p>
      ) : null}

      {/* noValidate: the assistant checks answers in the conversation, never with browser pop-ups. */}
      <form onSubmit={submitText} noValidate className={cn("flex items-center gap-2 bg-white p-2.5", capture ? "" : "border-t border-slate-200")} aria-label="Message the assistant">
        <label htmlFor={`${storageKey}-input`} className="sr-only">
          {inputMode?.placeholder ?? "Type your question"}
        </label>
        <input
          ref={inputRef}
          id={`${storageKey}-input`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={500}
          type={inputMode?.type ?? "text"}
          inputMode={inputMode?.inputMode}
          autoComplete={inputMode?.autoComplete ?? "off"}
          placeholder={inputMode?.placeholder ?? "Ask about hosting, domains, SSL…"}
          className="min-w-0 flex-1 rounded-full border border-slate-300 bg-slate-50 px-3.5 py-2 text-[13.5px] text-slate-900 outline-none placeholder:text-slate-500 focus-visible:border-[var(--aw-primary)] focus-visible:ring-2 focus-visible:ring-[var(--aw-primary)]/25"
        />
        <button
          type="submit"
          disabled={pending || !draft.trim()}
          aria-label="Send"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--aw-primary)] text-[var(--aw-on-primary)] transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <SendHorizontal className="size-4" aria-hidden />
        </button>
      </form>
    </div>
  )
}

"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowUpRight, Bot, Minus, RotateCcw, SendHorizontal, Sparkles } from "lucide-react"

import type { AssistantEvent, AssistantResponse, PublicAssistantConfig, ReplyBlock } from "@/lib/assistant/types"
import { cn } from "@/lib/utils"

import { AssistantLeadForm, type LeadSubmitter } from "./assistant-lead-form"
import { clearSession, emptySession, formatPrice, formatTime, loadSession, newId, saveSession, type ChatMessage, type ChatSession } from "./session"

export type AssistantTransport = {
  send: (request: { event: AssistantEvent; conversationId: string | null }) => Promise<AssistantResponse>
  submitLead: (conversationId: string | null) => LeadSubmitter
  /** Show the Cloudflare Turnstile check on the lead form (live site only). */
  captcha: boolean
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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

/**
 * The Hosting Assistant chat. Used by the website launcher (fetch transport) and the dashboard
 * preview (server-action transport), so the preview is the real widget.
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
    async (event: AssistantEvent, visitorText: string) => {
      if (pending) return
      const startedAt = Date.now()
      setSession((s) => ({ ...s, messages: [...s.messages, { id: newId(), role: "visitor", text: visitorText, at: startedAt }] }))
      setPending(true)
      let blocks: ReplyBlock[]
      let next: Partial<ChatSession> = {}
      try {
        const response = await transport.send({ event, conversationId: sessionRef.current.conversationId })
        blocks = response.error ? [{ type: "text", text: response.error }] : response.replies
        next = {
          conversationId: response.conversationId ?? sessionRef.current.conversationId,
          flowAnswers: response.flowAnswers ?? null,
        }
      } catch {
        blocks = [{ type: "text", text: "Sorry, I couldn't reach our server. Please check your connection and try again." }]
      }
      // The typing indicator stays up for at least the configured delay, so replies don't flash in.
      const remaining = config.typingDelayMs - (Date.now() - startedAt)
      if (remaining > 0) await wait(remaining)
      setSession((s) => ({ ...s, ...next, messages: [...s.messages, { id: newId(), role: "assistant", blocks, at: Date.now() }] }))
      setPending(false)
    },
    [config.typingDelayMs, pending, transport]
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
  const leadSent = (messageId: string) => session.leadsSent.includes(messageId)

  function renderBlock(block: ReplyBlock, message: ChatMessage, index: number) {
    const key = `${message.id}-${index}`
    switch (block.type) {
      case "text":
        return (
          <p key={key} className="rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-[13.5px] leading-relaxed whitespace-pre-line text-slate-800 shadow-sm ring-1 ring-slate-200/70">
            {block.text}
          </p>
        )
      case "options": {
        const live = message.id === lastMessage?.id && !pending
        return (
          <div key={key} className="flex flex-wrap gap-1.5" role="group" aria-label="Choose an answer">
            {block.options.map((option) => (
              <button
                key={option.id}
                type="button"
                disabled={!live}
                onClick={() => void send({ type: "flow_answer", answers: { ...(session.flowAnswers ?? {}), [block.stepId]: option.id } }, option.label)}
                className="rounded-full border border-[var(--aw-primary)]/30 bg-white px-3 py-1.5 text-[12.5px] font-medium text-[var(--aw-primary)] transition-colors hover:bg-[var(--aw-primary)] hover:text-[var(--aw-on-primary)] disabled:cursor-default disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-[var(--aw-primary)]"
              >
                {option.label}
              </button>
            ))}
          </div>
        )
      }
      case "plans":
        return (
          <div key={key} className="flex flex-col gap-2">
            {block.plans.map((plan) => {
              const monthly = formatPrice(plan.monthlyPrice, plan.currency)
              const yearly = formatPrice(plan.yearlyPrice, plan.currency)
              const external = plan.ctaUrl?.startsWith("http")
              return (
                <div key={plan.id} className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">{plan.categoryLabel}</p>
                      <p className="text-sm font-semibold text-slate-900">{plan.name}</p>
                    </div>
                    {plan.isPopular ? (
                      <span className="shrink-0 rounded-full bg-[var(--aw-secondary)] px-2 py-0.5 text-[10.5px] font-semibold text-[var(--aw-on-secondary)]">Popular</span>
                    ) : null}
                  </div>
                  {monthly || yearly ? (
                    <p className="mt-1 text-[13px] text-slate-700">
                      {monthly ? (
                        <>
                          <span className="font-semibold text-slate-900">{monthly}</span>/mo
                        </>
                      ) : null}
                      {monthly && yearly ? " · " : null}
                      {yearly ? (
                        <>
                          <span className="font-semibold text-slate-900">{yearly}</span>/yr
                        </>
                      ) : null}
                    </p>
                  ) : (
                    <p className="mt-1 text-[13px] text-slate-600">Pricing on request</p>
                  )}
                  {plan.features.length ? (
                    <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[12.5px] text-slate-600">
                      {plan.features.slice(0, 5).map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  ) : null}
                  {plan.ctaUrl ? (
                    <a
                      href={plan.ctaUrl}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="mt-2 inline-flex items-center gap-1 rounded-lg bg-[var(--aw-primary)] px-3 py-1.5 text-[12.5px] font-semibold text-[var(--aw-on-primary)] hover:opacity-90"
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
                disabled={pending}
                onClick={() => void send({ type: "faq", faqId: faq.id }, faq.question)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left text-[12.5px] text-[var(--aw-primary)] hover:border-[var(--aw-primary)]/40 disabled:opacity-60"
              >
                {faq.question}
              </button>
            ))}
          </div>
        )
      case "lead_form":
        return (
          <AssistantLeadForm
            key={key}
            service={block.service}
            requirement={block.requirement}
            sent={leadSent(message.id)}
            useCaptcha={transport.captcha}
            onSubmit={transport.submitLead(session.conversationId)}
            onSent={() => setSession((s) => ({ ...s, leadsSent: [...s.leadsSent, message.id] }))}
          />
        )
      case "link":
        return (
          <a key={key} href={block.href} className="inline-flex w-fit items-center gap-1 rounded-lg bg-[var(--aw-primary)] px-3 py-1.5 text-[12.5px] font-semibold text-[var(--aw-on-primary)] hover:opacity-90">
            {block.label}
            <ArrowUpRight className="size-3.5" aria-hidden />
          </a>
        )
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
            Usually replies instantly
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

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-3.5 py-4" role="log" aria-live="polite" aria-label="Conversation">
        <div className="flex gap-2">
          <Avatar config={config} size="size-7" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-[13.5px] leading-relaxed whitespace-pre-line text-slate-800 shadow-sm ring-1 ring-slate-200/70">
              {config.welcomeMessage}
            </p>
            {config.introMessage ? <p className="text-[12.5px] text-slate-600">{config.introMessage}</p> : null}
            {config.starters.length ? (
              <div className="flex flex-wrap gap-1.5">
                {config.starters.map((starter) => (
                  <button
                    key={starter.id}
                    type="button"
                    disabled={pending}
                    onClick={() => void send({ type: "starter", starterId: starter.id }, starter.text)}
                    className="rounded-full border border-[var(--aw-secondary)] bg-white px-3 py-1.5 text-[12.5px] font-medium text-slate-800 transition-colors hover:bg-[var(--aw-secondary)] hover:text-[var(--aw-on-secondary)] disabled:opacity-60"
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
              <p className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[var(--aw-primary)] px-3 py-2 text-[13.5px] leading-relaxed whitespace-pre-line text-[var(--aw-on-primary)]">
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

      {config.quickActions.length ? (
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

      <form onSubmit={submitText} className="flex items-center gap-2 border-t border-slate-200 bg-white p-2.5">
        <label htmlFor={`${storageKey}-input`} className="sr-only">
          Type your question
        </label>
        <input
          ref={inputRef}
          id={`${storageKey}-input`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={500}
          autoComplete="off"
          placeholder="Ask about hosting, domains, SSL…"
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

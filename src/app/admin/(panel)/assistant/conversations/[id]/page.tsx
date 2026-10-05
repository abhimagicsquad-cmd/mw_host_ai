import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { formatDate, PageHeader, Panel, Pill, ProblemNotice } from "@/components/admin/ui"
import { getConversation, type MessageRow } from "@/lib/admin/assistant-queries"
import { requireAdmin } from "@/lib/admin/auth"
import { can } from "@/lib/admin/permissions"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Conversation" }

const KIND_LABELS: Record<string, string> = {
  quick_action: "Quick action",
  starter: "Starter",
  flow_answer: "Flow answer",
  faq_click: "Related question",
  faq_answer: "FAQ answer",
  fallback: "No answer found",
  recommendation: "Recommendation",
  plans: "Plans shown",
  lead_prompt: "Lead form offered",
  lead_captured: "Lead captured",
  flow_question: "Flow question",
}

function Message({ message }: { message: MessageRow }) {
  const visitor = message.role === "visitor"
  const label = KIND_LABELS[message.kind]
  return (
    <div className={cn("flex flex-col gap-1", visitor ? "items-end" : "items-start")}>
      <div className={cn("max-w-[80%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-line", visitor ? "rounded-tr-sm bg-primary text-primary-foreground" : "rounded-tl-sm bg-muted")}>
        {message.body}
      </div>
      <p className="text-[11px] text-muted-foreground">
        {visitor ? "Visitor" : "Assistant"} · {formatDate(message.created_at)}
        {label ? ` · ${label}` : ""}
      </p>
    </div>
  )
}

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin("assistant.manage")
  const { id } = await params
  const { data, problem } = await getConversation(id)
  if (!data) {
    if (problem) return <ProblemNotice problem={problem} />
    notFound()
  }
  const { conversation, messages } = data

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Conversation"
        description={`Visitor ${conversation.visitor_id} · started ${formatDate(conversation.started_at)}`}
        breadcrumbs={[{ label: "Hosting Assistant", href: "/admin/assistant" }, { label: "Conversations", href: "/admin/assistant/conversations" }, { label: "Details" }]}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Panel title={`${messages.length} messages`}>
          {messages.length ? <div className="flex flex-col gap-3">{messages.map((message) => <Message key={message.id} message={message} />)}</div> : <p className="text-sm text-muted-foreground">No messages.</p>}
        </Panel>
        <div className="flex flex-col gap-4">
          <Panel title="Details">
            <dl className="grid gap-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Started</dt>
                <dd>{formatDate(conversation.started_at)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Last activity</dt>
                <dd>{formatDate(conversation.last_activity_at)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Messages</dt>
                <dd>{conversation.message_count}</dd>
              </div>
              {conversation.page_url ? (
                <div>
                  <dt className="text-xs text-muted-foreground">Started on</dt>
                  <dd className="break-all">{conversation.page_url}</dd>
                </div>
              ) : null}
            </dl>
          </Panel>
          <Panel title="Lead generated">
            {conversation.lead ? (
              <div className="flex flex-col gap-1 text-sm">
                <Pill className="w-fit bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">Yes</Pill>
                <p className="font-medium">{conversation.lead.name}</p>
                <a href={`mailto:${conversation.lead.email}`} className="text-primary hover:underline">
                  {conversation.lead.email}
                </a>
                <a href={`tel:${conversation.lead.phone}`} className="hover:underline">
                  {conversation.lead.phone}
                </a>
                {can(admin.role, "forms.view") ? (
                  <Link href="/admin/forms/leads" className="mt-2 text-xs font-medium text-primary hover:underline">
                    Open Leads →
                  </Link>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No enquiry was sent from this chat.</p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}

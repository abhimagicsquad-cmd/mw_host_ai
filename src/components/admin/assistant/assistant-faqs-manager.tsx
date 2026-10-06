"use client"

import { useRouter } from "next/navigation"
import { useActionState, useEffect, useState } from "react"
import { Download, MessageCircleQuestion, Pencil, Plus, Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { deleteFaqAction, importWebsiteFaqsAction, saveFaqAction } from "@/lib/admin/actions/assistant"
import type { AssistantFaq } from "@/lib/assistant/types"
import type { ActionState } from "@/lib/cms/types"

import { ConfirmActionButton, Field, FormMessage, selectClassName, SubmitButton } from "../form-controls"
import { EmptyState, Pill, Table, Td, Th } from "../ui"

function FaqDialog({ faq, categories, onClose }: { faq: AssistantFaq | null; categories: string[]; onClose: () => void }) {
  const router = useRouter()
  const [state, formAction] = useActionState(saveFaqAction, {} as ActionState)

  useEffect(() => {
    if (state.ok) {
      onClose()
      router.refresh()
    }
  }, [state, onClose, router])

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{faq ? "Edit FAQ" : "Add an FAQ"}</DialogTitle>
          <DialogDescription>
            The assistant answers with this when a visitor asks the exact question, uses one of the keywords, or asks something with mostly the same words.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4">
          <input type="hidden" name="id" value={faq?.id ?? ""} />
          <Field label="Question" required error={state.fieldErrors?.question}>
            {(id) => <Input id={id} name="question" defaultValue={faq?.question} maxLength={300} required />}
          </Field>
          <Field label="Answer" required error={state.fieldErrors?.answer} help="Plain text; line breaks are kept.">
            {(id) => <Textarea id={id} name="answer" rows={6} defaultValue={faq?.answer} maxLength={4000} required />}
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" help="e.g. hosting, vps, domains, ssl" error={state.fieldErrors?.category}>
              {(id) => (
                <>
                  <Input id={id} name="category" list={`${id}-list`} defaultValue={faq?.category ?? "general"} maxLength={40} />
                  <datalist id={`${id}-list`}>
                    {categories.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </>
              )}
            </Field>
            <Field label="Status">
              {(id) => (
                <select id={id} name="status" className={selectClassName} defaultValue={faq?.status ?? "published"}>
                  <option value="published">Published (used by the assistant)</option>
                  <option value="draft">Draft (hidden)</option>
                </select>
              )}
            </Field>
          </div>
          <Field label="Keywords" help="Comma separated words or phrases, e.g. vps, virtual private server, root access">
            {(id) => <Input id={id} name="keywords" defaultValue={faq?.keywords.join(", ")} maxLength={1000} />}
          </Field>
          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton>
              <Save />
              {faq ? "Save FAQ" : "Add FAQ"}
            </SubmitButton>
            <FormMessage state={state} className="flex-1" />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function FaqImportButtons() {
  return (
    <div className="flex flex-wrap gap-2">
      <ConfirmActionButton
        variant="outline"
        size="sm"
        action={() => importWebsiteFaqsAction(false)}
        title="Import the website's FAQs?"
        description="Adds the questions already answered on the product, service and Knowledge Base pages as drafts, so you can review them before the assistant uses them. Existing questions are skipped."
        confirmLabel="Import as drafts"
      >
        <Download />
        Import website FAQs
      </ConfirmActionButton>
    </div>
  )
}

export function AssistantFaqsTable({ faqs, categories, filtered }: { faqs: AssistantFaq[]; categories: string[]; filtered: boolean }) {
  const [editing, setEditing] = useState<AssistantFaq | null | "new">(null)

  return (
    <>
      <div className="flex justify-end border-b px-5 py-3">
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus />
          Add FAQ
        </Button>
      </div>
      {faqs.length ? (
        <Table>
          <thead>
            <tr>
              <Th>Question</Th>
              <Th>Category</Th>
              <Th>Keywords</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {faqs.map((faq) => (
              <tr key={faq.id} className="hover:bg-muted/30">
                <Td className="max-w-md">
                  <p className="font-medium">{faq.question}</p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{faq.answer}</p>
                </Td>
                <Td>
                  <Pill>{faq.category}</Pill>
                </Td>
                <Td className="max-w-48 text-xs text-muted-foreground">{faq.keywords.join(", ") || "—"}</Td>
                <Td>
                  {faq.status === "published" ? <span className="text-sm text-emerald-700 dark:text-emerald-400">Published</span> : <span className="text-sm text-muted-foreground">Draft</span>}
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-0.5">
                    <Button variant="ghost" size="icon-xs" aria-label={`Edit “${faq.question}”`} onClick={() => setEditing(faq)}>
                      <Pencil />
                    </Button>
                    <ConfirmActionButton
                      variant="ghost"
                      size="icon-xs"
                      aria-label={`Delete “${faq.question}”`}
                      action={() => deleteFaqAction(faq.id)}
                      title="Delete this FAQ?"
                      description={`“${faq.question}” is removed permanently. Set it to Draft to hide it instead.`}
                      confirmLabel="Delete FAQ"
                      destructive
                    >
                      <Trash2 className="text-destructive" />
                    </ConfirmActionButton>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <EmptyState
          icon={MessageCircleQuestion}
          title={filtered ? "No FAQs match these filters" : "No FAQs yet"}
          description={filtered ? undefined : "Add FAQs, or import the questions already answered on the website."}
        />
      )}
      {editing ? <FaqDialog key={editing === "new" ? "new" : editing.id} faq={editing === "new" ? null : editing} categories={categories} onClose={() => setEditing(null)} /> : null}
    </>
  )
}

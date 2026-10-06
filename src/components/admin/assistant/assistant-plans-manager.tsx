"use client"

import { useRouter } from "next/navigation"
import { useActionState, useEffect, useState, useTransition } from "react"
import { ArrowDown, ArrowUp, Download, Loader2, Pencil, Plus, Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { deletePlanAction, importPlansFromPricingAction, reorderPlansAction, savePlanAction } from "@/lib/admin/actions/assistant"
import { PLAN_CATEGORIES, planCategoryLabel, type AssistantPlan } from "@/lib/assistant/types"
import type { ActionState } from "@/lib/cms/types"

import { move } from "../field-renderer"
import { checkboxClassName, ConfirmActionButton, Field, FormMessage, selectClassName, SubmitButton } from "../form-controls"
import { EmptyState, Panel, Pill, Table, Td, Th } from "../ui"

const price = (value: number | null, currency: "INR" | "USD") =>
  value === null ? "—" : new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(value)

function PlanDialog({ plan, open, onOpenChange }: { plan: AssistantPlan | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter()
  const [state, formAction] = useActionState(savePlanAction, {} as ActionState)

  useEffect(() => {
    if (state.ok) {
      onOpenChange(false)
      router.refresh()
    }
  }, [state, onOpenChange, router])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{plan ? `Edit “${plan.name}”` : "Add a plan"}</DialogTitle>
          <DialogDescription>Plans power the assistant&apos;s recommendations and plan cards. Leave a price empty to show “Pricing on request”.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={plan?.id ?? ""} />
          <Field label="Plan name" required error={state.fieldErrors?.name} className="sm:col-span-2">
            {(id) => <Input id={id} name="name" defaultValue={plan?.name} maxLength={120} required />}
          </Field>
          <Field label="Category" required error={state.fieldErrors?.category}>
            {(id) => (
              <select id={id} name="category" className={selectClassName} defaultValue={plan?.category ?? "shared"}>
                {PLAN_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Currency">
            {(id) => (
              <select id={id} name="currency" className={selectClassName} defaultValue={plan?.currency ?? "INR"}>
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
              </select>
            )}
          </Field>
          <Field label="Monthly price" error={state.fieldErrors?.monthly_price}>
            {(id) => <Input id={id} name="monthly_price" inputMode="decimal" defaultValue={plan?.monthlyPrice ?? ""} placeholder="e.g. 145" />}
          </Field>
          <Field label="Yearly price" error={state.fieldErrors?.yearly_price}>
            {(id) => <Input id={id} name="yearly_price" inputMode="decimal" defaultValue={plan?.yearlyPrice ?? ""} placeholder="e.g. 1740" />}
          </Field>
          <Field label="Features" help="One per line (up to 15)." className="sm:col-span-2">
            {(id) => <Textarea id={id} name="features" rows={5} defaultValue={plan?.features.join("\n")} />}
          </Field>
          <Field label="CTA URL" help="Where “Choose plan” goes: a page (/vps-hosting/) or the order link (https://…)." error={state.fieldErrors?.cta_url} className="sm:col-span-2">
            {(id) => <Input id={id} name="cta_url" defaultValue={plan?.ctaUrl ?? ""} maxLength={1000} />}
          </Field>
          <Field label="Display order" help="Lower first; also decides entry/mid/top for recommendations.">
            {(id) => <Input id={id} name="sort_order" type="number" min={0} max={9999} defaultValue={plan?.sortOrder ?? 100} />}
          </Field>
          <div className="flex flex-col justify-center gap-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="is_popular" defaultChecked={plan?.isPopular} className={checkboxClassName} />
              “Popular” badge
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="is_active" defaultChecked={plan ? plan.isActive : true} className={checkboxClassName} />
              Active (offered by the assistant)
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <SubmitButton>
              <Save />
              {plan ? "Save plan" : "Add plan"}
            </SubmitButton>
            <FormMessage state={state} className="flex-1" />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function AssistantPlansManager({ plans }: { plans: AssistantPlan[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<AssistantPlan | null | "new">(null)
  const [order, setOrder] = useState(plans)
  const [savingOrder, startSaving] = useTransition()
  const [orderState, setOrderState] = useState<ActionState>()
  const [lastPlans, setLastPlans] = useState(plans)
  if (plans !== lastPlans) {
    // New data from the server (after a save): reset the local order.
    setLastPlans(plans)
    setOrder(plans)
  }
  const orderChanged = order.some((plan, index) => plan.id !== plans[index]?.id)

  return (
    <Panel
      bodyClassName="p-0"
      title={`${plans.length} ${plans.length === 1 ? "plan" : "plans"}`}
      actions={
        <div className="flex flex-wrap gap-2">
          <ConfirmActionButton
            variant="outline"
            size="sm"
            action={importPlansFromPricingAction}
            title="Import plans from the website's pricing?"
            description="Copies the published shared, WordPress, VPS and cloud plans from Content → Pricing Plans. Plans with the same name and category are updated; nothing is deleted."
            confirmLabel="Import"
          >
            <Download />
            Import website pricing
          </ConfirmActionButton>
          <Button size="sm" onClick={() => setEditing("new")}>
            <Plus />
            Add plan
          </Button>
        </div>
      }
    >
      {order.length ? (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Plan</Th>
                <Th>Category</Th>
                <Th>Monthly</Th>
                <Th>Yearly</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {order.map((plan, index) => (
                <tr key={plan.id} className="hover:bg-muted/30">
                  <Td>
                    <p className="font-medium">
                      {plan.name}
                      {plan.isPopular ? <Pill className="ml-2 bg-admin-secondary/15 text-admin-secondary">Popular</Pill> : null}
                    </p>
                    <p className="text-xs text-muted-foreground">{plan.features.slice(0, 3).join(" · ")}</p>
                  </Td>
                  <Td>
                    <Pill>{planCategoryLabel(plan.category)}</Pill>
                  </Td>
                  <Td className="tabular-nums">{price(plan.monthlyPrice, plan.currency)}</Td>
                  <Td className="tabular-nums">{price(plan.yearlyPrice, plan.currency)}</Td>
                  <Td>{plan.isActive ? <span className="text-sm text-emerald-700 dark:text-emerald-400">Active</span> : <span className="text-sm text-muted-foreground">Inactive</span>}</Td>
                  <Td>
                    <div className="flex items-center justify-end gap-0.5">
                      <Button variant="ghost" size="icon-xs" aria-label={`Move ${plan.name} up`} disabled={index === 0} onClick={() => setOrder((list) => move(list, index, -1))}>
                        <ArrowUp />
                      </Button>
                      <Button variant="ghost" size="icon-xs" aria-label={`Move ${plan.name} down`} disabled={index === order.length - 1} onClick={() => setOrder((list) => move(list, index, 1))}>
                        <ArrowDown />
                      </Button>
                      <Button variant="ghost" size="icon-xs" aria-label={`Edit ${plan.name}`} onClick={() => setEditing(plan)}>
                        <Pencil />
                      </Button>
                      <ConfirmActionButton
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Delete ${plan.name}`}
                        action={() => deletePlanAction(plan.id)}
                        title={`Delete “${plan.name}”?`}
                        description="The assistant stops offering it immediately. This can't be undone (set it Inactive to hide it instead)."
                        confirmLabel="Delete plan"
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
          {orderChanged || orderState ? (
            <div className="flex flex-wrap items-center gap-3 border-t px-5 py-3">
              {orderChanged ? (
                <Button
                  size="sm"
                  disabled={savingOrder}
                  onClick={() =>
                    startSaving(async () => {
                      const result = await reorderPlansAction(order.map((plan) => plan.id))
                      setOrderState(result)
                      if (!result.error) router.refresh()
                    })
                  }
                >
                  {savingOrder ? <Loader2 className="animate-spin" /> : <Save />}
                  Save order
                </Button>
              ) : null}
              <FormMessage state={orderState} className="flex-1" />
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState
          icon={Plus}
          title="No plans yet"
          description="Add plans, or import the website's published pricing. Until then, recommendations ask the visitor to request a quote."
        />
      )}
      {editing ? <PlanDialog key={editing === "new" ? "new" : editing.id} plan={editing === "new" ? null : editing} open onOpenChange={(open) => !open && setEditing(null)} /> : null}
    </Panel>
  )
}

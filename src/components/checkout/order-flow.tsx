"use client"

import { useId, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { Check, ChevronLeft, Loader2, Lock, ShieldCheck } from "lucide-react"

import { OrderSummaryCard } from "@/components/checkout/order-summary-card"
import { TextField } from "@/components/forms/fields/text-field"
import { FormStatusMessage } from "@/components/forms/form-status-message"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { orderAccountDefaultValues, orderClientSchema, type OrderClientValues } from "@/schemas/order-form.schema"
import type { PricingPlan } from "@/types/content"

type Step = "configure" | "account" | "review" | "payment"

const STEPS: { key: Step; label: string }[] = [
  { key: "configure", label: "Configure" },
  { key: "account", label: "Account" },
  { key: "review", label: "Review" },
  { key: "payment", label: "Payment" },
]

const STEP_FIELDS: Record<Step, (keyof OrderClientValues)[]> = {
  configure: ["billingCycle"],
  account: ["name", "email", "phone", "company"],
  review: [],
  payment: [],
}

function resolveCycleOption(plan: PricingPlan, cycle: OrderClientValues["billingCycle"]) {
  if (cycle !== "monthly" && plan.billingCycles) {
    const found = plan.billingCycles.find((option) => option.cycle === cycle)
    if (found) {
      return { label: found.label, amount: `${found.totalPrice}${found.priceSuffix ? ` ${found.priceSuffix}` : " billed once"}` }
    }
  }
  return { label: "Monthly", amount: `${plan.price}${plan.priceSuffix ?? "/mo"}` }
}

function filterNameInput(event: React.ChangeEvent<HTMLInputElement>) {
  event.target.value = event.target.value.replace(/[^A-Za-z\s]/g, "")
}

function filterPhoneInput(event: React.ChangeEvent<HTMLInputElement>) {
  event.target.value = event.target.value.replace(/\D/g, "").slice(0, 10)
}

type OrderFlowProps = { plan: PricingPlan }

export function OrderFlow({ plan }: OrderFlowProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const honeypotId = useId()

  const stepParam = searchParams.get("step")
  const step: Step = STEPS.some((s) => s.key === stepParam) ? (stepParam as Step) : "configure"
  const stepIndex = STEPS.findIndex((s) => s.key === step)

  const [formRenderedAt] = useState(() => Date.now())
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [orderRef, setOrderRef] = useState<string | null>(null)

  const {
    register,
    control,
    getValues,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrderClientValues>({
    resolver: zodResolver(orderClientSchema),
    defaultValues: {
      ...orderAccountDefaultValues,
      billingCycle: plan.billingCycles?.[0]?.cycle ?? "monthly",
      website: "",
    },
  })

  const billingCycle = useWatch({ control, name: "billingCycle" })
  const cycleInfo = resolveCycleOption(plan, billingCycle)

  function goToStep(next: Step) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("step", next)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  async function handleNext() {
    const fields = STEP_FIELDS[step]
    const valid = fields.length ? await trigger(fields) : true
    if (!valid) return
    goToStep(STEPS[stepIndex + 1].key)
  }

  function handleBack() {
    if (stepIndex === 0) return
    goToStep(STEPS[stepIndex - 1].key)
  }

  const onConfirmPayment = handleSubmit(async (values) => {
    setSubmitError(null)
    const cycle = resolveCycleOption(plan, values.billingCycle)

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          planSlug: plan.slug,
          planName: plan.name,
          billingLabel: cycle.label,
          amount: cycle.amount,
          source: "checkout",
          formRenderedAt,
          pageUrl: window.location.href,
        }),
      })

      const data: { success?: boolean; message?: string; orderRef?: string } = await response.json().catch(() => ({}))

      if (!data.success) {
        setSubmitError(data.message ?? "Something went wrong placing your order. Please try again.")
        return
      }

      setOrderRef(data.orderRef ?? null)
      // Small delay so the "processing" state is visibly real, not an instant flash.
      await new Promise((resolve) => setTimeout(resolve, 900))
      router.push(`/thank-you?type=order&ref=${encodeURIComponent(data.orderRef ?? "")}`)
    } catch {
      setSubmitError("Network error — please check your connection and try again.")
    }
  })

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-8">
        {/* Step indicator */}
        <ol className="flex items-center gap-2 sm:gap-4" aria-label="Checkout progress">
          {STEPS.map((s, index) => (
            <li key={s.key} className="flex flex-1 items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    index < stepIndex
                      ? "bg-brand-orange text-white"
                      : index === stepIndex
                        ? "border-2 border-brand-orange text-brand-orange"
                        : "border border-border-alt text-muted-foreground"
                  )}
                  aria-current={index === stepIndex ? "step" : undefined}
                >
                  {index < stepIndex ? <Check className="size-3.5" /> : index + 1}
                </span>
                <span className={cn("hidden text-sm font-medium sm:inline", index === stepIndex ? "text-brand-navy" : "text-muted-foreground")}>
                  {s.label}
                </span>
              </div>
              {index < STEPS.length - 1 ? <span className="h-px flex-1 bg-border-alt" /> : null}
            </li>
          ))}
        </ol>

        <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-6" noValidate>
          {step === "configure" ? (
            <div className="flex flex-col gap-4 rounded-2xl border border-border-alt p-6">
              <div>
                <h2 className="font-heading text-lg font-bold text-brand-navy">Choose your billing term</h2>
                <p className="text-sm text-muted-foreground">Longer terms lock in a lower effective monthly rate.</p>
              </div>

              {plan.billingCycles?.length ? (
                <RadioGroup
                  value={billingCycle}
                  onValueChange={(value) => setValue("billingCycle", value as OrderClientValues["billingCycle"], { shouldValidate: true })}
                  className="gap-3"
                >
                  {plan.billingCycles.map((option) => (
                    <Label
                      key={option.cycle}
                      htmlFor={`cycle-${option.cycle}`}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-4 transition-colors",
                        billingCycle === option.cycle ? "border-brand-orange bg-brand-orange/5" : "border-border-alt"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <RadioGroupItem id={`cycle-${option.cycle}`} value={option.cycle} />
                        <span className="font-medium text-brand-navy">{option.label}</span>
                      </span>
                      <span className="font-heading font-bold text-brand-navy">
                        {option.totalPrice}
                        {option.priceSuffix ? <span className="ml-1 text-xs font-normal text-muted-foreground">{option.priceSuffix}</span> : null}
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-brand-orange bg-brand-orange/5 p-4">
                  <span className="font-medium text-brand-navy">Monthly billing</span>
                  <span className="font-heading font-bold text-brand-navy">
                    {plan.price}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">{plan.priceSuffix}</span>
                  </span>
                </div>
              )}
            </div>
          ) : null}

          {step === "account" ? (
            <div className="flex flex-col gap-4 rounded-2xl border border-border-alt p-6">
              <div>
                <h2 className="font-heading text-lg font-bold text-brand-navy">Account details</h2>
                <p className="text-sm text-muted-foreground">We&apos;ll use these to set up and confirm your order.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Full name"
                  required
                  placeholder="Full Name *"
                  autoComplete="name"
                  registration={register("name", { onChange: filterNameInput })}
                  error={errors.name?.message}
                />
                <TextField
                  label="Email address"
                  type="email"
                  required
                  placeholder="Email Address *"
                  autoComplete="email"
                  registration={register("email")}
                  error={errors.email?.message}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Phone number"
                  type="tel"
                  required
                  placeholder="Phone Number *"
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="tel"
                  registration={register("phone", { onChange: filterPhoneInput })}
                  error={errors.phone?.message}
                />
                <TextField
                  label="Company (optional)"
                  placeholder="Company Name"
                  registration={register("company")}
                  error={errors.company?.message}
                />
              </div>

              {/* Honeypot — invisible to real users, silently flags automated submissions. */}
              <div className="pointer-events-none absolute -left-[9999px] opacity-0" aria-hidden="true">
                <label htmlFor={honeypotId}>Website</label>
                <input id={honeypotId} type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
              </div>
            </div>
          ) : null}

          {step === "review" ? (
            <div className="flex flex-col gap-4 rounded-2xl border border-border-alt p-6">
              <h2 className="font-heading text-lg font-bold text-brand-navy">Review your order</h2>
              <dl className="flex flex-col divide-y divide-border-alt text-sm">
                <div className="flex items-center justify-between py-3">
                  <dt className="text-muted-foreground">Plan</dt>
                  <dd className="flex items-center gap-3 font-medium text-brand-navy">
                    {plan.name}
                    <button type="button" onClick={() => goToStep("configure")} className="text-xs font-normal text-brand-orange underline-offset-2 hover:underline">
                      Edit
                    </button>
                  </dd>
                </div>
                <div className="flex items-center justify-between py-3">
                  <dt className="text-muted-foreground">Billing</dt>
                  <dd className="font-medium text-brand-navy">{cycleInfo.label}</dd>
                </div>
                <div className="flex items-center justify-between py-3">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="flex items-center gap-3 font-medium text-brand-navy">
                    {getValues("name") || "—"}
                    <button type="button" onClick={() => goToStep("account")} className="text-xs font-normal text-brand-orange underline-offset-2 hover:underline">
                      Edit
                    </button>
                  </dd>
                </div>
                <div className="flex items-center justify-between py-3">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-medium text-brand-navy">{getValues("email") || "—"}</dd>
                </div>
                <div className="flex items-center justify-between py-3">
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="font-medium text-brand-navy">{getValues("phone") || "—"}</dd>
                </div>
                {getValues("company") ? (
                  <div className="flex items-center justify-between py-3">
                    <dt className="text-muted-foreground">Company</dt>
                    <dd className="font-medium text-brand-navy">{getValues("company")}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          ) : null}

          {step === "payment" ? (
            <div className="flex flex-col gap-4 rounded-2xl border border-border-alt p-6">
              <div className="flex items-center gap-2 rounded-lg border border-brand-orange/30 bg-brand-orange/10 px-3 py-2.5 text-sm text-brand-navy">
                <Lock className="size-4 shrink-0 text-brand-orange" />
                <span>
                  <strong>Test mode</strong> — no live payment gateway is connected yet. No card will be charged.
                </span>
              </div>

              <div className="flex flex-col gap-4 opacity-70">
                <div className="flex flex-col gap-1.5">
                  <Label>Card number</Label>
                  <Input value="4242 4242 4242 4242" readOnly disabled />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label>Expiry</Label>
                    <Input value="12 / 29" readOnly disabled />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>CVC</Label>
                    <Input value="123" readOnly disabled />
                  </div>
                </div>
              </div>

              {submitError ? <FormStatusMessage status="error" message={submitError} /> : null}

              <Button
                type="button"
                onClick={onConfirmPayment}
                disabled={isSubmitting || Boolean(orderRef)}
                className="h-11 w-full rounded-full bg-brand-orange text-white hover:bg-brand-orange-hover disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                {orderRef ? "Order placed — redirecting…" : isSubmitting ? "Processing…" : `Pay ${cycleInfo.amount} (Test Mode)`}
              </Button>
            </div>
          ) : null}

          <div className="flex items-center justify-between">
            {stepIndex > 0 ? (
              <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting} className="rounded-full">
                <ChevronLeft className="size-4" />
                Back
              </Button>
            ) : (
              <span />
            )}

            {step !== "payment" ? (
              <Button type="button" onClick={handleNext} className="rounded-full bg-brand-orange text-white hover:bg-brand-orange-hover">
                Continue
              </Button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <OrderSummaryCard planName={plan.name} billingLabel={cycleInfo.label} amount={cycleInfo.amount} />
      </div>
    </div>
  )
}

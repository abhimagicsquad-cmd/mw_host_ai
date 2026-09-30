import { ArrowRightLeft, Search } from "lucide-react"

import { tldPricing, tldTransferPricing } from "@/constants/domain-pages-data"
import { BILLING_BASE_URL, type DomainOrderMode } from "@/lib/billing"
import { publicPath } from "@/lib/public-paths"

type DomainSearchWidgetProps = {
  /** "register" checks availability; "transfer" starts a transfer-in (the WordPress transfer form). */
  mode?: DomainOrderMode
}

const COPY = {
  register: {
    label: "Domain name to search",
    button: "Search",
    pricesLabel: "Registration prices for popular domain extensions",
    pricePrefix: "from",
    note: "Live availability and registration are handled in our secure client area.",
    switchLabel: "Transfer a domain instead",
    switchHref: "/domain/transfer-your-domain-name",
  },
  transfer: {
    label: "Domain name to transfer",
    button: "Transfer",
    pricesLabel: "Transfer prices for popular domain extensions (1 year extension included)",
    pricePrefix: "transfer",
    note: "Transfers are placed in our secure client area — have your domain's EPP / auth code ready.",
    switchLabel: "Register a new domain instead",
    switchHref: "/domain/domain-name-registration",
  },
} as const

/**
 * Real domain search / transfer: submits straight to the live WHMCS domain cart (the same one the
 * WordPress site's forms use), which runs the registrar lookup and lets the visitor order in one
 * step. A plain GET form — works without JavaScript and ships no client JS.
 */
export function DomainSearchWidget({ mode = "register" }: DomainSearchWidgetProps) {
  const copy = COPY[mode]
  const prices = mode === "transfer" ? tldTransferPricing : tldPricing
  const inputId = `domain-${mode}-query`

  return (
    <div className="rounded-2xl border border-border-alt bg-background p-6 sm:p-8">
      <form
        action={`${BILLING_BASE_URL}/cart.php`}
        method="get"
        role="search"
        aria-label={mode === "transfer" ? "Domain transfer" : "Domain availability search"}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <input type="hidden" name="a" value="add" />
        <input type="hidden" name="domain" value={mode} />
        <label htmlFor={inputId} className="sr-only">
          {copy.label}
        </label>
        <div className="relative flex-1">
          {mode === "transfer" ? (
            <ArrowRightLeft className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          ) : (
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          )}
          <input
            id={inputId}
            name="query"
            type="text"
            required
            minLength={2}
            maxLength={67}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            pattern="[A-Za-z0-9][A-Za-z0-9.\-]*"
            title="Letters, numbers, dots and hyphens only — e.g. yourbusiness.com"
            placeholder="Enter your domain name here..."
            className="h-12 w-full rounded-lg border border-input bg-transparent pr-3 pl-11 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <button
          type="submit"
          className="h-12 rounded-full bg-brand-orange px-7 text-base font-semibold text-white transition-colors hover:bg-brand-orange-hover focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {copy.button}
        </button>
      </form>

      <ul className="mt-6 flex flex-wrap gap-2" aria-label={copy.pricesLabel}>
        {prices.map((tld) => (
          <li key={tld.tld} className="rounded-full border border-border-alt bg-surface-alt px-3.5 py-1.5 text-sm">
            <span className="font-semibold text-brand-navy">{tld.tld}</span>{" "}
            <span className="text-body-text">
              {copy.pricePrefix} {tld.price}
              {tld.suffix}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-5 flex flex-wrap items-center gap-2 text-sm text-body-text">
        {copy.note}
        {/* A plain link: the Next router can't prefetch one rewritten domain page from another (segment 404). */}
        <a href={publicPath(copy.switchHref)} className="inline-flex items-center gap-1.5 font-medium text-brand-orange hover:underline">
          <ArrowRightLeft className="size-4" aria-hidden />
          {copy.switchLabel}
        </a>
      </p>
    </div>
  )
}

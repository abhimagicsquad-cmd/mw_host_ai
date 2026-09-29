import { ArrowRightLeft, Search } from "lucide-react"

import { tldPricing } from "@/constants/domain-pages-data"
import { BILLING_BASE_URL, billingUrls } from "@/lib/billing"

/**
 * Real domain search: submits straight to the live WHMCS domain checker (the same one the
 * WordPress site uses), which runs the registrar availability lookup and lets the visitor
 * register in one step. A plain GET form — works without JavaScript and ships no client JS.
 */
export function DomainSearchWidget() {
  return (
    <div className="rounded-2xl border border-border-alt bg-background p-6 sm:p-8">
      <form action={`${BILLING_BASE_URL}/cart.php`} method="get" role="search" aria-label="Domain availability search" className="flex flex-col gap-3 sm:flex-row">
        <input type="hidden" name="a" value="add" />
        <input type="hidden" name="domain" value="register" />
        <label htmlFor="domain-query" className="sr-only">
          Domain name
        </label>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            id="domain-query"
            name="query"
            type="text"
            required
            minLength={2}
            maxLength={63}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            pattern="[A-Za-z0-9][A-Za-z0-9.\-]*"
            placeholder="yourbusiness.com"
            className="h-12 w-full rounded-lg border border-input bg-transparent pr-3 pl-11 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <button
          type="submit"
          className="h-12 rounded-full bg-brand-orange px-7 text-base font-semibold text-white transition-colors hover:bg-brand-orange-hover focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          Check availability
        </button>
      </form>

      <ul className="mt-6 flex flex-wrap gap-2" aria-label="Popular domain extensions">
        {tldPricing.map((tld) => (
          <li key={tld.tld} className="rounded-full border border-border-alt bg-surface-alt px-3.5 py-1.5 text-sm">
            <span className="font-semibold text-brand-navy">{tld.tld}</span> <span className="text-body-text">from {tld.price}{tld.suffix}</span>
          </li>
        ))}
      </ul>

      <p className="mt-5 flex flex-wrap items-center gap-2 text-sm text-body-text">
        Live availability and registration are handled in our secure client area.
        <a href={billingUrls.domainTransfer} className="inline-flex items-center gap-1.5 font-medium text-brand-orange hover:underline">
          <ArrowRightLeft className="size-4" aria-hidden />
          Transfer a domain instead
        </a>
      </p>
    </div>
  )
}

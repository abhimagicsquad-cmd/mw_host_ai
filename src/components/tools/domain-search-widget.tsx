"use client"

import { useId, useMemo, useState } from "react"
import { CheckCircle2, Search, XCircle } from "lucide-react"

import { LeadCTAButton } from "@/components/common/lead-cta-button"
import { Input } from "@/components/ui/input"
import { tldPricing } from "@/constants/domain-pages-data"
import { cn } from "@/lib/utils"

/**
 * Deterministic pseudo-availability check — same input always returns the same result,
 * so the demo feels consistent rather than flickering on re-render. This is NOT a real
 * WHOIS/registrar lookup: swap the `hashString(...) % 5 !== 0` checks below for a real
 * registrar API call (e.g. ResellerClub's domain-availability endpoint) once live
 * credentials are available.
 */
function hashString(input: string) {
  let hash = 5381
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33) ^ input.charCodeAt(index)
  }
  return Math.abs(hash)
}

function sanitizeBase(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\.[a-z.]+$/, "")
    .replace(/[^a-z0-9-]/g, "")
}

export function DomainSearchWidget() {
  const inputId = useId()
  const [query, setQuery] = useState("")
  const base = sanitizeBase(query)

  const results = useMemo(() => {
    if (!base) return []
    return tldPricing.map((tld) => {
      const domain = `${base}${tld.tld}`
      return { ...tld, domain, available: hashString(domain) % 5 !== 0 }
    })
  }, [base])

  const anyAvailable = results.some((result) => result.available)

  const suggestions = useMemo(() => {
    if (!base || anyAvailable) return []
    return ["get", "my", "the"]
      .map((prefix) => `${prefix}${base}`)
      .map((candidate) => ({ domain: `${candidate}.com`, base: candidate }))
      .filter((candidate) => hashString(candidate.domain) % 5 !== 0)
  }, [base, anyAvailable])

  return (
    <div className="rounded-2xl border border-border-alt bg-background p-6 sm:p-8">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={inputId}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Type a domain name — e.g. yourbusiness"
          className="h-12 pl-11 text-base"
          aria-label="Domain name"
        />
      </div>

      {base ? (
        <ul className="mt-6 flex flex-col gap-3">
          {results.map((result) => (
            <li
              key={result.domain}
              className={cn(
                "flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4",
                result.available ? "border-emerald-500/30 bg-emerald-500/5" : "border-border-alt bg-surface-alt"
              )}
            >
              <div className="flex items-center gap-2.5">
                {result.available ? (
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="size-5 shrink-0 text-muted-foreground" />
                )}
                <div>
                  <p className="font-semibold text-brand-navy">{result.domain}</p>
                  <p className="text-xs text-muted-foreground">
                    {result.available ? `Available — ${result.price}${result.suffix}` : "Not available"}
                  </p>
                </div>
              </div>

              {result.available ? (
                <LeadCTAButton
                  source={`domain-search:${result.domain}`}
                  size="sm"
                  defaultService="domain"
                  dialogTitle={`Register ${result.domain}`}
                  dialogDescription="Share your details and we'll help you register this domain and get it connected."
                >
                  Register — {result.price}{result.suffix}
                </LeadCTAButton>
              ) : (
                <span className="text-xs font-medium text-muted-foreground">Taken</span>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      {suggestions.length > 0 ? (
        <div className="mt-6 border-t border-border-alt pt-6">
          <p className="text-sm font-medium text-brand-navy">All popular TLDs are taken for &ldquo;{base}&rdquo; — try one of these instead:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.domain}
                type="button"
                onClick={() => setQuery(suggestion.base)}
                className="rounded-full border border-brand-orange/30 bg-brand-orange/5 px-3.5 py-1.5 text-sm font-medium text-brand-orange transition-colors hover:bg-brand-orange/10"
              >
                {suggestion.domain}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {!base ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Demo availability check — results are simulated for this preview. Final availability is confirmed at registration.
        </p>
      ) : null}
    </div>
  )
}

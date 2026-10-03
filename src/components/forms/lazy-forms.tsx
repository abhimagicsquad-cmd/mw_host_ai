"use client"

import dynamic from "next/dynamic"

/**
 * Lazily loaded lead/quote forms for the page builder. Still server-rendered, but the dynamic
 * import sits in a client module so the bundler splits react-hook-form + zod into their own
 * chunk, downloaded only on pages that actually render a form section.
 */
export const LazyGetQuoteForm = dynamic(() => import("@/components/forms/get-quote-form").then((mod) => mod.GetQuoteForm))
export const LazyLeadForm = dynamic(() => import("@/components/forms/lead-form").then((mod) => mod.LeadForm))

"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"

const GetQuoteForm = dynamic(() => import("@/components/forms/get-quote-form").then((mod) => mod.GetQuoteForm), { ssr: false })

type DeferredQuoteFormProps = {
  source: string
  defaultService?: string
}

/**
 * The quote form, loaded only when the visitor scrolls near it (or jumps to it via a
 * "Request a quote" link). react-hook-form + zod are ~100 KiB of JavaScript that otherwise
 * download and run during page load on pages where the form sits far below the fold. The
 * reserved min-height matches the rendered form, so nothing shifts when it mounts.
 */
export function DeferredQuoteForm({ source, defaultService }: DeferredQuoteFormProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || visible) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "600px 0px" }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [visible])

  return (
    <div ref={ref} className="min-h-[22rem]">
      {visible ? (
        <GetQuoteForm source={source} defaultService={defaultService} />
      ) : (
        <p className="sr-only">The quote form loads as you scroll to it.</p>
      )}
    </div>
  )
}

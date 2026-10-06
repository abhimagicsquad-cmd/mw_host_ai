"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Phone } from "lucide-react"

import { WhatsappIcon } from "@/components/common/social-icons"
import { siteConfig } from "@/constants/site-config"

const LeadDialog = dynamic(() => import("@/components/common/lead-dialog").then((mod) => mod.LeadDialog), {
  ssr: false,
})

const whatsappHref = `https://api.whatsapp.com/send?phone=${siteConfig.contact.phoneHref.replace(/\D/g, "")}&text=${encodeURIComponent("Hi, I need a hosting plan.")}`

/**
 * The WordPress site's always-visible contact shortcuts: WhatsApp and call buttons at the
 * bottom-left, and the vertical "Enquire Now" tab on the right edge that opens the lead form.
 */
export function FloatingContact() {
  const [open, setOpen] = useState(false)
  // Same mount-on-first-open pattern as <LeadCTAButton /> — defers the dialog bundle.
  const [hasOpened, setHasOpened] = useState(false)

  return (
    <>
      <div className="fixed bottom-4 left-3 z-40 flex flex-col gap-2.5 sm:bottom-8 print:hidden">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          title="WhatsApp us"
          className="flex size-10 items-center sm:size-11 justify-center rounded-full bg-[#25d366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <WhatsappIcon className="size-6" aria-hidden />
        </a>
        <a
          href={siteConfig.contact.phoneHref}
          aria-label={`Call us on ${siteConfig.contact.phone}`}
          title="Call us"
          className="flex size-10 items-center sm:size-11 justify-center rounded-full bg-brand-orange text-white shadow-lg transition-transform hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <Phone className="size-5" aria-hidden />
        </a>
      </div>

      <button
        type="button"
        onClick={() => {
          setHasOpened(true)
          setOpen(true)
        }}
        // Vertical text reads top-to-bottom (no rotation). The tab sits flush against the
        // right edge, so only its left (inner) corners are rounded.
        className="fixed top-1/3 right-0 z-40 rounded-l-md bg-brand-orange px-1.5 py-3 text-xs font-semibold sm:px-2 sm:py-4 sm:text-sm tracking-wide text-white shadow-lg transition-colors [writing-mode:vertical-rl] hover:bg-brand-orange-hover focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none print:hidden"
      >
        Enquire Now
      </button>

      {hasOpened ? (
        <LeadDialog
          open={open}
          onOpenChange={setOpen}
          source="enquire-tab"
          dialogTitle="Talk to a hosting expert"
          dialogDescription="Share a few details and our team will get back to you shortly."
        />
      ) : null}
    </>
  )
}

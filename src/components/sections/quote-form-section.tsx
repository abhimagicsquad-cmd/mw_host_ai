import type { ReactNode } from "react"
import Image from "next/image"

import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/layout/section-heading"

/** Shown until an image is chosen for the section in the admin (Pages → section → Side image). */
const FALLBACK_IMAGE = { src: "/images/quote-section-fallback.jpg", alt: "MagicWorks Host web hosting, servers and domains" }

type QuoteFormSectionProps = {
  eyebrow?: string
  title: string
  description?: string
  background?: "none" | "alt"
  /** Side image URL from the CMS media library; falls back to a bundled demo image. */
  imageUrl?: string
  imageAlt?: string
  /** The quote form itself. */
  children: ReactNode
}

/** Two-column quote section: heading + form card on the left, a CMS-editable image on the right (stacks below lg). */
export function QuoteFormSection({ eyebrow, title, description, background = "alt", imageUrl, imageAlt, children }: QuoteFormSectionProps) {
  const src = imageUrl?.trim() || FALLBACK_IMAGE.src
  const alt = imageUrl?.trim() ? (imageAlt?.trim() ?? "") : FALLBACK_IMAGE.alt

  return (
    <SectionContainer width="wide" background={background}>
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] lg:gap-16">
        <div>
          <SectionHeading align="left" eyebrow={eyebrow} title={title} description={description} />
          <div className="mt-8 rounded-2xl border border-border-alt bg-background p-5 shadow-sm sm:p-8">{children}</div>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-lg overflow-hidden rounded-3xl border border-border-alt bg-background shadow-xl shadow-brand-navy/10">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 1280px) 512px, (min-width: 1024px) 40vw, (min-width: 512px) 512px, 100vw"
            className="object-cover"
            // CMS media URLs are served as-is (no remote image config); the bundled fallback is optimized.
            unoptimized={!src.startsWith("/")}
          />
        </div>
      </div>
    </SectionContainer>
  )
}

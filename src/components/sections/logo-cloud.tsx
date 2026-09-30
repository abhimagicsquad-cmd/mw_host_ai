import Image from "next/image"

import { SectionContainer } from "@/components/layout/section-container"
import type { LogoItem } from "@/types/content"

type LogoCloudProps = {
  title?: string
  logos: LogoItem[]
  background?: "none" | "alt"
}

function LogoList({ logos, copy = false }: { logos: LogoItem[]; copy?: boolean }) {
  return (
    // The second copy only exists to make the loop seamless — hidden from assistive tech.
    <ul className="flex shrink-0 items-center" aria-hidden={copy || undefined} data-marquee-copy={copy || undefined}>
      {logos.map((logo) => {
        const image = (
          <Image
            src={logo.logoUrl}
            alt={copy ? "" : logo.name}
            width={197}
            height={100}
            // Eager: lazy images inside the clipped track would only load as they slide in.
            loading="eager"
            fetchPriority="low"
            className="h-12 w-auto object-contain opacity-70 grayscale transition-opacity hover:opacity-100 hover:grayscale-0 sm:h-14"
          />
        )
        return (
          // px-5 on every item (not a flex gap) keeps both copies exactly equal in width.
          <li key={logo.name} className="shrink-0 px-5">
            {logo.href ? (
              <a href={logo.href} aria-label={logo.name} tabIndex={copy ? -1 : undefined}>
                {image}
              </a>
            ) : (
              image
            )}
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Customer logo strip that scrolls continuously right-to-left (pauses on hover with a mouse;
 * static and wrapped for prefers-reduced-motion). Pure CSS — see `.logo-marquee` in globals.css.
 */
export function LogoCloud({ title = "Trusted by businesses across India", logos, background = "none" }: LogoCloudProps) {
  return (
    <SectionContainer background={background} width="wide" padded={false} className="py-10">
      {title ? <p className="mb-6 text-center text-sm font-medium text-muted-foreground">{title}</p> : null}
      <div className="logo-marquee overflow-hidden" role="region" aria-label={title || "Customer logos"}>
        <div className="logo-marquee-track flex w-max" style={{ "--marquee-duration": `${Math.max(20, logos.length * 4)}s` } as React.CSSProperties}>
          <LogoList logos={logos} />
          <LogoList logos={logos} copy />
        </div>
      </div>
    </SectionContainer>
  )
}

import Image from "next/image"

import { SectionContainer } from "@/components/layout/section-container"
import type { LogoItem } from "@/types/content"

type LogoCloudProps = {
  title?: string
  logos: LogoItem[]
  background?: "none" | "alt"
}

export function LogoCloud({ title = "Trusted by businesses across India", logos, background = "none" }: LogoCloudProps) {
  return (
    <SectionContainer background={background} width="wide" padded={false} className="py-10">
      {title ? <p className="mb-6 text-center text-sm font-medium text-muted-foreground">{title}</p> : null}
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
        {logos.map((logo) => {
          const image = (
            <Image
              src={logo.logoUrl}
              alt={logo.name}
              width={197}
              height={100}
              className="h-12 w-auto object-contain opacity-70 grayscale transition-opacity hover:opacity-100 hover:grayscale-0 sm:h-14"
            />
          )

          return logo.href ? (
            <a key={logo.name} href={logo.href} aria-label={logo.name}>
              {image}
            </a>
          ) : (
            <span key={logo.name}>{image}</span>
          )
        })}
      </div>
    </SectionContainer>
  )
}

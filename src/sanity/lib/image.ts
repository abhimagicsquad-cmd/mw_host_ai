import { createImageUrlBuilder } from "@sanity/image-url"
import type { SanityImageSource } from "@sanity/image-url"

import { dataset, projectId } from "@/sanity/env"

const imageBuilder = createImageUrlBuilder({ projectId, dataset })

export function urlForImage(source?: SanityImageSource | null) {
  if (!source) return undefined
  return imageBuilder.image(source)
}

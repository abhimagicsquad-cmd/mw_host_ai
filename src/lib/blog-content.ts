import type { BlogImage, BlogPost } from "@/constants/blog-data"

/**
 * Blog paragraphs are plain text with two additions, written by
 * scripts/import-wordpress-media.mjs for the WordPress articles (and usable in dashboard posts):
 * - `[anchor](href)` anywhere in a paragraph is a link;
 * - a paragraph that is only `![alt](src "WIDTHxHEIGHT")` is an image (the size is optional).
 */

const IMAGE_PARAGRAPH = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"(\d+)x(\d+)")?\)$/
const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g

export function parseImageParagraph(paragraph: string): BlogImage | null {
  const match = IMAGE_PARAGRAPH.exec(paragraph.trim())
  if (!match) return null
  const [, alt, src, width, height] = match
  return { src, alt, ...(width && height ? { width: Number(width), height: Number(height) } : {}) }
}

export type ParagraphPart = { text: string; href?: string }

/** A paragraph split into plain text and links, in order. */
export function paragraphParts(paragraph: string): ParagraphPart[] {
  const parts: ParagraphPart[] = []
  let from = 0
  for (const match of paragraph.matchAll(LINK)) {
    if (match.index > from) parts.push({ text: paragraph.slice(from, match.index) })
    parts.push({ text: match[1], href: match[2] })
    from = match.index + match[0].length
  }
  if (from < paragraph.length) parts.push({ text: paragraph.slice(from) })
  return parts
}

/** The words a reader sees: link markup reduced to its anchor text, images dropped. */
export function plainText(paragraph: string): string {
  return parseImageParagraph(paragraph) ? "" : paragraph.replace(LINK, "$1")
}

/** The image that represents a post when shared: its featured image, else its first article image. */
export function postShareImage(post: Pick<BlogPost, "featuredImage" | "sections">): BlogImage | undefined {
  if (post.featuredImage) return post.featuredImage
  for (const section of post.sections) {
    for (const paragraph of section.body) {
      const image = parseImageParagraph(paragraph)
      if (image) return image
    }
  }
  return undefined
}

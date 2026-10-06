/**
 * The dashboard stores rich text as a small Markdown subset (headings, paragraphs, bullet and
 * numbered lists, quotes, **bold**, *italic*, [links](url)) because it's editable in a plain
 * textarea. `parseRichText` turns it into blocks that `<RichText />` renders.
 */

export type RichTextInline = { text: string; bold?: boolean; italic?: boolean; href?: string }

export type RichTextBlock = {
  type: "paragraph" | "h2" | "h3" | "h4" | "blockquote" | "bullet" | "number"
  children: RichTextInline[]
}

const INLINE_PATTERN = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))/g

function parseInline(text: string): RichTextInline[] {
  const children: RichTextInline[] = []
  for (const part of text.split(INLINE_PATTERN)) {
    if (!part) continue
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      children.push({ text: part.slice(2, -2), bold: true })
    } else if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      children.push({ text: part.slice(1, -1), italic: true })
    } else {
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part)
      children.push(link ? { text: link[1], href: link[2] } : { text: part })
    }
  }
  return children.length ? children : [{ text: "" }]
}

export function parseRichText(markdown: string): RichTextBlock[] {
  const blocks: RichTextBlock[] = []
  let paragraph: string[] = []

  const flushParagraph = () => {
    if (!paragraph.length) return
    blocks.push({ type: "paragraph", children: parseInline(paragraph.join(" ")) })
    paragraph = []
  }

  for (const rawLine of markdown.replace(/\r\n/g, "\n").split("\n")) {
    const line = rawLine.trim()
    if (!line) {
      flushParagraph()
      continue
    }

    const heading = /^(#{2,4})\s+(.*)$/.exec(line)
    const bullet = /^[-*]\s+(.*)$/.exec(line)
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line)
    const quote = /^>\s?(.*)$/.exec(line)

    if (heading) {
      flushParagraph()
      blocks.push({ type: `h${heading[1].length}` as RichTextBlock["type"], children: parseInline(heading[2]) })
    } else if (bullet) {
      flushParagraph()
      blocks.push({ type: "bullet", children: parseInline(bullet[1]) })
    } else if (numbered) {
      flushParagraph()
      blocks.push({ type: "number", children: parseInline(numbered[1]) })
    } else if (quote) {
      flushParagraph()
      blocks.push({ type: "blockquote", children: parseInline(quote[1]) })
    } else {
      paragraph.push(line)
    }
  }
  flushParagraph()

  return blocks
}

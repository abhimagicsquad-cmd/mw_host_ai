import type { PortableTextBlock } from "@portabletext/react"

/**
 * The CMS stores rich text as a small Markdown subset (headings, paragraphs, bullet and
 * numbered lists, **bold**, *italic*, [links](url)) because it's editable in a plain
 * textarea. The website's renderers (PortableText) expect Portable Text, so content is
 * converted on read. `portableTextToMarkdown` is the reverse (Portable Text → Markdown).
 */

type Span = { _type: "span"; _key: string; text: string; marks: string[] }
type MarkDef = { _type: "link"; _key: string; href: string }
type Block = {
  _type: "block"
  _key: string
  style: string
  children: Span[]
  markDefs: MarkDef[]
  listItem?: "bullet" | "number"
  level?: number
}

let keyCounter = 0
function nextKey() {
  keyCounter = (keyCounter + 1) % 1_000_000
  return `k${keyCounter.toString(36)}`
}

const INLINE_PATTERN = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))/g

function parseInline(text: string): { children: Span[]; markDefs: MarkDef[] } {
  const children: Span[] = []
  const markDefs: MarkDef[] = []

  for (const part of text.split(INLINE_PATTERN)) {
    if (!part) continue
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      children.push({ _type: "span", _key: nextKey(), text: part.slice(2, -2), marks: ["strong"] })
    } else if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      children.push({ _type: "span", _key: nextKey(), text: part.slice(1, -1), marks: ["em"] })
    } else {
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part)
      if (link) {
        const def: MarkDef = { _type: "link", _key: nextKey(), href: link[2] }
        markDefs.push(def)
        children.push({ _type: "span", _key: nextKey(), text: link[1], marks: [def._key] })
      } else {
        children.push({ _type: "span", _key: nextKey(), text: part, marks: [] })
      }
    }
  }

  if (!children.length) children.push({ _type: "span", _key: nextKey(), text: "", marks: [] })
  return { children, markDefs }
}

export function markdownToPortableText(markdown: string): PortableTextBlock[] {
  const blocks: Block[] = []
  let paragraph: string[] = []

  const flushParagraph = () => {
    if (!paragraph.length) return
    blocks.push({ _type: "block", _key: nextKey(), style: "normal", ...parseInline(paragraph.join(" ")) })
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
      blocks.push({ _type: "block", _key: nextKey(), style: `h${heading[1].length}`, ...parseInline(heading[2]) })
    } else if (bullet) {
      flushParagraph()
      blocks.push({ _type: "block", _key: nextKey(), style: "normal", listItem: "bullet", level: 1, ...parseInline(bullet[1]) })
    } else if (numbered) {
      flushParagraph()
      blocks.push({ _type: "block", _key: nextKey(), style: "normal", listItem: "number", level: 1, ...parseInline(numbered[1]) })
    } else if (quote) {
      flushParagraph()
      blocks.push({ _type: "block", _key: nextKey(), style: "blockquote", ...parseInline(quote[1]) })
    } else {
      paragraph.push(line)
    }
  }
  flushParagraph()

  return blocks as unknown as PortableTextBlock[]
}

type LooseBlock = {
  _type?: string
  style?: string
  listItem?: string
  children?: { text?: string; marks?: string[] }[]
  markDefs?: { _key: string; _type?: string; href?: string }[]
}

export function portableTextToMarkdown(value: unknown): string {
  if (typeof value === "string") return value
  if (!Array.isArray(value)) return ""

  const lines: string[] = []
  let previousWasList = false

  for (const raw of value as LooseBlock[]) {
    if (raw?._type !== "block") continue
    const text = (raw.children ?? [])
      .map((child) => {
        let out = child.text ?? ""
        for (const mark of child.marks ?? []) {
          if (mark === "strong") out = `**${out}**`
          else if (mark === "em") out = `*${out}*`
          else {
            const def = raw.markDefs?.find((d) => d._key === mark)
            if (def?.href) out = `[${out}](${def.href})`
          }
        }
        return out
      })
      .join("")

    const isList = Boolean(raw.listItem)
    if (lines.length && !(isList && previousWasList)) lines.push("")

    if (raw.listItem === "bullet") lines.push(`- ${text}`)
    else if (raw.listItem === "number") lines.push(`1. ${text}`)
    else if (raw.style && /^h[2-4]$/.test(raw.style)) lines.push(`${"#".repeat(Number(raw.style[1]))} ${text}`)
    else if (raw.style === "h1") lines.push(`## ${text}`)
    else if (raw.style === "blockquote") lines.push(`> ${text}`)
    else lines.push(text)

    previousWasList = isList
  }

  return lines.join("\n")
}

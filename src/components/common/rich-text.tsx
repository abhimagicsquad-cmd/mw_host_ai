import type { ReactNode } from "react"

import { parseRichText, type RichTextBlock, type RichTextInline } from "@/lib/cms/rich-text"

function Inline({ node }: { node: RichTextInline }) {
  let content: ReactNode = node.text
  if (node.bold) content = <strong>{content}</strong>
  if (node.italic) content = <em>{content}</em>
  if (node.href) content = <a href={node.href}>{content}</a>
  return content
}

const inlines = (block: RichTextBlock) => block.children.map((node, index) => <Inline key={index} node={node} />)

/** Renders dashboard rich text (Markdown subset, see src/lib/cms/rich-text.ts) as plain HTML elements. */
export function RichText({ markdown }: { markdown: string }) {
  const blocks = parseRichText(markdown)
  const output: ReactNode[] = []

  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index]
    if (block.type === "bullet" || block.type === "number") {
      // Consecutive list items of the same kind form one list.
      const items: RichTextBlock[] = []
      while (blocks[index]?.type === block.type) items.push(blocks[index++])
      index--
      const List = block.type === "bullet" ? "ul" : "ol"
      output.push(
        <List key={index}>
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{inlines(item)}</li>
          ))}
        </List>
      )
      continue
    }
    const Tag = block.type === "paragraph" ? "p" : block.type
    output.push(<Tag key={index}>{inlines(block)}</Tag>)
  }

  return <>{output}</>
}

"use client"

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Check, Copy, Maximize2, Minimize2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Language = "html" | "css" | "js"

const KEYWORDS =
  "async|await|break|case|catch|class|const|continue|default|delete|do|else|export|extends|false|finally|for|function|if|import|in|instanceof|let|new|null|of|return|static|super|switch|this|throw|true|try|typeof|undefined|var|void|while|window|document"

/** One regex per language; each alternative is a token kind (comment, string, tag, …). */
const PATTERNS: Record<Language, RegExp> = {
  // Built with new RegExp: named groups in regex literals need an ES2018 target.
  html: new RegExp(String.raw`(?<comment><!--[\s\S]*?-->)|(?<tag><\/?[a-zA-Z][\w:-]*|\/?>)|(?<string>"[^"]*"|'[^']*')|(?<attr>\b[a-zA-Z_:][\w:.-]*(?==))`, "g"),
  css: new RegExp(
    String.raw`(?<comment>\/\*[\s\S]*?\*\/)|(?<string>"[^"\n]*"|'[^'\n]*')|(?<at>@[\w-]+)|(?<prop>[\w-]+(?=\s*:[^{};]*;))|(?<number>#[0-9a-fA-F]{3,8}\b|-?\d*\.?\d+(?:px|rem|em|%|vh|vw|s|ms|deg)?\b)`,
    "g"
  ),
  js: new RegExp(
    String.raw`(?<comment>\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(?<string>"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|` +
      "`(?:\\\\.|[^`\\\\])*`" +
      String.raw`)|(?<keyword>\b(?:${KEYWORDS})\b)|(?<number>\b\d+(?:\.\d+)?\b)`,
    "g"
  ),
}

const TOKEN_CLASS: Record<string, string> = {
  comment: "text-slate-400 italic",
  tag: "text-sky-700 dark:text-sky-400",
  attr: "text-amber-700 dark:text-amber-300",
  string: "text-emerald-700 dark:text-emerald-400",
  at: "text-fuchsia-700 dark:text-fuchsia-400",
  prop: "text-sky-700 dark:text-sky-400",
  number: "text-orange-700 dark:text-orange-300",
  keyword: "text-fuchsia-700 dark:text-fuchsia-400",
}

function highlight(code: string, language: Language): ReactNode[] {
  const out: ReactNode[] = []
  const pattern = new RegExp(PATTERNS[language].source, "g")
  let last = 0
  for (const match of code.matchAll(pattern)) {
    const index = match.index ?? 0
    if (index > last) out.push(code.slice(last, index))
    const kind = Object.entries(match.groups ?? {}).find(([, value]) => value !== undefined)?.[0]
    out.push(
      <span key={index} className={kind ? TOKEN_CLASS[kind] : undefined}>
        {match[0]}
      </span>
    )
    last = index + match[0].length
  }
  if (last < code.length) out.push(code.slice(last))
  return out
}

/**
 * A real monospace stack: the site theme clears Tailwind's mono font (Geist everywhere), and code
 * needs fixed-width glyphs with ligatures off (so "-->" doesn't turn into an arrow).
 */
export const MONO = "[font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation_Mono',monospace] [font-variant-ligatures:none]"

const shared = `m-0 whitespace-pre p-3 ${MONO} text-[13px] leading-[1.6] [tab-size:2]`

/**
 * A lightweight code editor: a plain <textarea> (so typing, undo, copy/paste and formatting
 * behave natively) over a syntax-highlighted layer, with line numbers, Tab indentation and a
 * full-screen mode. No external editor library.
 */
export function CodeEditor({
  id,
  value,
  onChange,
  language,
  placeholder,
  label,
  minHeight = 360,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  language: Language
  placeholder?: string
  label: string
  minHeight?: number
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const layerRef = useRef<HTMLPreElement>(null)
  const gutterRef = useRef<HTMLPreElement>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)

  const lines = value.split("\n").length
  const highlighted = useMemo(() => highlight(value, language), [value, language])
  const numbers = useMemo(() => Array.from({ length: lines }, (_, i) => i + 1).join("\n"), [lines])

  useEffect(() => {
    if (!fullscreen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullscreen(false)
    }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [fullscreen])

  function syncScroll() {
    const area = textareaRef.current
    if (!area) return
    if (layerRef.current) layerRef.current.style.transform = `translate(${-area.scrollLeft}px, ${-area.scrollTop}px)`
    if (gutterRef.current) gutterRef.current.style.transform = `translateY(${-area.scrollTop}px)`
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Tab" || event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) return
    // Tab indents (two spaces) instead of leaving the editor; Esc then Tab still moves focus.
    event.preventDefault()
    const area = event.currentTarget
    // setRangeText edits the DOM value and moves the caret in one step, so React sees the same
    // value and leaves the caret where it is (even when typing fast right after Tab).
    area.setRangeText("  ", area.selectionStart, area.selectionEnd, "end")
    onChange(area.value)
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard blocked — the text can still be selected and copied by hand.
    }
  }

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-lg border bg-background", fullscreen && "fixed inset-3 z-50 shadow-2xl")}>
      <div className="flex items-center gap-2 border-b bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
        <span className={cn("rounded bg-background px-1.5 py-0.5 font-semibold tracking-wide uppercase ring-1 ring-border", MONO)}>{language}</span>
        <span className="tabular-nums">
          {lines.toLocaleString("en-IN")} {lines === 1 ? "line" : "lines"} · {value.length.toLocaleString("en-IN")} characters
        </span>
        <div className="ml-auto flex items-center gap-1">
          <Button type="button" variant="ghost" size="xs" onClick={copy} disabled={!value}>
            {copied ? <Check /> : <Copy />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button type="button" variant="ghost" size="xs" onClick={() => setFullscreen((f) => !f)} aria-pressed={fullscreen}>
            {fullscreen ? <Minimize2 /> : <Maximize2 />}
            {fullscreen ? "Exit full screen" : "Full screen"}
          </Button>
        </div>
      </div>
      <div className="relative flex flex-1 overflow-hidden" style={fullscreen ? undefined : { height: minHeight }}>
        <div className="relative w-12 shrink-0 overflow-hidden border-r bg-muted/30 text-right text-muted-foreground/70 select-none" aria-hidden>
          <pre ref={gutterRef} className={cn(shared, "pr-2 pl-0")}>
            {numbers}
          </pre>
        </div>
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <pre ref={layerRef} className={cn(shared, "pointer-events-none absolute top-0 left-0 min-w-full text-foreground")} aria-hidden>
            {highlighted}
            {/* Keeps the layer as tall as the textarea when the code ends with a newline. */}
            {"\n"}
          </pre>
          <textarea
            ref={textareaRef}
            id={id}
            aria-label={label}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onScroll={syncScroll}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            wrap="off"
            className={cn(
              shared,
              "absolute inset-0 h-full w-full resize-none overflow-auto bg-transparent text-transparent caret-foreground outline-none selection:bg-primary/25 selection:text-transparent placeholder:text-muted-foreground/60"
            )}
          />
        </div>
      </div>
    </div>
  )
}

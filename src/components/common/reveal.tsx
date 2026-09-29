"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

type RevealProps = {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}

type Phase = "static" | "hidden" | "shown"

/**
 * Fades/slides an element in once it scrolls into view, animating only once.
 *
 * The server render is always visible, so above-the-fold content (the LCP element) paints
 * without waiting for hydration and no-JS visitors and crawlers see everything. After mount,
 * only elements that start below the viewport are hidden and then animated in.
 */
export function Reveal({ children, delay = 0, y = 16, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<Phase>("static")

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (node.getBoundingClientRect().top < window.innerHeight) return

    setPhase("hidden")
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPhase("shown")
          observer.disconnect()
        }
      },
      { rootMargin: "-80px", threshold: 0 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={
        phase === "static"
          ? undefined
          : {
              opacity: phase === "shown" ? 1 : 0,
              transform: phase === "shown" ? "none" : `translateY(${y}px)`,
              transition: `opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
            }
      }
    >
      {children}
    </div>
  )
}

"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

import { useMediaQuery } from "@/hooks/use-media-query"

type RevealProps = {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}

/** Fades/slides an element in once it scrolls into view, animating only once. */
export function Reveal({ children, delay = 0, y = 16, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "-80px", threshold: 0 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const shown = isVisible || prefersReducedMotion

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : `translateY(${y}px)`,
        transition: prefersReducedMotion
          ? "none"
          : `opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  )
}

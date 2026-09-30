import type { ComponentType, SVGProps } from "react"

/**
 * Lightweight brand marks — lucide-react dropped social/brand icons, so
 * these are hand-rolled to match its sizing convention (className-driven,
 * currentColor stroke/fill) and plug into the same icon-prop shape.
 */
type IconProps = SVGProps<SVGSVGElement>

export function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" {...props}>
      <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.25c0-.87.24-1.46 1.5-1.46h1.6V4.14C15.77 4.06 14.7 4 13.44 4 10.88 4 9 5.57 9 8.41v2.09H6.5v3H9V21h4.5Z" />
    </svg>
  )
}

export function TwitterIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" {...props}>
      <path d="M18.9 4h2.9l-6.3 7.2L22.7 20h-6.2l-4.9-6.4L5.8 20H2.9l6.7-7.7L2.3 4h6.4l4.4 5.8L18.9 4Zm-2.1 14.4h1.6L7.3 5.5H5.6l11.2 12.9Z" />
    </svg>
  )
}

export function WhatsappIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48a.92.92 0 0 0-.67.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  )
}

export function LinkedinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9.98h4v10.02H3V9.98Zm7 0h3.83v1.37h.05c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.78 2.65 4.78 6.1v6.6h-4v-5.85c0-1.4-.02-3.2-1.95-3.2-1.96 0-2.26 1.53-2.26 3.1v5.95h-4V9.98Z" />
    </svg>
  )
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

const socialIconByPlatform: Record<string, ComponentType<IconProps>> = {
  Facebook: FacebookIcon,
  Twitter: TwitterIcon,
  LinkedIn: LinkedinIcon,
  Instagram: InstagramIcon,
  YouTube: TwitterIcon,
}

/** Maps a dashboard `socialLinks[].platform` value to its icon component, defaulting to Facebook's mark for unrecognized platforms. */
export function resolveSocialIcon(platform: string): ComponentType<IconProps> {
  return socialIconByPlatform[platform] ?? FacebookIcon
}

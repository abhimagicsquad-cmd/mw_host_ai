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

/** Maps a Sanity `socialLinks[].platform` value to its icon component, defaulting to Facebook's mark for unrecognized platforms. */
export function resolveSocialIcon(platform: string): ComponentType<IconProps> {
  return socialIconByPlatform[platform] ?? FacebookIcon
}

import Link from "@/components/common/site-link"

type FooterColumnProps = {
  heading: string
  links: { label: string; href: string; external?: boolean }[]
}

export function FooterColumn({ heading, links }: FooterColumnProps) {
  return (
    <nav aria-label={heading} className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-white">{heading}</h2>
      <ul className="flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

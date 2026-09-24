import { CheckCircle2 } from "lucide-react"

import { CTAButton } from "@/components/common/cta-button"
import { Reveal } from "@/components/common/reveal"
import { SectionContainer } from "@/components/layout/section-container"
import { WhyChooseUs } from "@/components/sections/why-choose-us"
import { siteConfig } from "@/constants/site-config"
import { resolveIcon } from "@/lib/icon-map"
import { buildMetadata } from "@/lib/seo"
import { getThankYouPage } from "@/sanity/lib/queries"

export const metadata = buildMetadata({
  title: "Thank You",
  description: "Your message was received — here's what happens next.",
  path: "/thank-you",
  noIndex: true,
})

type ThankYouType = "contact" | "newsletter" | "affiliate" | "order"

const VALID_TYPES: ThankYouType[] = ["contact", "newsletter", "affiliate", "order"]

const fallbackCtas: { label: string; href: string; icon: string; variant: "primary" | "secondary" | "outline" | "ghost" }[] = [
  { label: "Back to Home", href: "/", icon: "Home", variant: "primary" },
  { label: "Explore Services", href: "/hosting", icon: "Server", variant: "outline" },
  { label: "Contact Us", href: "/contact-us", icon: "LifeBuoy", variant: "ghost" },
]

function getTypeContent(type: ThankYouType, ref?: string) {
  switch (type) {
    case "newsletter":
      return {
        heading: "You're subscribed!",
        description: "You'll get hosting tips, uptime/security advisories, and the occasional offer — no spam, unsubscribe anytime.",
        steps: [
          { title: "1. You're on the list", description: "Your email has been added to our newsletter." },
          { title: "2. Watch your inbox", description: "Our next update goes out to subscribers on our regular schedule." },
          { title: "3. Unsubscribe anytime", description: "Every email includes a one-click unsubscribe link." },
        ],
      }
    case "affiliate":
      return {
        heading: "Thanks for applying to our affiliate program",
        description: "We review every application by hand — expect to hear from us within a few business hours with your referral link and dashboard access.",
        steps: [
          { title: "1. We review your application", description: "A real person checks your details — usually within a few business hours." },
          { title: "2. You get your referral link", description: "Once approved, we send your unique tracking link and dashboard login." },
          { title: "3. Start earning", description: "20% recurring commission on every referral, with a 90-day cookie window." },
        ],
      }
    case "order":
      return {
        heading: "Your order is confirmed",
        description: ref
          ? `Order reference ${ref} — this was placed in test mode, so no real charge was made. We'll email your account and setup details shortly.`
          : "This order was placed in test mode, so no real charge was made. We'll email your account and setup details shortly.",
        steps: [
          { title: "1. We confirm your order", description: "Our team double-checks your plan and billing details." },
          { title: "2. Your account gets provisioned", description: "We set up your hosting account and any add-ons you selected." },
          { title: "3. We email your login details", description: "Server/cPanel access lands in your inbox, usually within a few hours." },
        ],
      }
    case "contact":
    default:
      return {
        heading: "Thanks — we've got your message",
        description: `Your request has been received and routed to our team. We usually respond within a few hours during business hours (${siteConfig.contact.hours.sales}) — support tickets are monitored 24/7.`,
        steps: [
          { title: "1. We review your request", description: "A real person on our team reads what you submitted — no ticket ever goes straight to a bot." },
          { title: "2. We reach out directly", description: "Expect a call or email from us, usually within a few business hours." },
          { title: "3. We get you set up", description: "Whether it's a new plan, a migration, or a quick question — we'll take it from there." },
        ],
      }
  }
}

type ThankYouPageProps = {
  searchParams: Promise<{ type?: string; ref?: string }>
}

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const { type: rawType, ref } = await searchParams
  const type: ThankYouType = VALID_TYPES.includes(rawType as ThankYouType) ? (rawType as ThankYouType) : "contact"

  // The Sanity `thankYouPage` singleton only models one generic message — it stays the
  // "contact" fallback's CMS override; the other types always use their local copy.
  const cms = type === "contact" ? await getThankYouPage() : null
  const fallback = getTypeContent(type, ref)

  const heading = cms?.heading ?? fallback.heading
  const description = cms?.description ?? fallback.description
  const steps = cms?.steps ?? fallback.steps
  const ctas = cms?.ctas ?? fallbackCtas

  return (
    <>
      <SectionContainer background="navy" width="wide" padded={false} className="relative overflow-hidden py-16 sm:py-20">
        <div className="pointer-events-none absolute -top-1/2 left-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
        <div className="bg-dot-pattern pointer-events-none absolute inset-0 opacity-15 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,black,transparent)]" />
        <Reveal className="relative flex flex-col items-center gap-4 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-400">
            <CheckCircle2 className="size-8" />
          </span>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{heading}</h1>
          <p className="max-w-xl text-white/70">{description}</p>
        </Reveal>
      </SectionContainer>

      <WhyChooseUs
        eyebrow="What happens next"
        title="Here's what to expect"
        background="none"
        reasons={steps.map((step) => ({ title: step.title, description: step.description ?? "" }))}
      />

      <SectionContainer width="default" background="alt">
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="text-body-text">In the meantime, here&apos;s where you might want to go next.</p>
          <div className="flex flex-wrap justify-center gap-4">
            {ctas.map((cta) => (
              <CTAButton key={cta.href} href={cta.href} variant={cta.variant ?? "primary"} icon={resolveIcon(cta.icon)} iconPosition="start">
                {cta.label}
              </CTAButton>
            ))}
          </div>
        </div>
      </SectionContainer>
    </>
  )
}

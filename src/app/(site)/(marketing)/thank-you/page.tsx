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

const fallbackSteps = [
  { title: "1. We review your request", description: "A real person on our team reads what you submitted — no ticket ever goes straight to a bot." },
  { title: "2. We reach out directly", description: "Expect a call or email from us, usually within a few business hours." },
  { title: "3. We get you set up", description: "Whether it's a new plan, a migration, or a quick question — we'll take it from there." },
]

const fallbackCtas: { label: string; href: string; icon: string; variant: "primary" | "secondary" | "outline" | "ghost" }[] = [
  { label: "Back to Home", href: "/", icon: "Home", variant: "primary" },
  { label: "Explore Services", href: "/hosting", icon: "Server", variant: "outline" },
  { label: "Contact Us", href: "/contact-us", icon: "LifeBuoy", variant: "ghost" },
]

export default async function ThankYouPage() {
  const cms = await getThankYouPage()

  const heading = cms?.heading ?? "Thanks — we've got your message"
  const description =
    cms?.description ??
    `Your request has been received and routed to our team. We usually respond within a few hours during business hours (${siteConfig.contact.hours.sales}) — support tickets are monitored 24/7.`
  const steps = cms?.steps ?? fallbackSteps
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
          <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">{heading}</h1>
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

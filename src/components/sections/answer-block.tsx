import { Check } from "lucide-react"

import { HowToJsonLd } from "@/components/common/json-ld"
import { SectionContainer } from "@/components/layout/section-container"

type AnswerBlockProps = {
  question: string
  /** A direct 40–60 word answer — the text featured snippets and AI answer engines quote. */
  answer: string
  facts?: string[]
  steps?: { name: string; text: string }[]
  /** Name used in the HowTo title, e.g. "Website Migration". */
  label: string
  stepsTitle?: string
}

/**
 * Answer-first block (same layout as <AnswerSection />, with its content passed in): the page's
 * core question answered directly, key facts, and numbered "how it works" steps with HowTo data.
 * The answer paragraph is marked `data-speakable` for the Speakable markup voice assistants read.
 */
export function AnswerBlock({ question, answer, facts = [], steps = [], label, stepsTitle = "How it works" }: AnswerBlockProps) {
  return (
    <SectionContainer width="default">
      {steps.length ? <HowToJsonLd name={`How to get started with ${label}`} steps={steps} /> : null}
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="text-2xl font-bold text-brand-navy sm:text-3xl">{question}</h2>
          <p data-speakable className="mt-4 text-base leading-relaxed text-body-text">
            {answer}
          </p>
          {facts.length ? (
            <ul className="mt-5 flex flex-col gap-2">
              {facts.map((fact) => (
                <li key={fact} className="flex items-start gap-2 text-sm text-body-text">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand-orange" aria-hidden="true" />
                  {fact}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {steps.length ? (
          <div className="rounded-2xl border border-border-alt bg-surface-alt p-6">
            <h2 className="text-lg font-semibold text-brand-navy">{stepsTitle}</h2>
            <ol className="mt-4 flex flex-col gap-4">
              {steps.map((step, index) => (
                <li key={step.name} className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-brand-navy">{step.name}</p>
                    <p className="mt-1 text-sm text-body-text">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    </SectionContainer>
  )
}

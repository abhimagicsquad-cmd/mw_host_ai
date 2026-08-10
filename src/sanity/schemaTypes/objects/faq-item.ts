import { defineField, defineType } from "sanity"

/** Inline question/answer pair for page-specific FAQs (see the `faq` document type for the reusable sitewide bank). */
export const faqItem = defineType({
  name: "faqItem",
  title: "FAQ item",
  type: "object",
  fields: [
    defineField({ name: "question", title: "Question", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "answer", title: "Answer", type: "text", rows: 3, validation: (rule) => rule.required() }),
  ],
  preview: {
    select: { title: "question" },
  },
})

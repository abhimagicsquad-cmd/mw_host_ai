import { defineArrayMember, defineField, defineType } from "sanity"

/** One spec row on the /compare-hosting-plans table — values are positional, matching the shared hosting plan tier order. */
export const comparisonRow = defineType({
  name: "comparisonRow",
  title: "Comparison row",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "values",
      title: "Values (one per plan tier, in order)",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "label" },
  },
})

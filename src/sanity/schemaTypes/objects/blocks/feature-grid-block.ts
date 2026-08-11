import { defineArrayMember, defineField, defineType } from "sanity"

/**
 * Covers both the homepage-style "Mission & Vision" grid (FeaturesSection) and the
 * "How we work" reasons grid (WhyChooseUs) — same icon+title+description card shape,
 * differing only in icon tone / column layout, which `variant` selects at render time.
 */
export const featureGridBlock = defineType({
  name: "featureGridBlock",
  title: "Feature grid",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
    defineField({
      name: "variant",
      title: "Layout",
      type: "string",
      options: { list: [{ title: "Grid (FeaturesSection)", value: "grid" }, { title: "Cards (WhyChooseUs)", value: "cards" }] },
      initialValue: "grid",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "columns",
      title: "Columns",
      type: "number",
      options: { list: [2, 3, 4] },
      initialValue: 3,
      description: "Grid layout only — Cards layout always uses a fixed 2/3-column responsive grid.",
    }),
    defineField({
      name: "background",
      title: "Background",
      type: "string",
      options: { list: ["none", "alt"] },
      initialValue: "none",
    }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [defineArrayMember({ type: "featureItem" })],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "variant" },
  },
})

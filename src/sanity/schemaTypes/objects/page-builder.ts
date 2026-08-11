import { defineArrayMember, defineType } from "sanity"

/** The reusable block-based content structure — add block types here to make them available on every page that uses `pageBuilder` without touching page code. */
export const pageBuilder = defineType({
  name: "pageBuilder",
  title: "Page sections",
  type: "array",
  of: [
    defineArrayMember({ type: "heroBlock" }),
    defineArrayMember({ type: "pageHeroBlock" }),
    defineArrayMember({ type: "bannerBlock" }),
    defineArrayMember({ type: "statsBlock" }),
    defineArrayMember({ type: "pricingBlock" }),
    defineArrayMember({ type: "trustHighlightsBlock" }),
    defineArrayMember({ type: "serviceGridBlock" }),
    defineArrayMember({ type: "aboutCredibilityBlock" }),
    defineArrayMember({ type: "featureGridBlock" }),
    defineArrayMember({ type: "testimonialsBlock" }),
    defineArrayMember({ type: "faqBlock" }),
    defineArrayMember({ type: "ctaBannerBlock" }),
    defineArrayMember({ type: "richTextBlock" }),
  ],
})

/**
 * Long-form knowledge-base guides (/knowledge-base/<slug>/). Unlike the dashboard's KB article
 * list (titles and summaries only), each guide carries its full body, so it renders as its own
 * page: an answer-first summary for search and AI answer engines, the article itself, FAQs, and
 * links into the related service pages and guides.
 *
 * Content rules: plain, factual explanations. Anything about MagicWorks Host itself must already
 * be stated elsewhere on the site (plans, policies, service pages) — no new claims, statistics
 * or promises here.
 */

/** A paragraph, a bulleted or numbered list, or a small comparison table. */
export type GuideBlock =
  | string
  | { list: string[]; ordered?: boolean }
  | { table: { headers: string[]; rows: string[][] } }

export type GuideSection = {
  /** Rendered as an <h2>; phrase as the question a reader would ask where it fits. */
  heading: string
  body: GuideBlock[]
}

export type GuideCategorySlug = "web-hosting" | "wordpress" | "domains" | "ssl-security" | "migration"

export type KBGuide = {
  slug: string
  categorySlug: GuideCategorySlug
  /** The page's H1. */
  title: string
  /** <title> when `title` is too long or lacks the keyword; ≤ 60 characters. */
  metaTitle?: string
  /** Meta description, 120–155 characters. */
  description: string
  /** One-line summary for the article cards. */
  excerpt: string
  readTime: string
  /** ISO date the guide was written or last reviewed. */
  updated: string
  /** Direct answer to the title's question in 40–60 words — the featured-snippet / AI-answer block. */
  answer: string
  /** 3–5 one-sentence takeaways. */
  keyTakeaways: string[]
  sections: GuideSection[]
  /** 3–5 questions with self-contained plain-text answers (rendered as FAQPage schema). */
  faqs: { question: string; answer: string }[]
  /** Internal route paths of the service pages this guide supports, most relevant first. */
  relatedServices: { label: string; href: string }[]
  /** Slugs of related guides. */
  relatedGuides: string[]
}

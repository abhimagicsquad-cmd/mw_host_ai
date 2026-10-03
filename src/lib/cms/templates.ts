import type { FieldDef } from "./section-schemas"
import type { PageType } from "./types"

/**
 * Structured page templates. Unlike page-builder pages (free-form stacks of sections),
 * these URLs are rendered by existing coded routes with a fixed design — the CMS only
 * supplies their content. A template page is stored as a normal `pages` row (so it gets
 * drafts, publishing, SEO and the activity log for free) with exactly one `page_sections`
 * row of type `template:<key>` holding the content as JSON in the same shape the route
 * already consumed.
 */

export type TemplateKey =
  | "servicePage"
  | "legalPage"
  | "supportPage"
  | "affiliatePage"
  | "comparisonPage"
  | "thankYouPage"
  | "knowledgeBase"
  | "blogListing"
  | "blogPost"
  | "promoPage"

export const TEMPLATE_SECTION_PREFIX = "template:"

export function templateSectionType(key: TemplateKey) {
  return `${TEMPLATE_SECTION_PREFIX}${key}`
}

export type TemplateDef = {
  key: TemplateKey
  label: string
  description: string
  pageType: PageType
  fields: FieldDef[]
  defaults: Record<string, unknown>
}

const faqsField: FieldDef = {
  kind: "objectList",
  name: "faqs",
  label: "FAQs",
  itemLabel: "Question",
  fields: [
    { kind: "text", name: "question", label: "Question", required: true },
    { kind: "textarea", name: "answer", label: "Answer", required: true },
  ],
}

const featureFields: FieldDef[] = [
  { kind: "text", name: "title", label: "Title", required: true },
  { kind: "textarea", name: "description", label: "Description", rows: 2 },
  { kind: "icon", name: "icon", label: "Icon" },
]

const statFields: FieldDef[] = [
  { kind: "text", name: "label", label: "Label", required: true },
  { kind: "text", name: "value", label: "Value", required: true },
  { kind: "icon", name: "icon", label: "Icon" },
]

const defaultHint = "Leave empty to keep the standard text shown on this page type."

export const templates: Record<TemplateKey, TemplateDef> = {
  servicePage: {
    key: "servicePage",
    label: "Service page",
    description: "Hosting, domain, email, dedicated server, SSL and VPS product pages.",
    pageType: "service",
    fields: [
      { kind: "text", name: "eyebrow", label: "Short name", required: true, help: "Shown above the heading, in breadcrumbs and in FAQ titles, e.g. “WordPress Hosting”." },
      { kind: "text", name: "heroTitle", label: "Main heading", required: true },
      { kind: "textarea", name: "heroDescription", label: "Intro paragraph" },
      { kind: "stringList", name: "bullets", label: "Key selling points", help: "One per line — shown as ticks under the intro." },
      {
        kind: "objectList",
        name: "features",
        label: "Features",
        itemLabel: "Feature",
        fields: featureFields,
        help: "Hosting, SSL and VPS pages show these. Leave empty on domain, email and dedicated pages to keep their standard feature list.",
      },
      { kind: "text", name: "planSlug", label: "Pricing plan", help: "Email and single-certificate SSL pages only: the slug of a plan from Content → Pricing Plans (e.g. business-email). Leave empty to keep the page's built-in plan." },
      { kind: "boolean", name: "managed", label: "Fully managed service (dedicated servers only)" },
      faqsField,
      {
        kind: "object",
        name: "copy",
        label: "Headings, buttons & stats (optional)",
        collapsed: true,
        help: defaultHint,
        fields: [
          { kind: "objectList", name: "heroStats", label: "Hero stats", itemLabel: "Stat", fields: statFields.slice(0, 2) },
          { kind: "cta", name: "primaryCta", label: "Hero primary button" },
          { kind: "cta", name: "secondaryCta", label: "Hero secondary button" },
          { kind: "text", name: "featuresEyebrow", label: "Features eyebrow" },
          { kind: "text", name: "featuresTitle", label: "Features heading" },
          { kind: "text", name: "pricingEyebrow", label: "Pricing eyebrow" },
          { kind: "text", name: "pricingTitle", label: "Pricing heading" },
          { kind: "textarea", name: "pricingDescription", label: "Pricing paragraph", rows: 2 },
          { kind: "text", name: "faqEyebrow", label: "FAQ eyebrow" },
          { kind: "text", name: "faqTitle", label: "FAQ heading" },
          { kind: "text", name: "ctaTitle", label: "Closing banner heading" },
          { kind: "textarea", name: "ctaDescription", label: "Closing banner paragraph", rows: 2 },
          { kind: "cta", name: "ctaPrimary", label: "Closing banner primary button" },
          { kind: "cta", name: "ctaSecondary", label: "Closing banner secondary button" },
        ],
      },
    ],
    defaults: { eyebrow: "", heroTitle: "", bullets: [], features: [], faqs: [] },
  },
  legalPage: {
    key: "legalPage",
    label: "Legal page",
    description: "Privacy policy, terms, SLA and other policies.",
    pageType: "static",
    fields: [
      { kind: "text", name: "title", label: "Title", required: true },
      { kind: "textarea", name: "summary", label: "Summary", required: true },
      { kind: "text", name: "lastUpdated", label: "Last updated", placeholder: "August 7, 2026" },
      {
        kind: "objectList",
        name: "sections",
        label: "Sections",
        itemLabel: "Section",
        fields: [
          { kind: "text", name: "heading", label: "Heading", required: true },
          { kind: "stringList", name: "body", label: "Paragraphs", help: "One paragraph per line." },
        ],
      },
    ],
    defaults: { title: "", summary: "", lastUpdated: "", sections: [] },
  },
  supportPage: {
    key: "supportPage",
    label: "Support page",
    description: "Support channels and FAQs (/support).",
    pageType: "static",
    fields: [
      { kind: "text", name: "heroTitle", label: "Main heading", required: true },
      { kind: "textarea", name: "heroDescription", label: "Intro paragraph" },
      {
        kind: "objectList",
        name: "channels",
        label: "Support channels",
        itemLabel: "Channel",
        fields: [
          { kind: "text", name: "title", label: "Title", required: true },
          { kind: "textarea", name: "description", label: "Description", rows: 2 },
          { kind: "icon", name: "icon", label: "Icon" },
          { kind: "text", name: "ctaLabel", label: "Button label", required: true },
          { kind: "text", name: "ctaHref", label: "Button link", required: true, placeholder: "tel:+91… or /contact-us" },
          { kind: "boolean", name: "external", label: "Open in new tab" },
        ],
      },
      faqsField,
    ],
    defaults: { heroTitle: "", channels: [], faqs: [] },
  },
  affiliatePage: {
    key: "affiliatePage",
    label: "Affiliate page",
    description: "Affiliate programme page (/become-our-affiliate).",
    pageType: "static",
    fields: [
      { kind: "text", name: "heroEyebrow", label: "Eyebrow" },
      { kind: "text", name: "heroTitle", label: "Main heading", required: true },
      { kind: "textarea", name: "heroDescription", label: "Intro paragraph" },
      { kind: "stringList", name: "heroBullets", label: "Key points", help: "One per line." },
      { kind: "objectList", name: "stats", label: "Stats", itemLabel: "Stat", fields: statFields },
      { kind: "objectList", name: "howItWorks", label: "How it works", itemLabel: "Step", fields: featureFields },
      faqsField,
    ],
    defaults: { heroTitle: "", heroBullets: [], stats: [], howItWorks: [], faqs: [] },
  },
  comparisonPage: {
    key: "comparisonPage",
    label: "Plan comparison page",
    description: "Side-by-side hosting comparison table (/compare-hosting-plans).",
    pageType: "static",
    fields: [
      { kind: "text", name: "heroTitle", label: "Main heading", required: true },
      { kind: "textarea", name: "heroDescription", label: "Intro paragraph" },
      {
        kind: "objectList",
        name: "rows",
        label: "Comparison rows",
        itemLabel: "Row",
        help: "Plan columns come from the shared-hosting plans under Pricing Plans.",
        fields: [
          { kind: "text", name: "label", label: "Feature", required: true },
          { kind: "stringList", name: "values", label: "Values", help: "One value per line, in the same order as the plans." },
        ],
      },
      faqsField,
    ],
    defaults: { heroTitle: "", rows: [], faqs: [] },
  },
  thankYouPage: {
    key: "thankYouPage",
    label: "Thank-you page",
    description: "Shown after the contact form is submitted (/thank-you).",
    pageType: "static",
    fields: [
      { kind: "text", name: "heading", label: "Heading", required: true },
      { kind: "textarea", name: "description", label: "Message", required: true },
      { kind: "objectList", name: "steps", label: "What happens next", itemLabel: "Step", fields: featureFields },
      {
        kind: "objectList",
        name: "ctas",
        label: "Buttons",
        itemLabel: "Button",
        fields: [
          { kind: "text", name: "label", label: "Label", required: true },
          { kind: "text", name: "href", label: "Link", required: true },
          { kind: "icon", name: "icon", label: "Icon" },
          {
            kind: "select",
            name: "variant",
            label: "Style",
            options: [
              { value: "primary", label: "Primary" },
              { value: "secondary", label: "Secondary" },
              { value: "outline", label: "Outline" },
              { value: "ghost", label: "Ghost" },
            ],
          },
        ],
      },
    ],
    defaults: { heading: "", description: "", steps: [], ctas: [] },
  },
  knowledgeBase: {
    key: "knowledgeBase",
    label: "Knowledge base",
    description: "Help centre home, its categories and article list (/knowledge-base).",
    pageType: "static",
    fields: [
      { kind: "text", name: "heroTitle", label: "Main heading", required: true },
      { kind: "textarea", name: "heroDescription", label: "Intro paragraph" },
      {
        kind: "objectList",
        name: "categories",
        label: "Categories",
        itemLabel: "Category",
        help: "Each category gets its own page at /knowledge-base/category/<slug>.",
        fields: [
          { kind: "text", name: "name", label: "Name", required: true },
          { kind: "text", name: "slug", label: "Slug", required: true },
          { kind: "textarea", name: "description", label: "Description", rows: 2 },
          { kind: "icon", name: "icon", label: "Icon" },
        ],
      },
      {
        kind: "objectList",
        name: "articles",
        label: "Articles",
        itemLabel: "Article",
        fields: [
          { kind: "text", name: "title", label: "Title", required: true },
          { kind: "text", name: "slug", label: "Slug", required: true },
          { kind: "textarea", name: "excerpt", label: "Summary", rows: 2 },
          { kind: "text", name: "categorySlug", label: "Category slug", required: true },
          { kind: "text", name: "readTime", label: "Read time", placeholder: "3 min read" },
          { kind: "boolean", name: "featured", label: "Featured" },
          { kind: "boolean", name: "popular", label: "Popular" },
        ],
      },
    ],
    defaults: { heroTitle: "", categories: [], articles: [] },
  },
  blogListing: {
    key: "blogListing",
    label: "Blog home",
    description: "Heading of the blog listing and its categories (/blog).",
    pageType: "blog",
    fields: [
      { kind: "text", name: "title", label: "Main heading", required: true },
      { kind: "textarea", name: "description", label: "Intro paragraph" },
      {
        kind: "objectList",
        name: "categories",
        label: "Categories",
        itemLabel: "Category",
        help: "Posts reference these by slug. Each gets a page at /blog/category/<slug>.",
        fields: [
          { kind: "text", name: "name", label: "Name", required: true },
          { kind: "text", name: "slug", label: "Slug", required: true },
        ],
      },
    ],
    defaults: { title: "", categories: [] },
  },
  blogPost: {
    key: "blogPost",
    label: "Blog post",
    description: "An article under /blog.",
    pageType: "blog",
    fields: [
      { kind: "text", name: "title", label: "Title", required: true },
      { kind: "textarea", name: "excerpt", label: "Excerpt", required: true, help: "Shown on the blog listing and under the title." },
      { kind: "text", name: "categorySlug", label: "Category slug", required: true, help: "One of the category slugs from Blog home." },
      { kind: "text", name: "publishedLabel", label: "Published (label)", placeholder: "Jan 2026" },
      { kind: "text", name: "readTime", label: "Read time", placeholder: "5 min read" },
      { kind: "boolean", name: "featured", label: "Featured post" },
      {
        kind: "object",
        name: "author",
        label: "Author",
        fields: [
          { kind: "text", name: "name", label: "Name", required: true },
          { kind: "text", name: "role", label: "Role" },
        ],
      },
      {
        kind: "objectList",
        name: "sections",
        label: "Article sections",
        itemLabel: "Section",
        help: "Each section appears in the “On this page” list.",
        fields: [
          { kind: "text", name: "heading", label: "Heading", required: true },
          { kind: "stringList", name: "body", label: "Paragraphs", help: "One paragraph per line." },
        ],
      },
    ],
    defaults: { title: "", excerpt: "", categorySlug: "", readTime: "5 min read", author: { name: "MagicWorks Host Team", role: "" }, sections: [] },
  },
  promoPage: {
    key: "promoPage",
    label: "Promotion page",
    description: "Time-limited campaign landing page (/promo/<slug>).",
    pageType: "landing",
    fields: [
      { kind: "text", name: "eyebrow", label: "Badge", required: true, placeholder: "50% OFF" },
      { kind: "text", name: "title", label: "Main heading", required: true },
      { kind: "textarea", name: "description", label: "Intro paragraph" },
      { kind: "stringList", name: "bullets", label: "Offer points", help: "One per line." },
      { kind: "text", name: "endsAt", label: "Offer ends", required: true, placeholder: "2026-12-31T23:59:59+05:30", help: "Date and time the countdown runs to (ISO format)." },
      faqsField,
    ],
    defaults: { eyebrow: "", title: "", bullets: [], endsAt: "", faqs: [] },
  },
}

const SERVICE_PREFIXES: Record<string, string> = {
  hosting: "/hosting/",
  domain: "/domain/",
  email: "/email-hosting/",
  dedicated: "/dedicated-hosting/",
  ssl: "/ssl/",
}

/** Built-in pages under a service prefix that are not service-page templates. */
const NON_TEMPLATE_PATHS = new Set(["/domain/search"])

/** Which template (if any) renders `path`. */
export function templateForPath(path: string): TemplateKey | null {
  if (NON_TEMPLATE_PATHS.has(path)) return null
  if (path === "/ssl" || path === "/vps-hosting") return "servicePage"
  if (/^\/(hosting|domain|email-hosting|dedicated-hosting|ssl)\/[a-z0-9-]+$/.test(path)) return "servicePage"
  if (/^\/legal\/[a-z0-9-]+$/.test(path)) return "legalPage"
  if (/^\/promo\/[a-z0-9-]+$/.test(path)) return "promoPage"
  if (/^\/blog\/[a-z0-9-]+$/.test(path)) return "blogPost"
  const singletons: Record<string, TemplateKey> = {
    "/support": "supportPage",
    "/become-our-affiliate": "affiliatePage",
    "/compare-hosting-plans": "comparisonPage",
    "/thank-you": "thankYouPage",
    "/knowledge-base": "knowledgeBase",
    "/blog": "blogListing",
  }
  return singletons[path] ?? null
}

/** Service page (category, slug) ↔ website URL. */
export function servicePagePath(category: string, slug: string): string {
  if (category === "ssl" && slug === "ssl-certificates") return "/ssl"
  if (category === "vps") return "/vps-hosting"
  return `${SERVICE_PREFIXES[category] ?? `/${category}/`}${slug}`
}

export function servicePageFromPath(path: string): { category: string; slug: string } | null {
  if (path === "/ssl") return { category: "ssl", slug: "ssl-certificates" }
  if (path === "/vps-hosting") return { category: "vps", slug: "vps-hosting" }
  for (const [category, prefix] of Object.entries(SERVICE_PREFIXES)) {
    if (path.startsWith(prefix) && !NON_TEMPLATE_PATHS.has(path)) return { category, slug: path.slice(prefix.length) }
  }
  return null
}

/** Collections: shared, non-page content stored as a `settings` row. */
export const PRICING_COLLECTION_KEY = "collection:pricingPlans"

export const pricingPlanFields: FieldDef[] = [
  { kind: "text", name: "name", label: "Plan name", required: true },
  { kind: "text", name: "slug", label: "Slug", required: true, help: "Used by /order/<slug> and by pages that show a single plan." },
  {
    kind: "select",
    name: "service",
    label: "Service",
    options: [
      { value: "shared-hosting", label: "Shared hosting" },
      { value: "vps-hosting", label: "VPS hosting" },
      { value: "dedicated-server", label: "Dedicated server" },
      { value: "ssl", label: "SSL certificate" },
      { value: "business-email", label: "Business email" },
      { value: "enterprise-email", label: "Enterprise email" },
    ],
  },
  { kind: "select", name: "region", label: "Region", options: [{ value: "india", label: "India" }, { value: "usa", label: "USA" }] },
  { kind: "text", name: "price", label: "Price", required: true, placeholder: "₹99" },
  { kind: "text", name: "regularPrice", label: "Regular price (struck through)" },
  { kind: "text", name: "priceSuffix", label: "Price suffix", placeholder: "/mo" },
  { kind: "text", name: "billingLabel", label: "Billing label" },
  { kind: "text", name: "discountLabel", label: "Discount badge" },
  { kind: "textarea", name: "description", label: "Description", rows: 2 },
  { kind: "stringList", name: "features", label: "Features", help: "One per line." },
  { kind: "cta", name: "cta", label: "Button" },
  { kind: "boolean", name: "featured", label: "Highlight as most popular" },
  {
    kind: "objectList",
    name: "billingCycles",
    label: "Billing options (checkout)",
    itemLabel: "Option",
    fields: [
      {
        kind: "select",
        name: "cycle",
        label: "Cycle",
        options: [
          { value: "monthly", label: "Monthly" },
          { value: "annually", label: "Annually" },
          { value: "biennially", label: "Every 2 years" },
          { value: "triennially", label: "Every 3 years" },
        ],
      },
      { kind: "text", name: "label", label: "Label", required: true },
      { kind: "text", name: "totalPrice", label: "Total price", required: true },
      { kind: "text", name: "priceSuffix", label: "Price suffix" },
    ],
  },
]

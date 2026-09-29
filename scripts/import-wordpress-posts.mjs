/**
 * One-time import of the 42 WordPress blog posts from magicworkshost.com into
 * src/constants/legacy-blog-posts.json, so each old post URL (/<slug>) can 301 to its own
 * article at /blog/<slug> instead of the blog index — preserving the content, rankings and
 * backlinks those URLs have earned. Keeps each post's title, meta description, author,
 * publish/modified dates, category and body (headings, paragraphs, lists).
 *
 * Run: node scripts/import-wordpress-posts.mjs   (safe to re-run; overwrites the JSON)
 */
import { writeFileSync } from "node:fs"

const ORIGIN = "https://magicworkshost.com"
const OUT = new URL("../src/constants/legacy-blog-posts.json", import.meta.url)

// WordPress categories → the blog's category slugs (see blogCategories in blog-data.ts).
const CATEGORY_MAP = {
  "web-hosting": "web-hosting",
  "shared-web-hosting-service": "web-hosting",
  "dedicated-hosting": "web-hosting",
  "secure-web-hosting": "security",
  "web-security": "security",
  "ssl-certificate": "security",
  "secure-socket-layer-ssl": "security",
  "domain-name": "domains-email",
  "email-hosting": "domains-email",
  blogging: "wordpress",
  "web-designs": "web-development",
  "web-development": "web-development",
  "online-business": "business",
  "digital-marketing": "business",
  "affiliate-marketing": "business",
}

const decode = (s) =>
  s
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8216;|&#8217;|&#039;|&#39;/g, "'")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8230;/g, "…")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim()

async function get(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (content import)" }, signal: AbortSignal.timeout(30000) })
      if (res.ok) return await res.text()
    } catch {}
  }
  throw new Error(`Failed to fetch ${url}`)
}

function parseBody(html) {
  const start = html.search(/class="w-post-elm post_content[^"]*"/)
  // The body ends at the share buttons, the author box or the comments — whichever comes first.
  const ends = ['class="w-sharing', "with_ava", "post_comments"].map((marker) => html.indexOf(marker, start)).filter((i) => i > start)
  const body = html.slice(start, ends.length ? Math.min(...ends) : undefined)
  const sections = []
  let current = { heading: "Overview", body: [] }
  for (const m of body.matchAll(/<(h[2-4]|p|li)\b[^>]*>([\s\S]*?)<\/\1>/g)) {
    const text = decode(m[2])
    if (!text || /^(share|tweet)\b/i.test(text)) continue
    if (m[1].startsWith("h")) {
      if (current.body.length || sections.length) sections.push(current)
      current = { heading: text, body: [] }
    } else {
      current.body.push(m[1] === "li" ? `• ${text}` : text)
    }
  }
  sections.push(current)
  return sections.filter((section) => section.body.length)
}

// Titles that were too long for search results (>60 chars), carried a site-name suffix, or
// duplicated another post's title. The old headline stays in the WordPress export.
const TITLE_OVERRIDES = {
  "business-is-always-a-race-where-you-need-to-outrun-your-competitors": "Business is a race: how to outrun your competitors",
  "how-to-use-wordpress-to-build-your-online-presence": "How to use WordPress to build your online presence",
  "what-is-ssl-certificate": "What is an SSL certificate? Fix Chrome's “Not secure” warning",
  "what-is-user-experience-and-why-should-you-care-2": "User experience (UX): how it wins and keeps customers",
}

const sitemap = await get(`${ORIGIN}/post-sitemap.xml`)
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => new URL(u).pathname !== "/")

const posts = []
for (const url of urls) {
  const html = await get(url)
  const slug = new URL(url).pathname.replace(/^\/|\/$/g, "")
  const title =
    TITLE_OVERRIDES[slug] ?? decode(/<h1[^>]*entry-title[^>]*>([\s\S]*?)<\/h1>/.exec(html)?.[1] ?? /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? slug)
  const description = decode(/<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? "")
  const publishedAt = /<meta property="article:published_time" content="([^"]+)"/.exec(html)?.[1] ?? null
  const modifiedAt = /<meta property="article:modified_time" content="([^"]+)"/.exec(html)?.[1] ?? publishedAt
  const rawAuthor = decode(/<meta name="author" content="([^"]*)"/.exec(html)?.[1] ?? "")
  const author = !rawAuthor || /^admin$/i.test(rawAuthor) ? "MagicWorks Host Team" : rawAuthor
  const wpCategory = /\/category\/([a-z0-9-]+)\//.exec(html.slice(html.indexOf("post_taxonomy")))?.[1] ?? "web-hosting"
  const sections = parseBody(html)
  const words = sections.reduce((n, s) => n + s.body.join(" ").split(/\s+/).length, 0)
  const firstParagraph = sections[0]?.body.find((line) => !line.startsWith("•")) ?? ""
  posts.push({
    slug,
    title,
    excerpt: description || (firstParagraph.length > 200 ? `${firstParagraph.slice(0, 197).trimEnd()}…` : firstParagraph),
    categorySlug: CATEGORY_MAP[wpCategory] ?? "web-hosting",
    readTime: `${Math.max(2, Math.round(words / 220))} min read`,
    publishedLabel: publishedAt ? new Date(publishedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) : "",
    publishedAt,
    modifiedAt,
    author: { name: author, role: "" },
    legacyPath: new URL(url).pathname,
    sections,
  })
  console.log(`${String(words).padStart(5)} words  ${slug}`)
}

posts.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))
writeFileSync(OUT, `${JSON.stringify(posts, null, 2)}\n`)
console.log(`\nWrote ${posts.length} posts to src/constants/legacy-blog-posts.json`)

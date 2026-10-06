/**
 * Second pass over the 42 WordPress blog posts in src/constants/legacy-blog-posts.json:
 * adds what the text import (import-wordpress-posts.mjs) left out — each post's featured
 * image, the images inside the article, and the links inside the article — without
 * touching the text, which has been edited since the import.
 *
 * - Images are downloaded to public/wp-content/uploads/<same path as WordPress>, so the old
 *   image URLs keep working once magicworkshost.com points at this site.
 * - Links are written into the existing paragraphs as `[anchor](href)`; links to
 *   magicworkshost.com become site-relative (/ssl-certificate/), since every WordPress URL
 *   is served at the same path here.
 * - Images become their own paragraph, `![alt](/wp-content/uploads/… "WIDTHxHEIGHT")`,
 *   placed where they sat in the WordPress article.
 * - Images that are already missing on WordPress (404) are skipped and listed.
 *
 * Run: node scripts/import-wordpress-media.mjs   (safe to re-run: it first strips the links
 * and images a previous run added, then adds them again)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const ORIGIN = "https://magicworkshost.com"
const JSON_FILE = new URL("../src/constants/legacy-blog-posts.json", import.meta.url)
const PUBLIC_DIR = new URL("../public/", import.meta.url)
const HEADERS = { "User-Agent": "Mozilla/5.0 (content import)" }

// Same text decoding as import-wordpress-posts.mjs, so paragraphs match the imported text.
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

const attr = (tag, name) => decode(new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1] ?? "")

/** Undo a previous run: `[anchor](href)` → anchor; image paragraphs are dropped by the caller. */
const stripLinks = (text) => text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, "$1")
const IMAGE_PARAGRAPH = /^!\[[^\]]*\]\([^)]+\)$/

async function get(url, as = "text") {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(30000) })
      if (res.status === 404) return null
      if (res.ok) return as === "json" ? await res.json() : as === "buffer" ? Buffer.from(await res.arrayBuffer()) : await res.text()
    } catch {}
  }
  throw new Error(`Failed to fetch ${url}`)
}

const missing = []

/** Downloads a WordPress upload to the same path under public/ and returns its local image. */
async function importImage(url, alt, post) {
  const path = new URL(url, ORIGIN).pathname
  if (!path.startsWith("/wp-content/uploads/")) throw new Error(`Unexpected image URL ${url}`)
  const file = fileURLToPath(new URL(`.${path}`, PUBLIC_DIR))
  if (!existsSync(file)) {
    const bytes = await get(url, "buffer")
    if (!bytes) {
      missing.push(`${post}: ${url}`)
      return null
    }
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, bytes)
  }
  const { width, height } = await sharp(file).metadata()
  return { src: path, alt, width, height }
}

/** The largest file of an <img> (WordPress puts a 300px thumbnail in src and the original in srcset). */
function largestSource(tag) {
  const candidates = attr(tag, "srcset")
    .split(",")
    .map((entry) => entry.trim().split(/\s+/))
    .filter(([url, size]) => url && /^\d+w$/.test(size ?? ""))
    .map(([url, size]) => ({ url, width: Number.parseInt(size, 10) }))
  candidates.sort((a, b) => b.width - a.width)
  return candidates[0]?.url ?? attr(tag, "src")
}

const finalPaths = new Map()

/**
 * A link's href on this site: magicworkshost.com links become site-relative and point at the
 * URL they end up on (WordPress 301s /ssl-certificate/ to /buy-ssl-certificate/, and so does
 * this site), so readers never go through a redirect. Other links are kept as they are.
 */
async function internalHref(href) {
  const url = new URL(href.replace(/&amp;/g, "&"), ORIGIN)
  if (url.hostname.replace(/^www\./, "") !== new URL(ORIGIN).hostname) return url.href
  if (!finalPaths.has(url.pathname)) {
    let path = url.pathname
    for (let hop = 0; hop < 5; hop++) {
      const res = await fetch(new URL(path, ORIGIN), { headers: HEADERS, redirect: "manual", signal: AbortSignal.timeout(30000) })
      const location = res.status >= 300 && res.status < 400 ? res.headers.get("location") : null
      if (!location || new URL(location, ORIGIN).hostname.replace(/^www\./, "") !== new URL(ORIGIN).hostname) break
      path = new URL(location, ORIGIN).pathname
    }
    finalPaths.set(url.pathname, path)
  }
  return `${finalPaths.get(url.pathname)}${url.search}${url.hash}`
}

const words = (s) => new Set(s.toLowerCase().match(/[a-z0-9]+/g) ?? [])
function similarity(a, b) {
  const wa = words(a)
  const wb = words(b)
  let shared = 0
  for (const w of wa) if (wb.has(w)) shared++
  return shared / Math.max(1, Math.max(wa.size, wb.size))
}

const posts = JSON.parse(readFileSync(JSON_FILE, "utf8"))
const unplacedLinks = []
let linkCount = 0
let imageCount = 0

for (let page = 1; ; page++) {
  const batch = await get(`${ORIGIN}/wp-json/wp/v2/posts?per_page=100&page=${page}&_embed=1`, "json")
  if (!Array.isArray(batch) || !batch.length) break

  for (const wp of batch) {
    const post = posts.find((candidate) => candidate.slug === wp.slug)
    if (!post) throw new Error(`WordPress post ${wp.slug} is not in legacy-blog-posts.json — run import-wordpress-posts.mjs`)

    // Start from the text alone (drop what a previous run of this script added).
    for (const section of post.sections) section.body = section.body.filter((p) => !IMAGE_PARAGRAPH.test(p)).map(stripLinks)
    const paragraphs = post.sections.flatMap((section, s) => section.body.map((text, p) => ({ s, p, text })))
    const before = new Map()
    const after = new Map()
    const key = (ref) => `${ref.s}:${ref.p}`
    const push = (map, ref, value) => map.set(key(ref), [...(map.get(key(ref)) ?? []), value])

    // Featured image (two posts point at a deleted attachment; WordPress shows none for them).
    const media = wp._embedded?.["wp:featuredmedia"]?.[0]
    delete post.featuredImage
    if (media?.source_url) {
      const image = await importImage(media.source_url, decode(media.alt_text ?? "") || post.title, wp.slug)
      if (image) post.featuredImage = image
    }

    // Walk the article in order: text blocks (with their links and images) and loose images.
    let last = null
    let searchFrom = 0
    for (const m of wp.content.rendered.matchAll(/<(h[2-4]|p|li)\b[^>]*>([\s\S]*?)<\/\1>|<img\b[^>]*>/g)) {
      const [whole, tag, inner = whole] = m
      const text = tag ? decode(inner) : ""
      const plain = tag === "li" ? `• ${text}` : text

      let ref = null
      if (text && !tag.startsWith("h")) {
        const rest = paragraphs.slice(searchFrom)
        ref = rest.find((candidate) => candidate.text === plain) ?? null
        if (!ref) {
          const best = rest.map((candidate) => ({ candidate, score: similarity(candidate.text, plain) })).sort((a, b) => b.score - a.score)[0]
          if (best && best.score >= 0.6) ref = best.candidate
        }
        if (ref) searchFrom = paragraphs.indexOf(ref) + 1
      }

      // Links: wrap the anchor text where it appears in our (possibly edited) paragraph.
      for (const link of inner.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
        const anchor = decode(link[2])
        const href = /\shref="([^"]+)"/.exec(link[1])?.[1]
        if (!anchor || !href) continue
        const target = ref && post.sections[ref.s].body[ref.p]
        // Only wrap text outside links added earlier in this paragraph.
        const at = target ? target.search(new RegExp(`(?<!\\[[^\\]]*)${anchor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`)) : -1
        if (at < 0) {
          unplacedLinks.push(`${wp.slug}: "${anchor}" → ${href}${tag?.startsWith("h") ? " (in a heading)" : ""}`)
          continue
        }
        const updated = `${target.slice(0, at)}[${anchor}](${await internalHref(href)})${target.slice(at + anchor.length)}`
        post.sections[ref.s].body[ref.p] = updated
        ref.text = updated
        linkCount++
      }

      // Images: before the paragraph if they come before its text, otherwise after.
      // Where the block's own text starts, ignoring markup.
      const textStart = tag ? inner.replace(/<[^>]+>/g, (markup) => " ".repeat(markup.length)).search(/\S/) : -1
      for (const img of tag ? inner.matchAll(/<img\b[^>]*>/g) : [{ 0: whole, index: 0 }]) {
        const image = await importImage(largestSource(img[0]), attr(img[0], "alt"), wp.slug)
        if (!image) continue
        const token = `![${image.alt.replace(/[[\]]/g, "")}](${image.src} "${image.width}x${image.height}")`
        if (ref && text && img.index < textStart) push(before, ref, token)
        else if (ref) push(after, ref, token)
        else if (last) push(after, last, token)
        else push(before, paragraphs[0], token)
        imageCount++
      }
      if (ref) last = ref
    }

    post.sections.forEach((section, s) => {
      section.body = section.body.flatMap((text, p) => [...(before.get(`${s}:${p}`) ?? []), text, ...(after.get(`${s}:${p}`) ?? [])])
    })
  }
  if (batch.length < 100) break
}

// Key order: keep featuredImage next to the other post fields.
const ordered = posts.map(({ sections, wpCategories, featuredImage, ...rest }) => ({ ...rest, ...(featuredImage ? { featuredImage } : {}), sections, ...(wpCategories ? { wpCategories } : {}) }))
writeFileSync(JSON_FILE, `${JSON.stringify(ordered, null, 2)}\n`)

console.log(`Featured images: ${ordered.filter((post) => post.featuredImage).length}/${ordered.length}`)
console.log(`Article images: ${imageCount}`)
console.log(`Article links: ${linkCount}`)
if (unplacedLinks.length) console.log(`\nLinks not placed (${unplacedLinks.length}):\n  ${unplacedLinks.join("\n  ")}`)
if (missing.length) console.log(`\nImages missing on WordPress itself (${missing.length}):\n  ${missing.join("\n  ")}`)

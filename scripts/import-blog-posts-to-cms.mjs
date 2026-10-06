/**
 * Copies the built-in blog posts into the dashboard (CMS), so every post on the site is
 * edited there. Each post becomes a page at /blog/<slug> (page type "blog") with its "Blog
 * post" content, the same shape the dashboard's own "New blog post" creates:
 * title, excerpt, category, archive categories (its WordPress categories), author, publish
 * and update dates, read time, featured image (with its size), and the article — paragraphs
 * with their links and images.
 *
 * Posts already in the dashboard (same /blog/<slug> path) are skipped, never duplicated or
 * overwritten. Before writing, the dashboard's current blog pages are saved to a backup file.
 *
 * Run:
 *   node scripts/import-blog-posts-to-cms.mjs                       dry run: lists what it would import
 *   node scripts/import-blog-posts-to-cms.mjs --apply --status=draft
 *   node scripts/import-blog-posts-to-cms.mjs --apply --status=published
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (read from .env.local).
 * Published posts go live after the dashboard's "Clear website cache" (or any dashboard save).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"

const ROOT = new URL("../", import.meta.url)
const args = new Set(process.argv.slice(2))
const apply = args.has("--apply")
const status = [...args].find((arg) => arg.startsWith("--status="))?.slice("--status=".length) ?? "draft"
if (!["draft", "published"].includes(status)) throw new Error(`--status must be draft or published, not ${status}`)

const env = { ...process.env }
for (const line of readFileSync(new URL(".env.local", ROOT), "utf8").split(/\r?\n/)) {
  const match = /^([A-Z0-9_]+)=(.*)$/.exec(line)
  if (match && !env[match[1]]) env[match[1]] = match[2].replace(/^"|"$/g, "")
}
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !KEY) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required")

async function rest(path, init = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: "return=representation", ...init.headers },
  })
  const body = await res.text()
  if (!res.ok) throw new Error(`${init.method ?? "GET"} ${path}: ${res.status} ${body}`)
  return body ? JSON.parse(body) : null
}

// The built-in posts: the 42 WordPress articles (JSON) and the 8 written for the site (TS —
// already in the dashboard; checked below rather than parsed).
const legacy = JSON.parse(readFileSync(new URL("src/constants/legacy-blog-posts.json", ROOT), "utf8"))
const originalSlugs = [...readFileSync(new URL("src/constants/blog-data.ts", ROOT), "utf8").matchAll(/^ {4}slug: "([a-z0-9-]+)",$/gm)].map((m) => m[1])

const existing = await rest("pages?select=id,path,title,status,excerpt,featured_image,published_at,created_at,updated_at&path=like./blog*")
const existingPaths = new Set(existing.map((page) => page.path))

const missingOriginals = originalSlugs.filter((slug) => !existingPaths.has(`/blog/${slug}`))
if (missingOriginals.length) console.warn(`Not in the dashboard and not importable by this script (edit them in src/constants/blog-data.ts): ${missingOriginals.join(", ")}`)

const toImport = legacy.filter((post) => !existingPaths.has(`/blog/${post.slug}`))
console.log(`Dashboard blog pages now: ${existing.length} (${existing.filter((page) => page.path !== "/blog").length} posts)`)
console.log(`Built-in posts: ${originalSlugs.length + legacy.length} — already in the dashboard: ${originalSlugs.length + legacy.length - toImport.length - missingOriginals.length}, to import: ${toImport.length}`)

function templateData(post) {
  const image = post.featuredImage
  return {
    title: post.title,
    excerpt: post.excerpt,
    categorySlug: post.categorySlug,
    archiveCategories: post.wpCategories ?? [],
    publishedLabel: post.publishedLabel,
    publishedAt: post.publishedAt ?? "",
    modifiedAt: post.modifiedAt && post.modifiedAt !== post.publishedAt ? post.modifiedAt : "",
    readTime: post.readTime,
    featured: Boolean(post.featured),
    ...(image ? { featuredImage: image.src, featuredImageAlt: image.alt, featuredImageMeta: { src: image.src, width: image.width, height: image.height } } : {}),
    author: { name: post.author.name, role: post.author.role ?? "" },
    sections: post.sections,
  }
}

if (!apply) {
  for (const post of toImport) console.log(`  would import /blog/${post.slug}  (${post.publishedAt?.slice(0, 10)}, ${post.author.name}${post.featuredImage ? ", featured image" : ""})`)
  console.log(`\nDry run — nothing written. Re-run with --apply --status=draft|published.`)
  process.exit(0)
}

if (toImport.length) {
  // Backup of the dashboard's blog pages and their content before the import.
  const sections = await rest(`page_sections?select=*&page_id=in.(${existing.map((page) => page.id).join(",")})`)
  const dir = new URL("backups/", ROOT)
  mkdirSync(dir, { recursive: true })
  const backup = new URL(`blog-cms-before-import-${new Date().toISOString().replace(/[:.]/g, "-")}.json`, dir)
  writeFileSync(backup, JSON.stringify({ pages: existing, sections }, null, 2))
  console.log(`Backup: ${backup.pathname}`)
}

let imported = 0
for (const post of toImport) {
  const now = new Date().toISOString()
  const [page] = await rest("pages", {
    method: "POST",
    body: JSON.stringify({
      title: post.title,
      path: `/blog/${post.slug}`,
      page_type: "blog",
      status,
      excerpt: post.excerpt,
      featured_image: post.featuredImage?.src ?? null,
      published_at: post.publishedAt ?? null,
      // Listed by publish date in the dashboard, like the posts themselves.
      created_at: post.publishedAt ?? now,
      updated_at: now,
    }),
  })
  try {
    await rest("page_sections", { method: "POST", body: JSON.stringify({ page_id: page.id, type: "template:blogPost", position: 0, data: templateData(post), is_visible: true }) })
  } catch (error) {
    await rest(`pages?id=eq.${page.id}`, { method: "DELETE" })
    throw error
  }
  imported++
  console.log(`  imported /blog/${post.slug} (${status})`)
}

if (imported) {
  await rest("activity_logs", {
    method: "POST",
    body: JSON.stringify({
      username: "content-import",
      action: "page.created",
      entity_type: "page",
      description: `Imported ${imported} blog posts from the site's built-in content (${status})`,
      metadata: { script: "scripts/import-blog-posts-to-cms.mjs", slugs: toImport.map((post) => post.slug) },
    }),
  })
}
console.log(`\nImported ${imported} posts as ${status}.`)

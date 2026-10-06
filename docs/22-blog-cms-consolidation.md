# Blog: one source in the dashboard (2026-10-06)

## Before

- **Website:** 50 posts — 8 written for the new site and 42 imported from WordPress.
- **Dashboard:** "Blog" listed 9 pages — the blog home page and the 8 site posts.
- **The problem:** the 42 WordPress posts lived only in code (`src/constants/legacy-blog-posts.json`). The site merged the two sources, so unpublishing a dashboard post just showed the built-in copy instead.

## After

- **The dashboard is the only source.** The site shows exactly the blog posts published there. Unpublishing or deleting a post takes it off the site, along with its URL, the sitemap, llms.txt, site search, the category archives and the related-article links.
- **Built-in fallback.** The built-in posts are used only if the dashboard returns no posts at all (database not configured or unreachable), so the blog never renders empty.
- **Import.** `scripts/import-blog-posts-to-cms.mjs` copied the 42 WordPress posts into the dashboard. The dashboard now lists the blog home page and 50 posts.
  - The import is a dry run unless given `--apply`.
  - It never duplicates or overwrites: a post already in the dashboard is skipped.
  - Before writing, it saved the dashboard's blog rows to `backups/` (git-ignored; a copy is in `Documents/MW_Host_AI-backups/2026-10-06-blog-import/`).
- **What each post keeps:**
  - title and slug (`/blog/<slug>`, served at `/<slug>/` as before)
  - excerpt (also used as the meta description)
  - category
  - archive categories (its WordPress categories)
  - author
  - publish date, exact and as a label
  - last-updated date
  - read time
  - featured image, with its size and alt text
  - the article, with its links and images

  The 42 dashboard copies match the built-in posts field for field. WordPress had no tags, so there were none to import.

## New fields in the dashboard's blog post form

- **Archive categories:** the `/category/<slug>/` archives that list the post.
- **Published on / Last updated on:** exact dates for search engines.
- **Featured image** and its **alt text**. It shows above the article and is used as the share image.
- **Paragraph markup:** a link is written `[text](/page/)`. An image is a line of its own, written `![description](/image.jpg "WIDTHxHEIGHT")`.

## Images

- **Best available files.** Every image is already the largest file WordPress has; no larger originals exist.
- **Not stretched.** Images now show at their own width, at most the 720px column. Before, 48 of the 115 were narrower than the column and were stretched to fill it, which blurred them.
- **Responsive sizes.** `sizes` matches the displayed width, so each screen gets a big enough file.
- **Quality.** Blog images are encoded at quality 90 instead of 75 (`images.qualities` in `next.config.ts`). The originals are already compressed JPEGs, so re-encoding them at 75 softened them further.
- **Checked in Chromium** at 1440px @1x, 1280px @2x, 820px @2x and 390px @3x:
  - every image is served at enough pixels for its displayed size and pixel density (or at its full original size);
  - none are stretched or distorted;
  - no page scrolls horizontally.

## Owner action: publish the 42 posts after deploying

The 42 imported posts are **drafts**. The live build is older and would render their link and image markup as plain text, so they stay drafts until this branch is deployed. After deploying:

1. Go to Dashboard → Content → Blog.
2. Select the 42 draft posts and use the bulk **Publish** action.
3. Go to the Dashboard home page and use **Clear website cache** (in System tools).

Until step 2, the new build shows only the 8 published posts.

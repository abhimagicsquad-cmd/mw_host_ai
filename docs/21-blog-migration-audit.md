# Blog migration audit (2026-10-06)

A comparison of every blog post on the WordPress site (https://magicworkshost.com, read through its REST API and post pages) with the Next.js site (https://magicworkshost.vercel.app), followed by a fix.

## Before the fix

| Check | WordPress | Next.js |
| --- | --- | --- |
| Blog posts | 42 | 50 (the 42 WordPress posts + 8 posts written for the new site) |
| Missing posts | — | 0 |
| URLs (`/<slug>/`, 200, no redirect) | 42 | 42 |
| Title, meta description, canonical | 42 | 42 (5 WordPress posts had no meta description; Next.js uses the excerpt) |
| Publish date, author, categories | 42 | 42, all matching (the 6 "Admin" posts show "MagicWorks Host Team") |
| In sitemap and blog index | 42 | 42 |
| Featured image | 41 (2 point at a deleted attachment) | **0** |
| Images inside the article | 80 (4 are already 404 on WordPress) | **0** |
| Links inside the article | 41 in 18 posts | **0** (the text import dropped them) |
| Post-specific share image (og:image, BlogPosting image) | 42 | **0** (all used the generic card) |
| Broken pages or 404 links | — | 0 |

## The fix

`scripts/import-wordpress-media.mjs` is a second pass over `src/constants/legacy-blog-posts.json`. It leaves the text unchanged, including the edits made after the first import.

- **Images.** It downloads each featured image and article image (the full-size file) to `public/wp-content/uploads/…`, using the same path as on WordPress. The old image URLs keep working after the domain moves. That is 115 files, 5.6 MB.
- **Featured image.** Each post gets a `featuredImage` field. The post page shows it above the table of contents.
- **Article images and links.** These are written into the paragraphs:
  - `[anchor](href)` marks a link.
  - A paragraph that is only `![alt](src "WxH")` is an image.

  `src/lib/blog-content.ts` parses this markup, and `blog-post.tsx` renders it.
- **Link targets.** Links to magicworkshost.com become site-relative and point at the URL they end up on. WordPress 301s `/ssl-certificate/` to `/buy-ssl-certificate/`, so those links go straight to `/buy-ssl-certificate/`. External links open in a new tab.
- **Share image.** og:image, twitter:image and the BlogPosting `image` use the featured image. If a post has none, they use its first article image.
- **Sitemap.** The sitemap lists each post's images, as the WordPress image sitemap did.

## After the fix

Validated on a local production build:

- **Posts:** 42/42 return 200 with the correct canonical.
- **Images:** 115/115 load, both through `/_next/image` and from the original `/wp-content/uploads/` path.
- **Links:** 40/40 article links render, and all internal links return 200 with no redirect. The two external links resolve.
- **Other pages:** the blog index, the 20 category pages and the 8 original posts have no broken internal links.
- **Sitemap:** all 42 posts are listed, with 115 image entries.

## Known gaps (as on WordPress)

- **No featured image on 2 posts:** `how-to-use-wordpress-to-build-your-online-presence` and `how-to-build-e-commerce-website`. Their featured image attachment was deleted on WordPress, which shows its default social image instead. These posts keep the site's default share card.
- **4 article images missing on WordPress:** 2019/07 uploads that already return 404 there. They are left out.
- **1 link left as plain text:** "best web hosting plans" in a heading of `with-best-web-hosting-no-excuses-take-business-online`. Headings drive the table of contents and anchor IDs, so it stays plain text. The link was to `/compare-hosting-plans/`.
- **Thumbnail URLs:** WordPress's resized copies (`…-300x180.jpg`) are not served. Only the full-size file at the original path is.

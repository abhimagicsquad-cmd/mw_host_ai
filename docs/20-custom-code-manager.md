# Custom Code Manager

**Admin → Custom Code Manager** adds code, styles, tracking and verification tags to every
page of the public website, with no code change or redeploy. It works like a WordPress
"Header and Footer Code" plugin. Only **Super Admin** and **Admin** have access, through the new
`code.manage` permission; Editors don't see the section.

## Sections

| Section | Where it goes | Notes |
|---|---|---|
| **Head Code** | `<head>` | Only `<script>`, `<noscript>`, `<meta>`, `<link>` and `<style>` are accepted. Anything else is rejected on save, with a hint to use Body Start or Footer. |
| **Body Start Code** | Straight after `<body>` | Any HTML snippet. |
| **Footer Code** | Just before `</body>` | Any HTML snippet: chat widgets, marketing and conversion scripts. |
| **Custom CSS** | A keyed `<style>` in `<head>`, after the site's own CSS | Loaded once on every page. |
| **Custom JavaScript** | `next/script` (`afterInteractive`) | Runs once per page load. Plain JavaScript without `<script>` tags; it's syntax-checked on save. |
| **Tracking Scripts** | Generated for you | IDs for Google Tag Manager, GA4, Meta Pixel, Microsoft Clarity and LinkedIn Insight. |
| **Verification Codes** | `<meta>` tags in `<head>`, via Next's metadata API | Google, Bing, Facebook and Pinterest, plus any other `<meta>` tags. Paste either the code or the whole tag. |

More about where things land:

**Head Code.** Each tag is placed separately:
- `<meta>`, `<link>`, `async` external scripts and `<style>` are moved into `<head>` by React.
- Inline scripts, `<noscript>` and non-async external scripts are output as the first thing in
  `<body>`, before any page content. Analytics, pixels and JSON-LD behave the same there.
- True `<head>` placement for those would need the website and the admin dashboard to stop
  sharing the root layout.

**Tracking Scripts.**
- They run on the **live domain only**, like the existing tracking, so previews and local builds
  don't record visits.
- GA4 shares the existing `gtag.js` loader with Google Ads, so it loads once.
- Clarity starts from the site's built-in ID.
- The GTM `<noscript>` fallback goes right after `<body>`.
- Google Ads conversion tracking stays in code (`src/lib/analytics.ts`).

**Admin dashboard.** No custom code is output there, so a broken snippet can't lock admins out,
and third-party scripts never see dashboard data.

**404 pages.** Next.js embeds the root 404 page (`src/app/not-found.tsx`) in every page,
including admin URLs, where the dashboard session cookie is sent.
- The root 404 therefore renders the site chrome without any custom code; Google Ads tracking
  still runs.
- Website 404s that come from the site's own routes still run custom code, because they render
  inside the site layout.
- A "not found" inside the dashboard shows a plain admin page (`src/app/admin/not-found.tsx`).

**Every section has:**
- An **Enabled / Disabled** switch. When disabled, the section outputs nothing: no script runs and
  no style loads.
- **Save** (goes live immediately).
- **Preview on website**: your unsaved code, shown only to you, using the CMS preview mode. Use
  "Exit preview" on the website to leave.
- **Discard changes**.
- **Reset**: back to empty, or to the built-in tracking IDs. Recorded in the history, so it can be
  undone.

The code editor has:
- Syntax highlighting, line numbers and a monospace font.
- Tab-to-indent, copy and full screen.
- Formatting preserved exactly (only line endings are normalised).

## Storage (no new tables)

Everything is in the existing `settings` table:

| Key | Contents |
|---|---|
| `custom_code` | Live state of each section (`{ sections: { head: { enabled, code }, …, tracking: {…}, verification: {…} } }`) |
| `custom_code_draft` | Preview drafts (only read in preview mode) |
| `custom_code_history.<section>` | `{ versions: [...] }`, newest first, last **20** per section: date, admin, note and the full state |

The website reads `custom_code` through the cached settings read (`cms` tag). Every dashboard save
clears that cache, so changes are live on the next request. The cached read skips the history and
draft rows.

## Version history

Every save, enable/disable, reset and restore records a version. Each section's history page
offers:
- **Compare**: a line diff against the live version.
- **Restore**: makes that version live; the restore is recorded as a new version.

## Activity logs

Every action is logged under the **Custom Code** filter in Activity Logs. Examples:
- "Head Code Updated"
- "Custom CSS Disabled"
- "Footer Code Reset"
- "Tracking Scripts: Previous Version Restored (from …)"
- "Custom JavaScript Previewed (draft, not published)"

The action ids are `custom_code.updated`, `.enabled`, `.disabled`, `.reset`, `.restored` and
`.previewed`. Each entry has the section as its entity id.

## Security

- **Permission:** `code.manage` is checked on every page and every server action.
- **Server-side validation:**
  - Head Code allows only `<head>` tags, with no inline event handlers.
  - Body and Footer reject `<html>`, `<head>` and `<body>` tags.
  - CSS can't contain `<script>`, and `</style>` is neutralised.
  - JavaScript is syntax-checked.
  - Tracking IDs and verification codes must match each provider's format.
  - Size limits: 50,000 characters for Head, Body and Footer; 100,000 for CSS and JS.
- **Stored data is re-validated before it's rendered.**
- **Content Security Policy:**
  - On the public website, scripts, styles, frames, fonts, images and connections may load from
    any `https:` source, so pasted snippets work without a redeploy. The site owner chose this.
  - Still blocked: plain `http:`, `eval`, plugins (`object-src`) and other sites framing this one.
  - The admin dashboard and login page keep their strict policy.
- **The code is trusted admin content.** Only give Admin access to people you'd trust to edit the
  site's code.

## Files

- `src/lib/custom-code/`: `types.ts` (sections, defaults, keys), `validate.ts` (validation,
  Head Code parser, tracking generator, diff), `server.ts` (reads).
- `src/lib/admin/actions/custom-code.ts`: save, enable/disable, reset, restore and preview.
- `src/components/custom-code/custom-code.tsx`: website output, used by `src/app/(site)/layout.tsx`.
- `src/components/admin/code-editor.tsx` and `src/components/admin/custom-code/section-editor.tsx`.
- `src/app/admin/(panel)/code/`: dashboard pages.

## Testing

1. In Admin → Custom Code Manager → **Custom CSS**, add `body { outline: 4px solid red }` and
   click **Preview on website**. Only your preview shows the outline. Save, and it's live.
   Disable it, and it's gone.
2. In **Head Code**, add `<meta name="mwh-test" content="1">`, save, and view the page source:
   the tag is in `<head>`.
3. In **Footer Code**, add `<script>console.log("footer ok")</script>`. The message appears in
   the browser console on any page.
4. In **Custom JavaScript**, add `console.log("js ok")`. Enter `function (` and saving is refused
   with a syntax error.
5. In **Tracking Scripts**, enter your IDs and check the generated output. On the live domain, the
   scripts appear in the page.
6. In **Verification Codes**, paste the Google tag, save, and use "Verify" in Search Console.
7. In each section's history, use **Compare** and **Restore**. In **Activity Logs → Custom Code**,
   every step is listed.

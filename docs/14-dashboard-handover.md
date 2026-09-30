# MagicWorks Host dashboard — handover

The custom dashboard is the website's content management system. Content comes from three sources, in this order:

- **The dashboard.** Whatever is published there wins.
- **Sanity.** It still serves anything not yet moved into the dashboard, and remains available as a fallback.
- **The built-in defaults** in the code.

## Signing in

| | |
|---|---|
| Login page (today) | https://mw-host-ai.vercel.app/mwh-admin-login |
| Login page (after the domain moves) | https://magicworkshost.com/mwh-admin-login |
| Username | `abhiadmin` (Super Admin) |
| Password | the existing password (shared separately, never stored in this repository) |

- **Password.** Change it any time under **Profile** (top-right menu). The dashboard shows a reminder while the original password is still in use; signing in isn't blocked.
- **Sessions.** A session lasts 8 hours; **Sign out** (top-right menu) ends it.
- **Failed logins.** Five failed attempts within 15 minutes pause sign-in for that username from that network for 15 minutes. Every sign-in and failed attempt is recorded under **Activity Logs**.
- **Adding people.** Go to **Users → Admin Users**. Choose a role:
  - **Editor:** pages and content.
  - **Admin:** everything except users.
  - **Super Admin:** everything.

  New users get a temporary password, and the dashboard reminds them to change it.

## Everyday tasks

| Task | Where |
|---|---|
| Edit the home page, company pages, services, legal pages, the knowledge base, blog posts or promotions | **Content →** the matching section, then open the page |
| Build or rearrange a page | **Pages → All Pages**, open a page, then add, reorder, hide or duplicate sections |
| Create a new page | **Pages → Add New Page**. Pick the URL; template URLs such as `/blog/…` or `/hosting/…` get the right layout automatically |
| Change prices or plans | **Content → Pricing Plans**. The site keeps its built-in prices until **Use these plans on the website** is ticked |
| Upload images and files | **Media Library → Upload Media**, then pick them from any image field |
| Page titles, descriptions, share images and structured data | **SEO → Meta Titles / Meta Descriptions / Open Graph / Schema** |
| Header and footer links | **Menus → Header Menu / Footer Menu** |
| Phone, email, address, office hours | **Settings → General Settings**. Now set to +91 9764746633 / sales@magicworkshost.com, matching magicworkshost.com |
| Social profiles, header button, default SEO | **Settings → Website Settings** |
| Enquiries from the website forms | **Forms → Leads / Form Entries** |
| See who changed what | **Activity Logs** |

**Drafts and publishing.**

- **Drafts stay private.** A page is visible to visitors only once it is **Published**, and saving a draft never changes the live site.
- **Preview.** Use **Preview** to see a draft on the real site. A banner marks preview mode, and **Exit preview** leaves it.
- **Unpublish.** Unpublishing a page returns its URL to the previous (Sanity or built-in) content.
- **Timing.** Changes appear on the live site within seconds of publishing. If something looks stale, use **Clear website cache** on the Dashboard home screen.

**Testimonials** are the four real customer testimonials from magicworkshost.com. The photos are in **Media Library → Images**. Edit them in the Testimonials section of the home page, or add them to other pages.

## Environment variables (Vercel → Project → Settings → Environment Variables)

| Variable | Status | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | set | Dashboard database, media storage, form entries |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`, `SANITY_API_TOKEN` | set | Sanity fallback content |
| `SANITY_REVALIDATE_SECRET` | set | Must match the secret in Sanity's webhook (Sanity → API → Webhooks → `https://<domain>/api/revalidate`) |
| `RESEND_API_KEY` | set | Lead, quote and newsletter notification emails (Resend) |
| `ADMIN_NOTIFICATION_EMAIL` | optional | Who receives notifications. Defaults to abhimagicsquad@gmail.com; comma-separate several |
| `EMAIL_FROM_ADDRESS` | **set after the Resend domain is verified** | e.g. `MagicWorks Host <notifications@magicworkshost.com>`. Until then mail comes from Resend's test sender, which only reaches the Resend account owner's address |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | **to add** | Cloudflare Turnstile anti-spam on the lead, quote and newsletter forms. Create a widget for `magicworkshost.com` at dash.cloudflare.com → Turnstile. Until both are set, the forms use honeypot, fill-time and rate-limit protection only |
| `ADMIN_SESSION_SECRET` | recommended | A long random value (`openssl rand -base64 48`). Without it the session key is derived from the Supabase key |
| `NEXT_PUBLIC_BILLING_URL` | optional | Only if the WHMCS install moves from `https://www.magicworkshost.com/clients` |
| `ADMIN_BOOTSTRAP_USERNAME`, `ADMIN_BOOTSTRAP_PASSWORD` | leave empty in production | Break-glass login that only works while no dashboard users exist |

## Launch steps

1. **Merge and deploy.** Merge PR #2 (content migration), then PR #3 (launch readiness), into `main`. Vercel deploys `main` to production.
2. **Publish the migrated content in the dashboard:**
   1. **Content → Pricing Plans:** tick **Use these plans on the website**.
   2. **Pages → Draft Pages:** preview, then publish.
   3. **Content Migration:** copy the menus.
3. **Add the domain.** In Vercel, add `magicworkshost.com` to the project.
4. **Move DNS for the apex only.** Point `magicworkshost.com` at Vercel as Vercel instructs (A `76.76.21.21`, or its current value).
   - **Leave `www` on the current server.** WHMCS billing, login and checkout live at `www.magicworkshost.com/clients`.
   - **Stop the www redirect for `/clients`.** Before switching, make sure the current server no longer redirects `www` to the apex for `/clients` paths.
5. **Configure services:**
   - Add the Turnstile keys (and `ADMIN_SESSION_SECRET`), then redeploy.
   - In Sanity, update the webhook URL to the new domain.
   - **Verify the email domain in Resend.** Add the records below in the DNS zone for magicworkshost.com (cPanel → Zone Editor on ns1/ns2.magicworkshost.com). They add new names only and don't change the existing MX, SPF or DMARC records. When Resend shows **Verified**, set `EMAIL_FROM_ADDRESS` and redeploy.

     | Type | Name | Value | Priority |
     |---|---|---|---|
     | TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC8Qm8WCJTjJJiNcp4+Ycjqr2DZNEh4lzSDsWp6i+Qj+0o7h6W9vU1VBcxIdErs4y2tS1jMB967yYiETREnDHBaTHQkilbiBjnbRSc33R2Ih1084MR+BhH2VcKDskQhmrXGvg5x93alBJhpo/NN+H1jMUytwPr/aIXn92Lv1XxnXwIDAQAB` | |
     | MX | `send` | `feedback-smtp.us-east-1.amazonses.com` | 10 |
     | TXT | `send` | `v=spf1 include:amazonses.com ~all` | |
     | CNAME | `rsend` | `send.forge.rmta.net` | |

     Don't set an `@magicworkshost.com` sender before verification: the domain's DMARC policy is `p=reject`, so unsigned mail would be rejected.
6. **After the switch:**
   - Submit `https://magicworkshost.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
   - Spot-check a few old WordPress URLs. All 109 load at the same URL; the map is in `src/lib/public-paths.ts` and the table is in `docs/15-url-parity.md`.
   - Submit a test enquiry and confirm it arrives at abhimagicsquad@gmail.com.

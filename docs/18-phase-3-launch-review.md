# Phase 3: final launch review

Branch `feature/launch-readiness`, reviewed on 5 October 2026 on top of 6ea9b4f. Nothing was
deployed. Every result below comes from a local `next build && next start` that reads the
production dashboard database.

## 1. What changed

### Trust claims

**Rule:** a claim stays only if the site's own published plans, policies or the imported
WordPress content support it. Where they disagree, the published terms win.

| Claim (before) | Where | Evidence | Now |
|---|---|---|---|
| "99.98% uptime, last 90 days" | Hero illustration on the home, hosting, VPS and CMS hero pages | No monitoring source | "99.9% uptime SLA" (Service Level Agreement) |
| "12,000+ businesses hosted" | Home (×3), About, hero illustration | None | Removed; "Since 2012" or "India & USA data centres" instead |
| "0.7s avg. load time" | Home, hosting/*, hero illustration | On WordPress it was an illustrative before/after, not a measurement | Removed |
| "+1000% potential traffic lift" | Home stats | Illustrative only | "NVMe storage on shared hosting" |
| "Save up to 30% on annual plans — limited time" | Home banner | 30% is the 3-year discount; 1 year is 15% (`src/lib/billing.ts`); no end date exists | "Save up to 30% … with a 3-year plan" |
| "30-day money-back guarantee" on every plan | Footer (every page), home FAQ, About, hosting FAQ | Terms of Service: new **shared hosting** customers only; domain, SSL and server setup fees are non-refundable | Scoped to new shared hosting |
| "Free SSL on every plan" | Footer, hero illustration | Shown on shared, SSL and dedicated plans; VPS plan cards don't list it | "Free SSL with shared hosting" |
| "NVMe on every plan / every tier" | Home, About, trust highlights, server illustration | Dedicated plans list "1TB HDD" | Scoped to shared hosting |
| "No surprise renewal hikes" / "price you see is the price you pay" | About, home | Terms: introductory pricing covers the first term only | "Renewal prices shown up front" |
| "Sales and support run seven days a week" | About | Sales hours are Mon–Sat 9:30–6:30 IST | "Support runs 24/7; sales Monday to Saturday" |
| "Provisioned within 5 minutes" | Home FAQ | None | "Usually set up shortly after payment"; VPS and dedicated "within 24 hours" (plan cards) |
| VPS "Provisioning < 1 hr" | VPS hero | Plan cards: "Delivery within 24 hours" | "< 24 hrs" |
| Managed dedicated "< 48 hrs" | Dedicated hero | Plan cards: "Delivery within 24 hours" | "< 24 hrs" |
| "5 dedicated IPs" | Dedicated pages and illustration | Plan cards: "4 dedicated IP addresses" | "4" |
| VPS CPU/RAM "never shared with other tenants" | VPS, cloud page, VPS answer | Resource Abuse Policy: "equal share of CPU … 700MHz guaranteed" | "Guaranteed CPU and RAM allocation" |
| "Instant upgrades" | VPS | The same page says "minimal downtime" | "Easy upgrades" / "Tier upgrades" |
| "A+ SSL Labs grade" | /ssl and the SSL illustration | None; the grade depends on server setup, not the certificate | "DV · OV · EV validation levels" |
| "99.7% spam & malware caught" | Email pages | None | "Spam & malware filter: Included" |
| "Priority support included" | Both email pages | Enterprise only | "24/7 phone & ticket support" |
| "Propagation < 24 hrs"; "WHOIS privacy: Free" | Domain pages | Domain copy says "on supported TLDs" | "24–48 hrs"; "WHOIS privacy, supported TLDs" |
| Affiliate "90-day cookie", "paid monthly", "link within a day" | Affiliate page, illustration, thank-you page | Affiliate Programme Terms: 60-day cookie, weekly payout cycle, review "in up to two business days" | Aligned with the terms |
| "Daily backup snapshots", "daily malware scanning" | Home trust highlights, About | JetBackup is confirmed; "daily" and scanning are not | "Free JetBackup backups" |

**Kept as verified:** 99.9% uptime SLA (`/legal/service-level-agreement`); since 2012; 24/7 phone
and ticket support; India and USA data centres; the 4 WordPress testimonials; the "Trusted by"
logos (from WordPress).

**Checked and absent:** no `aggregateRating`, review stars, awards or certifications appear
anywhere in code or JSON-LD.

### Content
- **Leaked WordPress widgets.** Two imported posts (`/how-to-build-e-commerce-website/` and
  `/how-to-use-wordpress-to-build-your-online-presence/`) carried the old site's sidebar and
  footer widgets as article sections: Categories, Recent Posts, the call box and the policy
  links. That included raw script text (`document.getElementById("ak_js_1")…`), which also
  caused horizontal scrolling on phones. Removed. `scripts/import-wordpress-posts.mjs` now stops
  at those headings, so a re-import can't bring them back.
- **Post excerpts.** Typos fixed in 9 excerpts, which also serve as meta descriptions
  ("choosen", "thef", "Woried", "Wandering", "Magicworkhost", missing spaces).
- **Terminology.**
  - "Extended Validated" is now "Extended Validation" (URLs unchanged).
  - "Magic Host packages" is now "MagicWorks Host packages".
  - "MagicWorksHost" / "MagicWorks hosting" is now "MagicWorks Host".
  - "Full root-level cPanel" is now "Full cPanel access".
  - "Transfer of domain notes" is now "Domain transfer notes".
  - "Learn more about wordpress" is now "WordPress".
- **Contradiction.** The domain transfer time read 5–7 days in one block and 1–7 days in another
  on the same page. It now reads 1–7 days in both.
- **Policy typos.** Fixed: "desctructive", "alloted", "it's" and a missing space.
- **Testimonial.** "Definately" is now "Definitely". Otherwise customer wording is unchanged.

### Mobile / responsive
- **1024px overflow (every page).** The footer email address set the contact column's minimum
  width, causing 16px of horizontal scroll. The address can now wrap, after the "@" by
  preference, and between 1024 and 1279px the contact column gets a slightly wider share of
  the grid.
- **1024–1279px newsletter.** The email input was crushed to about 60px. The input and button
  now stack in that width band.
- **360/390px blog overflow.** Caused by the leaked script text; fixed (see Content).

### Lead forms
- **Lost retries.** If saving a lead failed, a retry within 60 seconds was treated as a duplicate:
  it got a success message but was neither stored nor emailed. The duplicate key is now released
  when the save fails.
- **Quote form length.** The quote form allowed a 2,000-character brief, but the API rejected
  anything over 1,000 with a generic error. The API now accepts 2,000.
- **Phone numbers.** Autofilled or pasted `+91 98765 43210`, `+919876543210` and `098765 43210`
  were cut to the wrong 10 digits. They now normalise to `9876543210`. Verified in a browser.
- **Auto popup.** It no longer opens on `/contact-us/`, `/become-our-affiliate/` or the thank-you
  pages, or while focus is anywhere inside a form. A successful submission also stops it for the
  rest of the session. Verified in a browser: it doesn't open on contact or thank-you, and still
  opens on `/vps-hosting/`.
- **Error messages.** Every failure message now gives the phone number (and the email address
  where there's room).
- **Thank-you redirect.** It goes straight to `/thank-you/`, without the trailing-slash
  redirect hop.

### Build stability
- **Footer type check.** `next build` intermittently failed its type check on the footer's
  `withAddedFooterLinks(...)` call: TypeScript inferred the generic from two branches, and which
  branch it picked depended on internal type order. The type argument is now explicit
  (`<NavColumn>`).

## 2. Verification (5 October 2026)

| Check | Result |
|---|---|
| `npm run lint` / `npm run typecheck` / `npm run build` | Pass / pass / pass |
| Responsive crawl: 150 sitemap pages × 360, 390, 768, 1024, 1280 and 1440px (900 page loads) | 0 horizontal overflow, 0 non-200, 0 JS errors, exactly one H1 on every page (before the fixes: 154 overflow failures) |
| Metadata | 150/150 have a title, description and self-canonical; 0 duplicate titles; descriptions 70–160 characters once entities are decoded; 0 noindex pages in the sitemap |
| Internal links (every unique internal href on the 150 pages) | 150 checked, all 200 with no redirect |
| JSON-LD | 333 blocks, 0 parse errors. Includes BreadcrumbList 149, BlogPosting 50, FAQPage 52, HowTo 30, Product 25, TechArticle 15 and Organization/LocalBusiness/WebSite |
| Lighthouse desktop (8 templates) | Performance 99–100; accessibility, best practices and SEO 100 |
| Lighthouse mobile (8 templates; the home page measured 4 times) | Performance 79–92 (home 85–87 on warm runs); accessibility, best practices and SEO 100; CLS 0 |

Mobile performance is held back by the JavaScript cost of the interactive header, menu and
accordions under Lighthouse's simulated slow-4G. This matches `docs/13-launch-readiness.md`.

## 3. Owner actions before or soon after launch

These items need business confirmation or dashboard access; none can be settled from the code.

1. **Dashboard menus.** The live nav and footer come from the dashboard and still say
   "Knowledgebase" and "Blogs". Rename them to "Knowledge Base" and "Blog" (the code fallbacks
   are already fixed).
2. **Free migration on annual plans.** It's claimed across the home, hosting, services and KB
   pages, but no published source confirms it. Confirm it, or tell us to remove it.
3. **Security and maintenance pages.** They say "daily malware scanning", "server-level
   hardening" and "daily JetBackup snapshots". Confirm the tools and frequency.
4. **VPS plans.** The plan cards say "Managed support", but the FAQ says the customer administers
   the server. Confirm which is true. Also confirm that VPS storage is NVMe (the cards say "SSD").
5. **"10X faster" headline** (from WordPress). State what the comparison is against, or soften it.
6. **Affiliate "<7% customer churn"** (from WordPress). Confirm it's current, or remove it.
7. **SSL claims.** The EV "$250,000 warranty" and "issued within minutes" depend on the
   certificate vendor. Confirm both.
8. **`/50-off/` promo.** Its end date was 30 September 2026. The countdown hides itself, but the
   page still says "Limited-time offer". Extend `endsAt` or retire the offer.
9. **Legal pages.** `src/constants/legal-content.ts` still describes itself as placeholder copy
   that has not had legal review. The money-back and renewal wording on the site now follows it,
   so have it reviewed.
10. **Google Ads.** The thank-you page fires a conversion on every load, as WordPress did. Set the
    conversion action to count "One" per click so reloads aren't counted twice.

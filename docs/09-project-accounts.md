# Project Accounts — GitHub, Sanity, Vercel

Status of the external service connections for this repo, and what's still needed before Sanity content/schemas can go live. All three accounts are under **abhimagicsquad@gmail.com**.

## Connected

| Service | Account | Project | Notes |
|---|---|---|---|
| GitHub | `abhimagicsquad-cmd` | [`mw_host_ai`](https://github.com/abhimagicsquad-cmd/mw_host_ai) | Public repo, was empty — pushed the initial commit (UI foundation) to `main`. |
| Sanity | `abhimagicsquad@gmail.com` (GitHub OAuth) | `mw_host_ai` — project ID **`uf33qaon`** | Dataset: `production`. CORS allowlist: `http://localhost:3333`, `http://localhost:3000`, `https://mw-host-ai.vercel.app`. |
| Vercel | `abhimagicsquad-cmd` (team `mw-host`) | `mw-host-ai` | Framework preset: Next.js. Git-connected to the GitHub repo above — pushing to `main` auto-deploys to Production. First deploy live at https://mw-host-ai.vercel.app (verified 200, header/footer render). |

**Note:** the CLIs on this machine were originally logged in as a different account (`magicabhi1234`) with two unrelated projects (`OMC Test`/`OMC CMS` on Sanity, `omc-2-0`/`omc-test-studio` on Vercel) — those were left untouched. All three CLIs were logged out and re-authenticated as `abhimagicsquad-cmd`/`abhimagicsquad@gmail.com` before anything below was connected.

## Environment variables

Set on Vercel (Production + Preview + Development) and mirrored in `.env.local` (gitignored) / `.env.local.example` (committed, no secrets):

- `NEXT_PUBLIC_SANITY_PROJECT_ID=uf33qaon`
- `NEXT_PUBLIC_SANITY_DATASET=production`
- `NEXT_PUBLIC_SANITY_API_VERSION=2025-01-01`

## Not yet set up — needs a decision or a real secret

Per "do not invent values," these were left blank rather than guessed:

- **`SANITY_API_TOKEN`** — needed once `app/api/revalidate` or any server-side Sanity write exists. Generate at `sanity.io/manage` → project `uf33qaon` → API → Tokens (Editor, or Viewer if read-only is enough).
- **`SANITY_REVALIDATE_SECRET`** — any random string, shared between the webhook config and the revalidate route handler; can be generated when that route is built.
- **Email provider** (`lib/email.ts`) — not chosen yet; architecture doc suggests Resend but no account/key exists for this project.
- **Captcha** (`NEXT_PUBLIC_CAPTCHA_SITE_KEY` / `CAPTCHA_SECRET_KEY`) — provider not chosen (reCAPTCHA v3 vs. Cloudflare Turnstile per `06-ai-native-upgrade-recommendations.md`).
- **Custom domain** — Vercel project currently only has its default `mw-host-ai.vercel.app` domain; no custom domain (e.g. magicworkshost.com) is attached.

**Sanity Studio — now implemented.** Schema code lives at `src/sanity/schemaTypes/`, the Studio is served from `/studio`, and `src/sanity/lib/queries.ts` fetches content for pages. Pages fall back to their hardcoded defaults until an editor populates the corresponding document in Studio, so no visual change ships until content is entered.

## Supabase

**Schema/integration code now exists, but no project is connected yet.** `/api/leads` inserts into a `leads` table via `src/lib/leads-store.ts` using the service role key (server-only). The table definition is at `supabase/migrations/0001_create_leads.sql` — run it against a real Supabase project, then set `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` (see `.env.local.example`). Until those are set, storage is skipped (logged, not treated as an error) and the pipeline stays email-only, matching prior behavior.

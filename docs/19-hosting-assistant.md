# MW Host Hosting Assistant

The website chat is a first-party **Hosting & Website Solutions Assistant**, managed in
**Admin → Hosting Assistant**. It replaced the Tidio widget the WordPress site ran. It doesn't use
OpenAI or any external AI: answers come from your FAQs, keyword matching and a recommendation flow
you configure.

## Setup (one time)

1. Run `supabase/migrations/0006_create_hosting_assistant.sql` in the Supabase SQL editor. It creates
   the FAQ, plan, conversation and message tables.
2. **Admin → Hosting Assistant → FAQs → Import website FAQs.** This copies the questions already
   answered on the product, service and Knowledge Base pages in as drafts. Review them and publish
   the ones you want, then add your own.
3. **Hosting Plans → Import website pricing.** This copies the published shared, WordPress, VPS and
   cloud plans from Content → Pricing Plans. Then add maintenance plans and fill in any missing
   monthly or yearly prices.
4. **Settings:** check the welcome message, colours, quick actions, conversation starters and the
   recommendation flow, then click **Preview Chatbot**.
5. Switch **Hosting Assistant Status** to **ON**. The widget appears on the website on the next
   page load. No redeploy is needed.

Until step 1 is done, the ON/OFF switch, settings, preview and recommendation flow still work.
Conversations aren't stored, and the FAQ and plan lists are empty, so the assistant offers the
enquiry form instead.

## Who can manage it

The new `assistant.manage` permission belongs to **Super Admin** and **Admin**. Editors don't
see the section.

Every change is written to **Activity Logs** under the "Hosting Assistant" filter:
- Assistant enabled or disabled.
- Settings, quick actions, starters or flow saved.
- Plans and FAQs added, edited, deleted or imported.
- Leads captured by the assistant.

## How it works

| Piece | Where |
|---|---|
| Settings, quick actions, starters, flow, ON/OFF | `settings` table, key `chatbot` (one JSON document, like Pricing Plans) |
| FAQs, plans | `chatbot_faqs`, `chatbot_plans` |
| Conversations / transcripts | `chatbot_conversations`, `chatbot_messages` (analytics are computed from these) |
| Enquiries | the existing **Leads** (`source = hosting-assistant`) via `/api/leads`: same email notification, Turnstile, honeypot and rate limit; linked to the conversation |
| Website widget | `src/components/assistant/*`, mounted in `src/app/(site)/layout.tsx` |
| Engine | `src/lib/assistant/engine.ts` (pure, no I/O) |
| Public API | `POST /api/assistant` |
| Dashboard | `src/app/admin/(panel)/assistant/*`, `src/lib/admin/actions/assistant.ts` |

**OFF means no code on the page.** When the assistant is OFF, the server renders nothing, so no
widget JavaScript is loaded. When it's ON, only the small launcher button loads at first; the chat
window's code loads on the first click. The setting is read through the website cache, which every
dashboard save clears.

**How a message is answered:**
1. "Which plan…" / "need hosting" starts the recommendation flow.
2. An exact FAQ question match.
3. A keyword or wording match.
4. A pricing question about a category that has plans shows those plans.
5. Quote, callback or contact requests show the enquiry form.
6. Otherwise: "I couldn't find an exact answer. Would you like our team to contact you?", with
   related FAQs and the enquiry form.

**Recommendation flow:**
- Each answer can point at a plan category (Shared < WordPress < VPS < Cloud; the largest one
  chosen wins) and a size (1–3; the largest wins).
- The plan is the active plan at that size in **display order** within the category. The next
  plan is shown as an alternative.
- Answer notes are shown with the recommendation.
- With no plans in the category, it asks for a quote instead.

**Security:**
- `/api/assistant` only accepts same-origin requests.
- Input is checked against a strict schema; messages are limited to 500 characters and control
  characters are removed.
- Rate limits per IP: 40 requests a minute and 400 an hour. 15 new stored chats an hour.
- A conversation is capped at 300 messages.
- Recommendation answers are re-checked against the flow on the server.
- Replies are rendered as text, never HTML.
- The new tables are only readable by the server (row-level security, no policies).

## Adding AI later

`respond()` in `engine.ts` takes a list of `AssistantResponder`s. They run after the FAQ engine
finds no confident answer, and before the fallback. To add an AI responder, write a class with
`respond({ text, kb })` that returns an `EngineResult` (replies + messages to log), or `null` to
pass, and add it to the `respond(event, kb, [aiResponder])` call in `/api/assistant`.

It gets the same settings, FAQs and plans. Its replies use the same block types: text, plans, lead
form and suggestions. So the widget, storage, analytics and lead capture need no changes.

AI lead qualification can do the same: return a `lead_form` block with a prefilled requirement.

## Testing

**Turned off (the default until switched on):**
- The website shows no chat button.
- Page source contains no assistant or Tidio code.

**Preview:**
- In Admin → Hosting Assistant, click **Preview Chatbot**.
- Try a quick action, a typed question and the full recommendation flow.
- Previews aren't stored, and preview enquiries are validated but not sent.

**On the website, after switching it ON:**
1. Click the chat button (bottom right). Check the welcome message, starters and quick actions.
2. Type a question from your FAQs and check the answer and related questions.
3. Click **Hosting Plans** and answer every question. Check the recommended plan card.
4. Ask "how much does VPS cost". You should see the plans with prices, or the enquiry form.
5. Ask something unrelated, e.g. "do you sell mugs". You should see the fallback message and the
   enquiry form.
6. Submit the enquiry form once with your own details. Check:
   - It appears in **Forms → Leads** (source `hosting-assistant`).
   - The notification email arrives.
   - The conversation shows **Lead generated: Yes**.
7. Reload the page; the chat is still there. Minimize it, then reopen it.
8. Check **Conversations** (search, the lead filter and the transcript) and **Analytics**.
9. Switch it **OFF**. The chat button disappears on the next page load.

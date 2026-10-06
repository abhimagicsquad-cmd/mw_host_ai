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
| Settings, quick actions, starters, conversation flows, plan recommendation, ON/OFF | `settings` table, key `chatbot` (one JSON document, like Pricing Plans) |
| FAQs, plans | `chatbot_faqs`, `chatbot_plans` |
| Conversations / transcripts | `chatbot_conversations`, `chatbot_messages` (analytics are computed from these) |
| Enquiries | the existing **Leads** (`source = hosting-assistant`), through the same lead pipeline as the website forms (`src/lib/lead-delivery.ts`): duplicate guard, Supabase, email notification; Turnstile when configured. Linked to the conversation and logged in Activity Logs |
| Website widget | `src/components/assistant/*`, mounted in `src/app/(site)/layout.tsx` |
| Engine | `src/lib/assistant/engine.ts` (pure, no I/O) |
| Public API | `POST /api/assistant` |
| Dashboard | `src/app/admin/(panel)/assistant/*`, `src/lib/admin/actions/assistant.ts` |

**OFF means no code on the page.** When the assistant is OFF, the server renders nothing, so no
widget JavaScript is loaded. When it's ON, only the small launcher button loads at first; the chat
window's code loads on the first click. The setting is read through the website cache, which every
dashboard save clears.

**A conversation, not a form.** Every reply is chat text, plan cards and buttons that continue the
conversation. There are no contact, quote or callback forms in the chat.

When a visitor wants the team (a "Talk to an expert" button, a quote or callback request), the
assistant asks for their **name**, then **email**, then **phone**, then **requirement**, one
message at a time:
- Each answer is checked as it arrives.
- A question asked midway is answered, and then the capture picks up again.
- Typing "cancel" stops it.
- The lead is sent through the normal lead pipeline, and the conversation carries on.

**Conversation Flows** (Admin → Hosting Assistant → Conversation Flows) are guided conversations.
Each flow has:
- A name.
- Triggers: words that start it when typed.
- Steps: a message with up to 8 buttons.

A button can:
- Go to another step, or start another flow.
- Run the plan recommendation, or show plans.
- Answer a question from the FAQs.
- Connect the visitor with the team.
- Open a page.

Quick actions and conversation starters usually start a flow. The flow with the id `menu` is the
assistant's list of main topics.

Default flows: Main topics, Need Hosting, Need a Faster Website, VPS Hosting, Cloud Hosting,
Domain Registration, SSL Certificates, Website Maintenance, Website Development, Website Migration
and Contact Support.

**How a typed message is answered:**
1. Exact FAQ question match.
2. Greetings and thanks.
3. "Which plan / recommend": the plan recommendation.
4. A pricing question about a plan category shows its plans.
5. Keyword or wording FAQ match. The answer is followed by "You may also be interested in" topic
   buttons and related questions.
6. Quote, callback or "talk to someone": the conversational capture.
7. A conversation flow whose trigger matches.
8. Otherwise, the first time, a guided list of topics. Only a second miss in a row says "I
   couldn't find an exact answer — would you like our team to contact you?", with buttons.
   Quick actions never end there.

**Plan recommendation:**
- Questions: website type, monthly visitors, email, migration.
- Each answer can point at a plan category (Shared < WordPress < VPS < Cloud; the largest one
  chosen wins) and a size (1–3; the largest wins).
- The plan is the active plan at that size in **display order** within the category. The next
  plan is shown as an alternative.
- The result is plan cards (name, price, features, button), any answer notes, and buttons: talk
  to an expert, compare all plans, start over.
- With no plans in the category, it links to that category's page and offers the team.

**Security:**
- `/api/assistant` only accepts same-origin requests.
- Input is checked against a strict schema: messages are limited to 500 characters, and control
  characters are removed.
- The conversation state the widget sends back is re-checked: button choices against the
  configured flows, captured details field by field and again as a whole lead.
- Rate limits per IP: 40 requests a minute, 400 an hour, 15 new stored chats an hour and 5 sent
  enquiries per 10 minutes.
- A conversation is capped at 300 messages.
- Replies are rendered as text, never HTML.
- The new tables are only readable by the server (row-level security, no policies).

## Adding AI later

`respond()` in `engine.ts` takes a list of `AssistantResponder`s. They run after the FAQ engine,
intents and flow triggers find nothing, before the guided fallback. To add an AI responder, write
a class with `respond({ text, kb, state })` that returns an `EngineResult` (replies + messages to
log + next state), or `null` to pass, and add it to the `respond(event, kb, state, [aiResponder])`
call in `/api/assistant`.

It gets the same settings, flows, FAQs and plans, and replies with the same blocks: text, buttons,
plans and suggestions. So the widget, storage, analytics and lead capture need no changes. For AI
lead qualification, return the `startCapture(...)` result with a qualified requirement as context.

## Testing

**Turned off (the default until switched on):**
- The website shows no chat button.
- Page source contains no assistant or Tidio code.

**Preview:**
- In Admin → Hosting Assistant, click **Preview Chatbot**.
- Try every quick action, a typed question, the plan recommendation and "Talk to an expert".
- Previews aren't stored, and details collected in the preview are checked but never sent.

**On the website, after switching it ON:**
1. Click the chat button (bottom right). Check the welcome message, starters and quick actions.
2. Click each quick action. Each one should start a conversation with buttons, never the
   "couldn't find" message.
3. Type a question from your FAQs. Check the answer, the related topics and the related questions.
4. Click **Hosting Plans** and answer every question. Check the plan cards and the follow-up
   buttons.
5. Type "my website is slow": the speed flow should start. Then type something unrelated twice:
   first the topics list, then the offer to contact the team.
6. Click **Talk to an expert** and answer name, email, phone and requirement in the chat. Then
   check:
   - The lead appears in **Forms → Leads** (source `hosting-assistant`).
   - The notification email arrives.
   - The conversation shows **Lead generated: Yes**.
7. Reload the page; the chat is still there. Minimize it, then reopen it.
8. Check **Conversations** (search, the lead filter and the transcript) and **Analytics**.
9. Switch it **OFF**. The chat button disappears on the next page load.

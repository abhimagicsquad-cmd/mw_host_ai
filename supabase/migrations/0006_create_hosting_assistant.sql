-- MW Host Hosting Assistant (website chat widget managed from Admin → Hosting Assistant).
--
-- Reuses existing structures instead of duplicating them:
--   * settings (key 'chatbot')  — on/off, appearance, quick actions, conversation starters and
--                                 the recommendation flow (small, ordered, edited as one document,
--                                 like the Pricing Plans collection).
--   * leads                     — assistant enquiries are ordinary leads (source 'hosting-assistant')
--                                 created through /api/leads, so notifications and the Leads screen
--                                 work unchanged. Conversations link to them.
--   * activity_logs             — every admin change is logged there.
--
-- New tables: FAQs and plans (the assistant's own knowledge, row-level CRUD), and the stored
-- conversations with their messages (analytics are computed from the messages).
-- Additive and safe to re-run. Run in the Supabase SQL editor.

create table if not exists public.chatbot_faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null check (char_length(question) between 3 and 300),
  answer text not null check (char_length(answer) between 1 and 4000),
  category text not null default 'general',
  keywords text[] not null default '{}',
  status text not null default 'published' check (status in ('published', 'draft')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists chatbot_faqs_status_idx on public.chatbot_faqs (status);
create index if not exists chatbot_faqs_category_idx on public.chatbot_faqs (category);

create table if not exists public.chatbot_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  category text not null check (category in ('shared', 'wordpress', 'vps', 'cloud', 'maintenance')),
  currency text not null default 'INR' check (currency in ('INR', 'USD')),
  monthly_price numeric(12, 2) check (monthly_price is null or monthly_price >= 0),
  yearly_price numeric(12, 2) check (yearly_price is null or yearly_price >= 0),
  features text[] not null default '{}',
  is_popular boolean not null default false,
  cta_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists chatbot_plans_category_idx on public.chatbot_plans (category, sort_order);

create table if not exists public.chatbot_conversations (
  id uuid primary key default gen_random_uuid(),
  -- Random id the widget keeps in the visitor's browser; not linked to any personal data.
  visitor_id text not null check (visitor_id ~ '^[A-Za-z0-9_-]{8,64}$'),
  started_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  message_count integer not null default 0,
  lead_id uuid references public.leads (id) on delete set null,
  page_url text
);
create index if not exists chatbot_conversations_started_idx on public.chatbot_conversations (started_at desc);
create index if not exists chatbot_conversations_visitor_idx on public.chatbot_conversations (visitor_id);
create index if not exists chatbot_conversations_lead_idx on public.chatbot_conversations (lead_id) where lead_id is not null;

create table if not exists public.chatbot_messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.chatbot_conversations (id) on delete cascade,
  role text not null check (role in ('visitor', 'assistant')),
  -- text, quick_action, flow_answer, faq_answer, fallback, recommendation, plans, lead_prompt, lead_captured
  kind text not null default 'text',
  body text not null check (char_length(body) <= 4000),
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index if not exists chatbot_messages_conversation_idx on public.chatbot_messages (conversation_id, id);
create index if not exists chatbot_messages_kind_idx on public.chatbot_messages (kind, created_at desc);

-- Same model as the other CMS tables: no policies, so only the server (service role) can read
-- or write. The widget talks to /api/assistant, never to Supabase directly.
alter table public.chatbot_faqs enable row level security;
alter table public.chatbot_plans enable row level security;
alter table public.chatbot_conversations enable row level security;
alter table public.chatbot_messages enable row level security;

notify pgrst, 'reload schema';

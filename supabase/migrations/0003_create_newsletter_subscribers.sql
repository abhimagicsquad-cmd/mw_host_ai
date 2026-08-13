-- Newsletter subscribers captured from the footer signup form. Written only by the server
-- (service role key) from /api/newsletter — RLS stays enabled with zero policies, mirroring
-- 0001_create_leads.sql and 0002_create_orders.sql.
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique,
  source text,
  page_url text
);

create index if not exists newsletter_subscribers_created_at_idx on public.newsletter_subscribers (created_at desc);

alter table public.newsletter_subscribers enable row level security;
-- No policies are defined: only requests using the service role key (server-side only,
-- via SUPABASE_SERVICE_ROLE_KEY) can read or write this table.

-- Mock orders captured from the /order/[planSlug] checkout flow. There is no live payment
-- gateway wired up yet — status is always 'mock_paid' after the simulated payment step.
-- Written only by the server (service role key) from /api/orders — RLS stays enabled with
-- zero policies so anon/public clients have no access, mirroring 0001_create_leads.sql.
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  order_ref text not null unique,
  plan_slug text not null,
  plan_name text not null,
  billing_cycle text not null,
  billing_label text not null,
  amount text not null,
  name text not null,
  email text not null,
  phone text not null,
  company text,
  status text not null default 'mock_paid',
  source text,
  page_url text
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_email_idx on public.orders (email);
create index if not exists orders_order_ref_idx on public.orders (order_ref);

alter table public.orders enable row level security;
-- No policies are defined: only requests using the service role key (server-side only,
-- via SUPABASE_SERVICE_ROLE_KEY) can read or write this table.

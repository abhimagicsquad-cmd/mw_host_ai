-- Leads captured from every lead-generation form on the site (header/footer popups,
-- contact page, get-quote form). Written only by the server (service role key) from
-- /api/leads — RLS stays enabled with zero policies so anon/public clients have no access.
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  email text not null,
  message text,
  source text,
  service text,
  company text,
  hosting_type text,
  page_url text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_email_idx on public.leads (email);

alter table public.leads enable row level security;
-- No policies are defined: only requests using the service role key (server-side only,
-- via SUPABASE_SERVICE_ROLE_KEY) can read or write this table.

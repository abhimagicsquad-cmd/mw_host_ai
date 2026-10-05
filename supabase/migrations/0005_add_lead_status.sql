-- Lead status for the dashboard's Leads screen (bulk status change).
-- Additive and safe to re-run: existing leads become 'new'; nothing else changes.
-- Run in the Supabase SQL editor. Until it runs, the Leads screen hides status and says so.

alter table public.leads
  add column if not exists status text not null default 'new';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'leads_status_check') then
    alter table public.leads
      add constraint leads_status_check check (status in ('new', 'contacted', 'qualified', 'won', 'lost'));
  end if;
end $$;

create index if not exists leads_status_idx on public.leads (status);

-- Refresh PostgREST's schema cache so the API sees the new column immediately.
notify pgrst, 'reload schema';

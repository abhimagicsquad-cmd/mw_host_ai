-- Two-factor authentication (TOTP) for the admin dashboard.
--
-- Reuses existing structures:
--   * users          — the TOTP secret (AES-256-GCM encrypted by the app, never plaintext),
--                      the secret being set up, and the last accepted time step (replay guard).
--   * activity_logs  — every 2FA event ("security.*" actions) and the verification throttle.
--
-- New tables:
--   * admin_recovery_codes   — 10 one-time codes per user, stored only as keyed hashes.
--   * admin_trusted_devices  — "remember this device for 30 days": a hash of the device token.
--
-- Mandatory for super admins and admins: once the app with 2FA is deployed, they are held on
-- My Account → Security until they set it up. Additive and safe to re-run.
-- Run in the Supabase SQL editor BEFORE deploying the 2FA code: until it runs, admins and
-- super admins cannot set up 2FA and so cannot reach the dashboard.

alter table public.users
  add column if not exists totp_secret_encrypted text,
  add column if not exists totp_pending_secret_encrypted text,
  add column if not exists totp_pending_created_at timestamptz,
  add column if not exists totp_enabled_at timestamptz,
  add column if not exists totp_last_used_step bigint,
  add column if not exists totp_last_verified_at timestamptz;

create table if not exists public.admin_recovery_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  code_hash text not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists admin_recovery_codes_hash_idx on public.admin_recovery_codes (user_id, code_hash);

create table if not exists public.admin_trusted_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  token_hash text not null,
  label text,
  ip_address text,
  created_at timestamptz not null default now(),
  last_used_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists admin_trusted_devices_user_idx on public.admin_trusted_devices (user_id);

create index if not exists activity_logs_action_created_idx on public.activity_logs (action, created_at desc);

-- Server-only, like users: RLS on and no policies, so only the service role reaches them.
alter table public.admin_recovery_codes enable row level security;
alter table public.admin_trusted_devices enable row level security;

-- Refresh PostgREST's schema cache so the API sees the new columns and tables immediately.
notify pgrst, 'reload schema';

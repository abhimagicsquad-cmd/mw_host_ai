-- Custom CMS. Every table is written and read only by the server
-- through the service role key (src/lib/supabase/server-client.ts) — RLS stays enabled with
-- zero policies so anon/public clients have no access, mirroring 0001–0003.
--
-- Run this once in the Supabase SQL editor (project apozsxenyhrgwlhycxcp). Safe to re-run.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- users — CMS administrators (not Supabase Auth users)
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  email text,
  full_name text,
  password_hash text not null,
  role text not null default 'editor' check (role in ('super_admin', 'admin', 'editor')),
  is_active boolean not null default true,
  must_change_password boolean not null default false,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists users_username_key on public.users (lower(username));
create unique index if not exists users_email_key on public.users (lower(email)) where email is not null;

-- ---------------------------------------------------------------------------
-- pages — every CMS-managed page (home, service listings, static pages, blog posts...)
-- `path` is the public URL path, e.g. "/", "/about-us", "/blog/my-post".
-- ---------------------------------------------------------------------------
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  path text not null unique check (path ~ '^/[a-z0-9/_-]*$'),
  page_type text not null default 'static'
    check (page_type in ('home', 'service', 'product', 'category', 'static', 'landing', 'blog')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  excerpt text,
  featured_image text,
  published_at timestamptz,
  created_by uuid references public.users (id) on delete set null,
  updated_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pages_status_idx on public.pages (status);
create index if not exists pages_type_idx on public.pages (page_type);
create index if not exists pages_updated_at_idx on public.pages (updated_at desc);

-- ---------------------------------------------------------------------------
-- page_sections — ordered page-builder blocks. `type` matches the website's block
-- renderer (src/components/page-builder/page-builder.tsx), `data` holds that block's fields.
-- ---------------------------------------------------------------------------
create table if not exists public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages (id) on delete cascade,
  type text not null,
  position integer not null default 0,
  data jsonb not null default '{}'::jsonb,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists page_sections_page_position_idx on public.page_sections (page_id, position);

-- ---------------------------------------------------------------------------
-- media — files uploaded to the "cms-media" Storage bucket
-- ---------------------------------------------------------------------------
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  storage_path text not null unique,
  public_url text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  folder text not null default 'images' check (folder in ('images', 'icons', 'documents')),
  alt_text text,
  uploaded_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists media_created_at_idx on public.media (created_at desc);
create index if not exists media_folder_idx on public.media (folder);

-- ---------------------------------------------------------------------------
-- seo — per-path SEO overrides. Works for CMS pages (page_id set) and for coded routes
-- (page_id null, e.g. "/hosting/seo-hosting").
-- ---------------------------------------------------------------------------
create table if not exists public.seo (
  id uuid primary key default gen_random_uuid(),
  path text not null unique,
  page_id uuid unique references public.pages (id) on delete cascade,
  meta_title text,
  meta_description text,
  canonical_url text,
  no_index boolean not null default false,
  og_title text,
  og_description text,
  og_image text,
  twitter_card text check (twitter_card in ('summary', 'summary_large_image')),
  twitter_title text,
  twitter_description text,
  twitter_image text,
  schema_json jsonb,
  updated_by uuid references public.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- menus — header (mega menu) and footer (link columns) navigation
-- ---------------------------------------------------------------------------
create table if not exists public.menus (
  id uuid primary key default gen_random_uuid(),
  location text not null unique check (location in ('header', 'footer')),
  items jsonb not null default '[]'::jsonb,
  updated_by uuid references public.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- activity_logs — audit trail (logins, content/media/user changes)
-- ---------------------------------------------------------------------------
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete set null,
  username text,
  action text not null,
  entity_type text,
  entity_id text,
  description text,
  metadata jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_created_at_idx on public.activity_logs (created_at desc);
create index if not exists activity_logs_action_idx on public.activity_logs (action);

-- ---------------------------------------------------------------------------
-- settings — key/value site settings ("general", "website")
-- ---------------------------------------------------------------------------
create table if not exists public.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references public.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

-- Tables the website already writes to (0002/0003) — created here too so the Forms screens
-- work even if those earlier migrations were never applied.
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

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique,
  source text,
  page_url text
);

-- RLS on, no policies: service role only.
alter table public.users enable row level security;
alter table public.pages enable row level security;
alter table public.page_sections enable row level security;
alter table public.media enable row level security;
alter table public.seo enable row level security;
alter table public.menus enable row level security;
alter table public.activity_logs enable row level security;
alter table public.settings enable row level security;
alter table public.orders enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- ---------------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------------
-- Default super admin "abhiadmin". The password is stored only as a salted scrypt hash;
-- must_change_password makes the dashboard nag until it is rotated from /admin/profile.
insert into public.users (username, full_name, password_hash, role, must_change_password)
values (
  'abhiadmin',
  'Abhi Admin',
  'scrypt$16384$8$1$eA73SbkrS2bluHzqZvRpRg==$GQmpEmI2mtHleBQPT7cQIM4D70eq2vWSS37tSroURkNSKR/Ogemh+BcAMsSKlCrsV44/PCvBOVFlGmh9D/1LCQ==',
  'super_admin',
  true
)
on conflict do nothing;

insert into public.menus (location, items) values ('header', '[]'::jsonb), ('footer', '[]'::jsonb)
on conflict (location) do nothing;

insert into public.settings (key, value) values ('general', '{}'::jsonb), ('website', '{}'::jsonb)
on conflict (key) do nothing;

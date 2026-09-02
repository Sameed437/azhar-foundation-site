-- ============================================================================
-- Azhar Foundation School — fee system schema
--
-- Run this once in your Supabase project:  SQL Editor → New query → paste →
-- Run. Then create the admin/principal accounts under Authentication → Users
-- ("Add user", email + password), and set these in Vercel (or .env.local):
--
--   REACT_APP_SUPABASE_URL=https://<project>.supabase.co
--   REACT_APP_SUPABASE_ANON_KEY=<anon public key>
--
-- Rebuild/redeploy and /admin switches from device mode to real login.
-- ============================================================================

-- One row per family account (siblings share an account, like the fee register)
create table if not exists public.families (
  id              integer primary key,
  name            text not null,
  guardian        text,
  phone           text,
  students        jsonb not null default '[]',   -- [{ "name": "...", "klass": "10" }]
  list_fee        integer,                       -- full fee before concession
  monthly_fee     integer not null default 0,    -- net fee actually charged
  opening_arrears integer not null default 0,    -- balance carried from last session
  notes           text,
  active_from     text,                          -- 'YYYY-MM' (blank = whole session)
  active_to       text,
  sort            integer,
  created_at      timestamptz not null default now()
);

-- One row per family per month
create table if not exists public.fee_records (
  family_id     integer not null references public.families (id) on delete cascade,
  month         text not null,                   -- 'YYYY-MM'
  fee           integer,                         -- null = use family's monthly_fee
  misc          integer not null default 0,      -- admission / practical / other
  fine          integer not null default 0,
  received      integer not null default 0,
  received_date date,
  note          text,
  updated_at    timestamptz not null default now(),
  primary key (family_id, month)
);

-- Single-row app settings (session year, due dates, fine, challan notes)
create table if not exists public.app_settings (
  id    integer primary key check (id = 1),
  value jsonb not null default '{}'
);

-- ---------------------------------------------------------------------------
-- Security: only signed-in users (the accounts YOU create) can touch anything.
-- The anon key alone can read nothing.
-- ---------------------------------------------------------------------------
alter table public.families    enable row level security;
alter table public.fee_records enable row level security;
alter table public.app_settings enable row level security;

drop policy if exists "staff full access" on public.families;
create policy "staff full access" on public.families
  for all to authenticated using (true) with check (true);

drop policy if exists "staff full access" on public.fee_records;
create policy "staff full access" on public.fee_records
  for all to authenticated using (true) with check (true);

drop policy if exists "staff full access" on public.app_settings;
create policy "staff full access" on public.app_settings
  for all to authenticated using (true) with check (true);

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
  received      integer not null default 0,      -- total received (fee + arrears parts)
  received_arrears integer,                      -- the part of received that was against arrears
  received_date date,
  note          text,
  updated_at    timestamptz not null default now(),
  primary key (family_id, month)
);

-- Existing projects: add the split column without touching data
alter table public.fee_records add column if not exists received_arrears integer;

-- ---------------------------------------------------------------------------
-- Staff: teachers and their monthly salaries
-- ---------------------------------------------------------------------------
create table if not exists public.teachers (
  id             integer primary key,
  name           text not null,
  role           text,                            -- Teacher, Principal, Ayah…
  phone          text,
  cnic           text,
  monthly_salary integer not null default 0,
  joined_on      text,                            -- 'YYYY-MM' (blank = always)
  left_on        text,
  notes          text,
  sort           integer,
  created_at     timestamptz not null default now()
);

-- One row per teacher per month
create table if not exists public.salary_records (
  teacher_id integer not null references public.teachers (id) on delete cascade,
  month      text not null,                       -- 'YYYY-MM'
  salary     integer,                             -- null = use monthly_salary
  allowance  integer not null default 0,          -- bonus / extra duty
  deduction  integer not null default 0,          -- absences / advance recovery
  paid       integer not null default 0,
  paid_date  date,
  note       text,
  updated_at timestamptz not null default now(),
  primary key (teacher_id, month)
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
alter table public.teachers       enable row level security;
alter table public.salary_records enable row level security;

drop policy if exists "staff full access" on public.families;
create policy "staff full access" on public.families
  for all to authenticated using (true) with check (true);

drop policy if exists "staff full access" on public.fee_records;
create policy "staff full access" on public.fee_records
  for all to authenticated using (true) with check (true);

drop policy if exists "staff full access" on public.app_settings;
create policy "staff full access" on public.app_settings
  for all to authenticated using (true) with check (true);

drop policy if exists "staff full access" on public.teachers;
create policy "staff full access" on public.teachers
  for all to authenticated using (true) with check (true);

drop policy if exists "staff full access" on public.salary_records;
create policy "staff full access" on public.salary_records
  for all to authenticated using (true) with check (true);

-- LordsCare customer portal schema
-- Run this in a new Supabase project. Never store game passwords or OTP codes.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('customer', 'admin');
create type public.subscription_status as enum ('pending', 'active', 'past_due', 'expired', 'cancelled');
create type public.request_status as enum ('pending', 'approved', 'rejected', 'applied');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role public.user_role not null default 'customer',
  customer_code text unique,
  assigned_sales_helper text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  account_limit integer not null check (account_limit between 1 and 5),
  term_months integer not null check (term_months in (1, 3, 12)),
  price_inr integer not null check (price_inr > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  status public.subscription_status not null default 'pending',
  amount_paid_inr integer not null check (amount_paid_inr >= 0),
  discount_inr integer not null default 0 check (discount_inr >= 0),
  payment_reference text,
  started_at timestamptz,
  renews_at timestamptz,
  renewal_status text not null default 'not_due',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.game_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  display_name text not null,
  account_reference text unique not null,
  kingdom text,
  bot_slot_reference text,
  status text not null default 'setup_pending',
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.bot_setting_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_account_id uuid not null references public.game_accounts(id) on delete cascade,
  requested_settings jsonb not null default '{}'::jsonb,
  status public.request_status not null default 'pending',
  customer_note text,
  admin_note text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  applied_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.commands (
  id bigint generated always as identity primary key,
  command text unique not null,
  description text not null,
  category text not null,
  admin_only boolean not null default false,
  sort_order integer not null default 0,
  active boolean not null default true
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index subscriptions_user_idx on public.subscriptions(user_id);
create index subscriptions_renewal_idx on public.subscriptions(renews_at);
create index accounts_user_idx on public.game_accounts(user_id);
create index requests_user_idx on public.bot_setting_requests(user_id);
create index requests_status_idx on public.bot_setting_requests(status);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and active = true); $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.game_accounts enable row level security;
alter table public.bot_setting_requests enable row level security;
alter table public.commands enable row level security;
alter table public.audit_log enable row level security;

create policy "profiles own read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "admins manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());
create policy "authenticated users read plans" on public.plans for select to authenticated using (active or public.is_admin());
create policy "admins manage plans" on public.plans for all using (public.is_admin()) with check (public.is_admin());
create policy "customers read subscriptions" on public.subscriptions for select using (user_id = auth.uid() or public.is_admin());
create policy "admins manage subscriptions" on public.subscriptions for all using (public.is_admin()) with check (public.is_admin());
create policy "customers read accounts" on public.game_accounts for select using (user_id = auth.uid() or public.is_admin());
create policy "admins manage accounts" on public.game_accounts for all using (public.is_admin()) with check (public.is_admin());
create policy "customers read own requests" on public.bot_setting_requests for select using (user_id = auth.uid() or public.is_admin());
create policy "customers create own requests" on public.bot_setting_requests for insert with check (
  user_id = auth.uid() and exists (
    select 1 from public.game_accounts where id = game_account_id and user_id = auth.uid()
  )
);
create policy "admins manage requests" on public.bot_setting_requests for all using (public.is_admin()) with check (public.is_admin());
create policy "authenticated users read commands" on public.commands for select to authenticated using (active);
create policy "admins manage commands" on public.commands for all using (public.is_admin()) with check (public.is_admin());
create policy "admins read audit log" on public.audit_log for select using (public.is_admin());
create policy "admins create audit log" on public.audit_log for insert with check (public.is_admin());

insert into public.plans (code, account_limit, term_months, price_inr) values
('1A-M',1,1,150),('1A-Q',1,3,400),('1A-Y',1,12,1500),
('2A-M',2,1,280),('2A-Q',2,3,750),('2A-Y',2,12,2800),
('3A-M',3,1,400),('3A-Q',3,3,1100),('3A-Y',3,12,4000),
('4A-M',4,1,500),('4A-Q',4,3,1400),('4A-Y',4,12,5000),
('5A-M',5,1,600),('5A-Q',5,3,1700),('5A-Y',5,12,6000);

insert into public.commands (command, description, category, admin_only, sort_order) values
('tbal','Check your resource balance','Resources',false,10),
('tfood 5M','Request 5M food','Resources',false,20),
('tstone 5M','Request 5M stone','Resources',false,30),
('twood 5M','Request 5M wood','Resources',false,40),
('tore 5M','Request 5M ore','Resources',false,50),
('tgold 5M','Request 5M gold','Resources',false,60),
('trss 5M 5M 5M 5M 0','Request multiple resources together','Resources',false,70),
('tpos','Get the bank location','Information',false,80),
('tshield','Check remaining shield time','Information',false,90),
('tfindtile food 4','Find a level 4 food tile','Search',false,100),
('tfindmonster hardrox 2','Find a level 2 monster','Search',false,110),
('tfindnest 3','Find a level 3 Darknest','Search',false,120),
('tadminbal Player','Check a player balance','Bank admin',true,200),
('tadminrss Player 5M 5M 5M 5M 0','Send a full resource set administratively','Bank admin',true,210),
('trelocator','Manage bank relocator actions','Bank admin',true,220),
('tmigrate','Start the configured migration action','Bank admin',true,230),
('tabort','Cancel pending resource shipments','Bank admin',true,240),
('trecall','Recall troops','Bank admin',true,250);

-- After creating your own user in Supabase Auth, promote only that account:
-- update public.profiles set role = 'admin' where id = 'YOUR-AUTH-USER-UUID';

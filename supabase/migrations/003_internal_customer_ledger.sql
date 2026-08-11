-- Private business-only customer records.
-- These rows do not create Auth users and never trigger invitation emails.

create table public.internal_customers (
  id uuid primary key default gen_random_uuid(),
  customer_code text unique not null,
  full_name text not null,
  phone text,
  plan_id uuid not null references public.plans(id),
  account_count integer not null default 1 check (account_count between 0 and 5),
  status public.subscription_status not null default 'active',
  amount_paid_inr integer not null check (amount_paid_inr >= 0),
  started_at timestamptz not null,
  renews_at timestamptz not null,
  last_renewed_at timestamptz,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index internal_customers_renewal_idx on public.internal_customers(renews_at);
create index internal_customers_status_idx on public.internal_customers(status);

alter table public.internal_customers enable row level security;

create policy "admins manage internal customers"
on public.internal_customers
for all
using (public.is_admin())
with check (public.is_admin());


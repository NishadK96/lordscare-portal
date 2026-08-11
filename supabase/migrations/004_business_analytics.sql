-- Private business analytics ledger and configurable operating costs.

create table public.business_settings (
  id boolean primary key default true check (id),
  business_started_on date not null default current_date,
  monthly_bot_cost_inr integer not null default 2000 check (monthly_bot_cost_inr >= 0),
  included_slots integer not null default 7 check (included_slots >= 0),
  extra_slot_cost_inr integer not null default 780 check (extra_slot_cost_inr >= 0),
  purchased_extra_slots integer not null default 0 check (purchased_extra_slots >= 0),
  other_monthly_cost_inr integer not null default 0 check (other_monthly_cost_inr >= 0),
  updated_at timestamptz not null default now()
);

insert into public.business_settings (id) values (true) on conflict (id) do nothing;

create table public.business_transactions (
  id uuid primary key default gen_random_uuid(),
  customer_source text not null default 'manual' check (customer_source in ('internal', 'portal', 'manual')),
  customer_id uuid,
  customer_name text,
  transaction_type text not null check (transaction_type in ('sale', 'renewal', 'refund', 'commission', 'other_expense')),
  amount_inr integer not null check (amount_inr >= 0),
  service_months integer not null default 0 check (service_months between 0 and 12),
  service_start date,
  service_end date,
  occurred_at timestamptz not null default now(),
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index business_transactions_occurred_idx on public.business_transactions(occurred_at);
create index business_transactions_type_idx on public.business_transactions(transaction_type);
create index business_transactions_customer_idx on public.business_transactions(customer_source, customer_id);

alter table public.business_settings enable row level security;
alter table public.business_transactions enable row level security;

create policy "admins manage business settings"
on public.business_settings for all
using (public.is_admin()) with check (public.is_admin());

create policy "admins manage business transactions"
on public.business_transactions for all
using (public.is_admin()) with check (public.is_admin());

-- Import existing paid records once so analytics starts with the current business data.
insert into public.business_transactions (
  customer_source, customer_id, customer_name, transaction_type, amount_inr,
  service_months, service_start, service_end, occurred_at, notes
)
select
  'internal', c.id, c.full_name, 'sale', c.amount_paid_inr,
  p.term_months, c.started_at::date, c.renews_at::date, c.started_at,
  'Imported from existing internal subscription record.'
from public.internal_customers c
join public.plans p on p.id = c.plan_id
where c.status in ('active', 'past_due', 'expired')
  and not exists (
    select 1 from public.business_transactions t
    where t.customer_source = 'internal' and t.customer_id = c.id and t.transaction_type = 'sale'
  );

insert into public.business_transactions (
  customer_source, customer_id, customer_name, transaction_type, amount_inr,
  service_months, service_start, service_end, occurred_at, notes
)
select
  'portal', s.user_id, pr.full_name, 'sale', s.amount_paid_inr,
  p.term_months, s.started_at::date, s.renews_at::date, coalesce(s.started_at, s.created_at),
  'Imported from existing portal subscription record.'
from public.subscriptions s
join public.profiles pr on pr.id = s.user_id
join public.plans p on p.id = s.plan_id
where s.status in ('active', 'past_due', 'expired') and s.started_at is not null
  and not exists (
    select 1 from public.business_transactions t
    where t.customer_source = 'portal' and t.customer_id = s.user_id and t.transaction_type = 'sale'
  );

create or replace function public.track_internal_customer_payment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  months integer;
  payment_type text;
begin
  if new.status not in ('active', 'past_due', 'expired') then return new; end if;
  select term_months into months from public.plans where id = new.plan_id;
  if tg_op = 'INSERT' then
    payment_type := 'sale';
  elsif new.last_renewed_at is distinct from old.last_renewed_at and new.last_renewed_at is not null then
    payment_type := 'renewal';
  elsif old.status not in ('active', 'past_due', 'expired') then
    payment_type := 'sale';
  else
    return new;
  end if;
  insert into public.business_transactions (
    customer_source, customer_id, customer_name, transaction_type, amount_inr,
    service_months, service_start, service_end, occurred_at, notes
  ) values (
    'internal', new.id, new.full_name, payment_type, new.amount_paid_inr,
    months, new.started_at::date, new.renews_at::date,
    case when payment_type = 'renewal' then new.last_renewed_at else new.started_at end,
    'Automatically recorded from the internal subscription ledger.'
  );
  return new;
end;
$$;

create trigger track_internal_customer_payment_trigger
after insert or update on public.internal_customers
for each row execute function public.track_internal_customer_payment();

create or replace function public.track_portal_subscription_payment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  months integer;
  customer text;
  payment_type text;
begin
  if new.status not in ('active', 'past_due', 'expired') or new.started_at is null then return new; end if;
  select term_months into months from public.plans where id = new.plan_id;
  select full_name into customer from public.profiles where id = new.user_id;
  if tg_op = 'INSERT' then
    payment_type := 'sale';
  elsif old.status not in ('active', 'past_due', 'expired') then
    payment_type := 'sale';
  elsif new.started_at is distinct from old.started_at then
    payment_type := 'renewal';
  else
    return new;
  end if;
  insert into public.business_transactions (
    customer_source, customer_id, customer_name, transaction_type, amount_inr,
    service_months, service_start, service_end, occurred_at, notes
  ) values (
    'portal', new.user_id, customer, payment_type, new.amount_paid_inr,
    months, new.started_at::date, new.renews_at::date, new.started_at,
    'Automatically recorded from the portal subscription ledger.'
  );
  return new;
end;
$$;

create trigger track_portal_subscription_payment_trigger
after insert or update on public.subscriptions
for each row execute function public.track_portal_subscription_payment();


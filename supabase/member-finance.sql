-- Üye panelindeki tahsilat, gider, iade ve düzeltme kayıtları.
-- Uygulamadaki özel kullanıcı adı/şifre oturumu Supabase Auth JWT üretmediği için
-- RLS politikalarını projenizin mevcut tenant erişim modeline göre ayrıca tanımlayın.
alter table public.customers add column if not exists is_deleted boolean not null default false;
alter table public.customers add column if not exists deleted_at timestamptz null;

create table if not exists public.financial_transactions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid null references public.customers(id) on delete set null,
  customer_name text not null default '',
  quote_code text null,
  kind text not null check (kind in ('income', 'expense', 'refund', 'adjustment_in', 'adjustment_out')),
  amount numeric(14,2) not null check (amount >= 0),
  transaction_date date not null default current_date,
  due_date date null,
  is_closed boolean not null default false,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.financial_transactions add column if not exists due_date date null;
alter table public.financial_transactions add column if not exists is_closed boolean not null default false;

create index if not exists financial_transactions_tenant_date_idx
  on public.financial_transactions (tenant_id, transaction_date desc);
create index if not exists financial_transactions_tenant_customer_idx
  on public.financial_transactions (tenant_id, customer_id);

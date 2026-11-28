-- MARH-LAB Admin denetim günlüğü.
-- IP adresi yalnızca güvenilir server/edge katmanı varsa doldurulmalıdır;
-- istemci uygulaması sahte IP üretmez.
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor text null,
  tenant_id uuid null references public.tenants(id) on delete set null,
  action text not null check (action in ('create','update','delete','remove','login','logout','sync','export')),
  module text null,
  record_id text null,
  ip_address inet null,
  user_agent text null,
  device_type text null,
  source text null,
  details text null,
  before_data jsonb null,
  after_data jsonb null,
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index if not exists audit_logs_actor_idx on public.audit_logs (actor);
create index if not exists audit_logs_action_idx on public.audit_logs (action);
create index if not exists audit_logs_tenant_idx on public.audit_logs (tenant_id);

-- Üretimde yalnızca admin rolü/servisi SELECT/INSERT yapabilmelidir.
-- Bu uygulamanın özel kullanıcı adı/şifre oturumu Supabase Auth JWT üretmediği için
-- aşağıdaki politikalar otomatik açılmaz; mevcut RLS/GRANT modeline göre ayrıca tanımlanmalıdır.

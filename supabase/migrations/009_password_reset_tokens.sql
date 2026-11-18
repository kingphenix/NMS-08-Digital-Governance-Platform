-- ==============================================================
-- 009_password_reset_tokens.sql
-- Table to store and track password reset tokens for member accounts.
-- RLS enabled: accessed only via server service role.
-- ==============================================================

create table if not exists public.password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  nms_number text not null,
  email text not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used boolean not null default false,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_password_reset_tokens_hash
  on public.password_reset_tokens (token_hash);

create index if not exists idx_password_reset_tokens_nms
  on public.password_reset_tokens (nms_number);

alter table public.password_reset_tokens enable row level security;

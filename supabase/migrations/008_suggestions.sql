-- ==============================================================
-- 008_suggestions.sql
-- Public suggestions are only read or managed through admin APIs.
-- RLS is enabled without anonymous policies; the server service role
-- is used for inserts and admin-only inbox operations.
-- ==============================================================

create table if not exists public.suggestions (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  category text not null default 'General'
    check (category in ('Platform', 'Governance', 'Welfare', 'Events', 'Other')),
  message text not null
    check (char_length(message) between 10 and 2000),
  status text not null default 'new'
    check (status in ('new', 'reviewed', 'resolved')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists idx_suggestions_status_created_at
  on public.suggestions (status, created_at desc);

alter table public.suggestions enable row level security;

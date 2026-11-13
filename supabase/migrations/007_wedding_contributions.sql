-- ==============================================================
-- 007_wedding_contributions.sql
-- Tracks company-level contributions towards the set wedding fund.
-- Each of the 7 companies is asked to raise ₦80,000; an admin adds
-- to the running total from the dashboard as contributions come in.
-- ==============================================================

create table if not exists wedding_contributions (
  company text primary key,
  amount_ngn numeric(14, 2) not null default 0,
  updated_at timestamptz not null default now()
);

alter table wedding_contributions enable row level security;

-- Seed the figures already collected so far.
insert into wedding_contributions (company, amount_ngn) values
  ('alpha', 46000.00),
  ('bravo', 10000.00),
  ('charlie', 34500.00),
  ('delta', 11500.00),
  ('echo', 14000.00),
  ('foxtrot', 11500.00),
  ('golf', 11500.00)
on conflict (company) do nothing;

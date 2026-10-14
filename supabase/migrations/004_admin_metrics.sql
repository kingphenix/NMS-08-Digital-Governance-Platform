-- ==============================================================
-- 004_admin_metrics.sql
-- Real data tables for Admin Dashboard cards & charts:
--   - dues_payments          (drives Total Dues Revenue card + charts)
--   - welfare_fund_ledger    (drives Welfare Fund Reserve balance)
--   - welfare_claims         (drives "active claims under review")
--   - elections              (drives Elections Participation card)
--   - election_candidates    (per-candidate vote tallies)
-- ==============================================================

-- ---------------- Dues payments ----------------
create table if not exists dues_payments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references member_profiles(id) on delete set null,
  roster_id uuid references roster(id) on delete set null,
  nms_number text,
  full_name text,
  company text,
  amount_ngn numeric(14, 2) not null default 0,
  payment_year int not null,
  payment_month int not null check (payment_month between 1 and 12),
  paid_at timestamptz not null default now(),
  payment_method text,
  reference text,
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_dues_payments_paid_at on dues_payments (paid_at);
create index if not exists idx_dues_payments_company on dues_payments (company);
create index if not exists idx_dues_payments_year_month on dues_payments (payment_year, payment_month);

alter table dues_payments enable row level security;

-- ---------------- Welfare fund ledger ----------------
-- Single-row running ledger: each row is a credit (+) or debit (-) to the welfare fund.
create table if not exists welfare_fund_ledger (
  id uuid primary key default gen_random_uuid(),
  entry_type text not null check (entry_type in ('contribution', 'claim_payout', 'adjustment')),
  amount_ngn numeric(14, 2) not null,
  -- For 'claim_payout' rows, link to the originating claim.
  claim_id uuid,
  description text,
  member_id uuid references member_profiles(id) on delete set null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz default now()
);

create index if not exists idx_welfare_fund_ledger_occurred_at on welfare_fund_ledger (occurred_at);

alter table welfare_fund_ledger enable row level security;

-- ---------------- Welfare claims ----------------
create table if not exists welfare_claims (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references member_profiles(id) on delete set null,
  member_name text,
  claim_type text not null check (claim_type in ('Medical', 'Bereavement', 'Emergency', 'Celebration')),
  amount_requested_ngn numeric(14, 2) not null default 0,
  status text not null default 'Under Review' check (status in ('Approved', 'Under Review', 'Disbursed', 'Rejected')),
  description text,
  filed_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_welfare_claims_status on welfare_claims (status);

alter table welfare_claims enable row level security;

-- ---------------- Elections ----------------
create table if not exists elections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  election_year int not null,
  status text not null default 'Upcoming' check (status in ('Upcoming', 'Active', 'Closed')),
  eligible_voters int not null default 0,
  votes_cast int not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_elections_status on elections (status);

alter table elections enable row level security;

-- ---------------- Election candidates ----------------
create table if not exists election_candidates (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references elections(id) on delete cascade,
  full_name text not null,
  position text not null,
  nms_number text,
  company text,
  manifesto text,
  votes_count int not null default 0,
  avatar_url text,
  created_at timestamptz default now()
);

create index if not exists idx_election_candidates_election on election_candidates (election_id);

alter table election_candidates enable row level security;

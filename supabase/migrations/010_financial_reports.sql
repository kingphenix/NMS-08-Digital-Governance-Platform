-- Financial Reports table for the Brotherhood Accountability Report
create table if not exists financial_reports (
  id uuid primary key default gen_random_uuid(),
  
  -- Meta
  report_month text not null,            -- e.g. "November 2026"
  period_start date not null,
  period_end date not null,
  status text not null default 'draft',  -- draft | published
  prepared_by text,
  reviewed_by text,
  approved_by text,
  
  -- Section 1: Financial Snapshot
  opening_balance numeric(14,2) not null default 0,
  total_income numeric(14,2) not null default 0,
  total_expenditure numeric(14,2) not null default 0,
  closing_balance numeric(14,2) not null default 0,
  
  -- Section 2: Income (JSONB array of {source, amount})
  income_items jsonb not null default '[]'::jsonb,
  
  -- Section 3: Expenditure (JSONB array of {category, amount})
  expenditure_items jsonb not null default '[]'::jsonb,
  
  -- Section 4: Fund Position (JSONB array of {fund, balance})
  fund_positions jsonb not null default '[]'::jsonb,
  outstanding_obligations numeric(14,2) not null default 0,
  unpaid_commitments numeric(14,2) not null default 0,
  
  -- Section 5: Company Scorecard (JSONB array of {company, expected, received, outstanding})
  company_scorecard jsonb not null default '[]'::jsonb,
  
  -- Section 6: Highlights
  highlights_text text,                       -- markdown/plain text
  key_activities jsonb not null default '[]'::jsonb,  -- array of strings
  welfare_interventions integer not null default 0,
  projects_funded integer not null default 0,
  
  -- Section 7: Reconciliation
  closing_balance_records numeric(14,2) not null default 0,
  closing_bank_balance numeric(14,2) not null default 0,
  closing_other_accounts numeric(14,2) not null default 0,
  unreconciled_difference numeric(14,2) not null default 0,
  reconciliation_status text not null default 'Pending',
  reconciliation_explanation text,
  
  -- Section 8: Management Notes
  management_notes text,
  
  -- Timestamps
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure one report per month
create unique index if not exists financial_reports_month_unique on financial_reports (report_month);

alter table financial_reports enable row level security;

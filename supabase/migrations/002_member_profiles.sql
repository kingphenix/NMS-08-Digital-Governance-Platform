create table if not exists member_profiles (
  id uuid primary key default gen_random_uuid(),
  roster_id uuid not null unique references roster(id) on delete cascade,
  nms_number text not null unique,
  full_name text not null,
  company text,
  rank_appointment text,
  set_appointment text,
  dob text,
  state_of_origin text,
  state_of_residence text,
  address text,
  marital_status text,
  email text,
  phone text,
  occupation text,
  industry text,
  business text,
  skills text,
  professional_qualifications text,
  blood_group text,
  genotype text,
  next_of_kin text,
  relationship text,
  next_of_kin_phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_member_profiles_nms on member_profiles(nms_number);
create index if not exists idx_member_profiles_company on member_profiles(company);

alter table member_profiles enable row level security;

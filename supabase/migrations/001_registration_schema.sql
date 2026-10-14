create extension if not exists pgcrypto;

create table roster (
  id uuid primary key default gen_random_uuid(),
  nms_number text not null unique,
  full_name text not null,
  name_tokens text[],
  registered boolean not null default false,
  registered_at timestamptz
);

create table voters (
  id uuid primary key default gen_random_uuid(),
  roster_id uuid not null unique references roster(id),
  code_hash text not null unique,
  has_voted boolean not null default false,
  created_at timestamptz default now()
);

create table registration_attempts (
  id bigserial primary key,
  ip text,
  nms_number text,
  success boolean,
  created_at timestamptz default now()
);

create index on registration_attempts (ip, created_at);

alter table roster enable row level security;
alter table voters enable row level security;
alter table registration_attempts enable row level security;

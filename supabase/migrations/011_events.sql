-- Events and Reunions table
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date not null,
  event_time text,
  location text,
  category text not null default 'General', -- Reunion | Wedding | Meeting | Social | Sports | General
  image_url text,
  organizer text,
  is_featured boolean not null default false,
  status text not null default 'published', -- published | draft
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_date_idx on events (event_date desc);

alter table events enable row level security;

-- Add password_hash to member_profiles
alter table if exists member_profiles
  add column if not exists password_hash text;

create index if not exists idx_member_profiles_email on member_profiles(email);

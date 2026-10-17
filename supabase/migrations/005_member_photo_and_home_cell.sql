-- Migration: Add avatar_url and home_cell to member_profiles
alter table if exists member_profiles
  add column if not exists avatar_url text,
  add column if not exists home_cell text;

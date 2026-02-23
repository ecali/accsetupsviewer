-- Run this in Supabase SQL editor

create extension if not exists "pgcrypto";

create table if not exists public.setups_manual (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  car_key text not null,
  track_key text not null,
  setup_name text not null,
  is_private boolean not null default false,
  notes text,
  json_data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.lap_times (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  car_key text not null,
  track_key text not null,
  lap_time_ms integer not null check (lap_time_ms > 0),
  is_private boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.setups_manual
  add column if not exists is_private boolean not null default false;

alter table public.lap_times
  add column if not exists is_private boolean not null default false;

alter table public.setups_manual enable row level security;
alter table public.lap_times enable row level security;

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(trim(nickname)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

drop policy if exists "setups select own" on public.setups_manual;
create policy "setups select own" on public.setups_manual
for select using (auth.uid() = user_id);

drop policy if exists "setups insert own" on public.setups_manual;
create policy "setups insert own" on public.setups_manual
for insert with check (auth.uid() = user_id);

drop policy if exists "setups update own" on public.setups_manual;
create policy "setups update own" on public.setups_manual
for update using (auth.uid() = user_id);

drop policy if exists "setups delete own" on public.setups_manual;
create policy "setups delete own" on public.setups_manual
for delete using (auth.uid() = user_id);

drop policy if exists "laps select own" on public.lap_times;
create policy "laps select own" on public.lap_times
for select using (auth.uid() = user_id);

drop policy if exists "laps insert own" on public.lap_times;
create policy "laps insert own" on public.lap_times
for insert with check (auth.uid() = user_id);

drop policy if exists "laps update own" on public.lap_times;
create policy "laps update own" on public.lap_times
for update using (auth.uid() = user_id);

drop policy if exists "laps delete own" on public.lap_times;
create policy "laps delete own" on public.lap_times
for delete using (auth.uid() = user_id);

drop policy if exists "profiles select own" on public.user_profiles;
create policy "profiles select own" on public.user_profiles
for select using (auth.uid() = user_id);

drop policy if exists "profiles insert own" on public.user_profiles;
create policy "profiles insert own" on public.user_profiles
for insert with check (auth.uid() = user_id);

drop policy if exists "profiles update own" on public.user_profiles;

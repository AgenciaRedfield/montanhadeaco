create extension if not exists pgcrypto;

create table if not exists public.player_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  commander_name text not null default 'Comandante da Forja',
  rank text not null default 'Operador da Caldeira',
  level integer not null default 1,
  forge_credits integer not null default 120,
  battles_played integer not null default 0,
  victories integer not null default 0,
  unlocked_cards text[] not null default '{}',
  selected_deck text[] not null default '{}',
  last_played_at timestamptz null,
  music_enabled boolean not null default true,
  music_volume numeric not null default 0.45,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint player_progress_user_id_fkey
    foreign key (user_id)
    references auth.users (id)
    on delete cascade
);

alter table public.player_progress enable row level security;

create policy "player_progress_select_own"
on public.player_progress
for select
using (auth.uid() = user_id);

create policy "player_progress_insert_own"
on public.player_progress
for insert
with check (auth.uid() = user_id);

create policy "player_progress_update_own"
on public.player_progress
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

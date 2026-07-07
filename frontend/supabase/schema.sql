-- ─── CineNova Database Schema ───────────────────────────────────────────────
-- Run this in your Supabase SQL Editor
-- https://supabase.com/dashboard → SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Profiles (extends auth.users) ───────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  username    text unique,
  avatar_url  text,
  bio         text,
  favorite_genres   text[] default '{}',
  favorite_actors   text[] default '{}',
  favorite_directors text[] default '{}',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'preferred_username',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Watch History ────────────────────────────────────────────────────────────
create table if not exists public.watch_history (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles on delete cascade not null,
  movie_id    integer not null,
  watched_at  timestamptz default now(),
  progress    integer default 0 check (progress between 0 and 100),
  rating      numeric(3,1) check (rating between 0 and 10)
);

-- ─── Watchlist ────────────────────────────────────────────────────────────────
create table if not exists public.watchlist (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles on delete cascade not null,
  movie_id    integer not null,
  created_at  timestamptz default now(),
  unique(user_id, movie_id)
);

-- ─── Favorites ────────────────────────────────────────────────────────────────
create table if not exists public.favorites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles on delete cascade not null,
  movie_id    integer not null,
  created_at  timestamptz default now(),
  unique(user_id, movie_id)
);

-- ─── Reviews ─────────────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles on delete cascade not null,
  movie_id    integer not null,
  rating      numeric(3,1) check (rating between 0 and 10),
  review      text,
  is_spoiler  boolean default false,
  likes       integer default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── AI History ───────────────────────────────────────────────────────────────
create table if not exists public.ai_history (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles on delete cascade not null,
  prompt      text not null,
  response    jsonb not null,
  created_at  timestamptz default now()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.watch_history enable row level security;
alter table public.watchlist enable row level security;
alter table public.favorites enable row level security;
alter table public.reviews enable row level security;
alter table public.ai_history enable row level security;

-- Profiles: anyone can read, only owner can modify
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Watch history: only owner
create policy "Users can view own history" on public.watch_history for select using (auth.uid() = user_id);
create policy "Users can insert own history" on public.watch_history for insert with check (auth.uid() = user_id);
create policy "Users can update own history" on public.watch_history for update using (auth.uid() = user_id);
create policy "Users can delete own history" on public.watch_history for delete using (auth.uid() = user_id);

-- Watchlist: only owner
create policy "Users can view own watchlist" on public.watchlist for select using (auth.uid() = user_id);
create policy "Users can insert to watchlist" on public.watchlist for insert with check (auth.uid() = user_id);
create policy "Users can delete from watchlist" on public.watchlist for delete using (auth.uid() = user_id);

-- Favorites: only owner
create policy "Users can view own favorites" on public.favorites for select using (auth.uid() = user_id);
create policy "Users can insert favorites" on public.favorites for insert with check (auth.uid() = user_id);
create policy "Users can delete favorites" on public.favorites for delete using (auth.uid() = user_id);

-- Reviews: public read, owner write
create policy "Reviews are public" on public.reviews for select using (true);
create policy "Users can insert reviews" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Users can update own reviews" on public.reviews for update using (auth.uid() = user_id);
create policy "Users can delete own reviews" on public.reviews for delete using (auth.uid() = user_id);

-- AI history: only owner
create policy "Users can view own AI history" on public.ai_history for select using (auth.uid() = user_id);
create policy "Users can insert AI history" on public.ai_history for insert with check (auth.uid() = user_id);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
create index if not exists idx_watch_history_user on public.watch_history(user_id);
create index if not exists idx_watchlist_user on public.watchlist(user_id);
create index if not exists idx_favorites_user on public.favorites(user_id);
create index if not exists idx_reviews_movie on public.reviews(movie_id);
create index if not exists idx_reviews_user on public.reviews(user_id);
create index if not exists idx_ai_history_user on public.ai_history(user_id);

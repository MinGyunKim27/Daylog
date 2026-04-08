-- Daylog Database Schema
-- Supabase SQL Editor에 실행하세요.

create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid references auth.users primary key,
  email text,
  sex text check (sex in ('male', 'female')),
  birth_year integer,
  height_cm numeric(5,2),
  weight_kg numeric(5,2),
  muscle_kg numeric(5,2),
  activity_level text check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  created_at timestamptz default now()
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date date not null default current_date,
  category text not null check (category in ('식비','교통','쇼핑','문화','주거','의료','구독','기타')),
  amount integer not null,
  memo text,
  created_at timestamptz default now()
);

create table if not exists sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date date not null default current_date,
  bedtime time not null,
  wake_time time not null,
  duration_hours numeric(4,2) not null,
  created_at timestamptz default now(),
  unique (user_id, date)
);

create table if not exists exercise_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date date not null default current_date,
  type text not null,
  intensity text not null default 'medium' check (intensity in ('low', 'medium', 'high')),
  duration_minutes integer not null,
  calories_burned integer,
  created_at timestamptz default now()
);

create table if not exists mood_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date date not null default current_date,
  score integer not null check (score between 1 and 10),
  note text,
  created_at timestamptz default now(),
  unique (user_id, date)
);

create table if not exists diet_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date date not null default current_date,
  breakfast text,
  lunch text,
  dinner text,
  snacks text[] default '{}',
  calories integer,
  photo_url text,
  created_at timestamptz default now(),
  unique (user_id, date)
);

alter table profiles enable row level security;
alter table expenses enable row level security;
alter table sleep_logs enable row level security;
alter table exercise_logs enable row level security;
alter table mood_logs enable row level security;
alter table diet_logs enable row level security;

create policy "own profile only" on profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own data only" on expenses
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own data only" on sleep_logs
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own data only" on exercise_logs
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own data only" on mood_logs
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own data only" on diet_logs
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 사진 업로드용 Storage 버킷 (필요 시 대시보드에서 생성)
-- bucket name: meal-photos

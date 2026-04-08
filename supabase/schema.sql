-- Daylog Database Schema
-- Paste this into the Supabase SQL editor after creating a project

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date date not null default current_date,
  category text not null check (category in ('식비','교통','쇼핑','기타')),
  amount integer not null,
  created_at timestamptz default now()
);

create table if not exists sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date date not null default current_date,
  bedtime time not null,
  wake_time time not null,
  duration_hours numeric(4,2) not null,
  created_at timestamptz default now()
);

create table if not exists exercise_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date date not null default current_date,
  type text not null,
  duration_minutes integer not null,
  created_at timestamptz default now()
);

create table if not exists mood_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date date not null default current_date,
  score integer not null check (score between 1 and 10),
  note text,
  created_at timestamptz default now()
);

create table if not exists diet_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date date not null default current_date,
  breakfast text,
  lunch text,
  dinner text,
  created_at timestamptz default now()
);

-- Row Level Security
alter table expenses enable row level security;
alter table sleep_logs enable row level security;
alter table exercise_logs enable row level security;
alter table mood_logs enable row level security;
alter table diet_logs enable row level security;

create policy "own data only" on expenses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own data only" on sleep_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own data only" on exercise_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own data only" on mood_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own data only" on diet_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

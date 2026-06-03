-- Supabase Database Schema for Fitness Tracker App
-- Run this SQL in Supabase SQL Editor to set up the database

-- 1. Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Training Plans table
create table if not exists public.training_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  target integer not null default 1,
  unit text not null default '次',
  icon text default '💪',
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.training_plans enable row level security;

create policy "Users can manage own plans" on public.training_plans
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. Check-ins table (daily check-in records)
create table if not exists public.check_ins (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  plan_id uuid references public.training_plans on delete cascade not null,
  date date not null default current_date,
  completed integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, plan_id, date)
);

alter table public.check_ins enable row level security;

create policy "Users can manage own check_ins" on public.check_ins
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Indexes for performance
create index if not exists idx_training_plans_user_id on public.training_plans(user_id);
create index if not exists idx_check_ins_user_date on public.check_ins(user_id, date);
create index if not exists idx_check_ins_plan_id on public.check_ins(plan_id);

-- Helper function: get today's completion status for a user
create or replace function public.get_today_status(uid uuid)
returns table (
  plan_id uuid,
  plan_name text,
  icon text,
  target integer,
  unit text,
  completed integer,
  is_done boolean
) as $$
begin
  return query
  select
    tp.id as plan_id,
    tp.name as plan_name,
    tp.icon,
    tp.target,
    tp.unit,
    coalesce(ci.completed, 0) as completed,
    coalesce(ci.completed, 0) >= tp.target as is_done
  from public.training_plans tp
  left join public.check_ins ci
    on ci.plan_id = tp.id
    and ci.user_id = uid
    and ci.date = current_date
  where tp.user_id = uid
  order by tp.sort_order, tp.created_at;
end;
$$ language plpgsql security definer;

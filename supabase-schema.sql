create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  booking_status text not null default 'pending',
  phone_number text not null,
  event_location text,
  wedding_date date,
  wedding_location text,
  pre_wedding_date date,
  pre_wedding_location text,
  reception_date date,
  reception_location text,
  extra_functions jsonb not null default '[]'::jsonb,
  bride_side_photographer text,
  bride_side_videographer text,
  groom_side_photographer text,
  groom_side_videographer text,
  side_mode text not null default 'combined',
  single_side_photographer text,
  single_side_videographer text,
  team_lead_name text,
  other_crew_members text,
  work_status text not null default 'pending',
  additional_requirements text,
  package_amount numeric not null default 0,
  advance_amount numeric not null default 0,
  due_amount numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.events add column if not exists booking_status text not null default 'pending';
alter table public.events alter column event_location drop not null;
alter table public.events add column if not exists wedding_location text;
alter table public.events add column if not exists pre_wedding_date date;
alter table public.events add column if not exists pre_wedding_location text;
alter table public.events add column if not exists reception_location text;
alter table public.events add column if not exists bride_side_photographer text;
alter table public.events add column if not exists bride_side_videographer text;
alter table public.events add column if not exists groom_side_photographer text;
alter table public.events add column if not exists groom_side_videographer text;
alter table public.events add column if not exists side_mode text not null default 'combined';
alter table public.events add column if not exists single_side_photographer text;
alter table public.events add column if not exists single_side_videographer text;
alter table public.events add column if not exists team_lead_name text;
alter table public.events add column if not exists other_crew_members text;
alter table public.events add column if not exists work_status text not null default 'pending';

create or replace function public.set_events_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_events_updated_at on public.events;
create trigger trg_set_events_updated_at
before update on public.events
for each row
execute function public.set_events_updated_at();

alter table public.events enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'events'
      and policyname = 'Allow anon read events'
  ) then
    create policy "Allow anon read events"
      on public.events
      for select
      to anon
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'events'
      and policyname = 'Allow anon insert events'
  ) then
    create policy "Allow anon insert events"
      on public.events
      for insert
      to anon
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'events'
      and policyname = 'Allow anon update events'
  ) then
    create policy "Allow anon update events"
      on public.events
      for update
      to anon
      using (true)
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'events'
      and policyname = 'Allow anon delete events'
  ) then
    create policy "Allow anon delete events"
      on public.events
      for delete
      to anon
      using (true);
  end if;
end;
$$;

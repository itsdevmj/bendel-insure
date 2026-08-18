-- Run this in Supabase Dashboard → SQL Editor
-- Creates the fixtures table and seeds it with the official NPFL 2026/2027
-- fixture release for Bendel Insurance.

create table if not exists public.fixtures (
  id          uuid primary key default gen_random_uuid(),
  matchday    integer not null,
  match_date  date not null,
  kickoff     time not null default '16:00',
  opponent    text not null,
  is_home     boolean not null default true,
  -- Host city as published by the league; 'TBA' until a ground is confirmed.
  venue       text not null default 'TBA',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (matchday)
);

create index if not exists fixtures_match_date_idx
  on public.fixtures (match_date);

alter table public.fixtures enable row level security;

create policy "Fixtures are publicly readable"
  on public.fixtures for select
  using (true);

create policy "Authenticated admins full access to fixtures"
  on public.fixtures for all
  to authenticated
  using (true)
  with check (true);

-- Seed the published season. Kick-off is 4:00PM for every game in the release.
insert into public.fixtures (matchday, match_date, opponent, is_home, venue) values
  (1,  '2026-08-30', 'Warri Wolves',    true,  'Benin'),
  (2,  '2026-09-06', 'Nasarawa United', false, 'TBA'),
  (3,  '2026-09-13', 'Kun Khalifat',    true,  'Benin'),
  (4,  '2026-09-20', 'Ranchers Bees',   false, 'Kaduna'),
  (5,  '2026-09-23', 'Ikorodu City',    true,  'Benin'),
  (6,  '2026-09-27', 'Abia Warriors',   false, 'Aba'),
  (7,  '2026-10-04', 'Barau',           true,  'Benin'),
  (8,  '2026-10-11', 'Sporting Lagos',  false, 'Lagos'),
  (9,  '2026-10-18', 'Rangers Int''l',  false, 'Enugu'),
  (10, '2026-10-25', 'Rivers United',   true,  'Benin'),
  (11, '2026-11-01', 'Kwara United',    false, 'Ilorin'),
  (12, '2026-11-08', 'Niger Tornadoes', true,  'Benin'),
  (13, '2026-11-15', 'Shooting Stars',  false, 'Ibadan'),
  (14, '2026-11-22', 'Doma United',     true,  'Benin'),
  (15, '2026-11-29', 'Inter Lagos',     false, 'Lagos'),
  (16, '2026-12-06', 'Enyimba Int''l',  true,  'Benin'),
  (17, '2026-12-13', 'Kano Pillars',    false, 'Kano'),
  (18, '2026-12-20', 'Plateau United',  true,  'Benin'),
  (19, '2026-12-30', 'Katsina United',  false, 'Katsina'),
  (20, '2027-01-10', 'Katsina United',  true,  'Benin'),
  (21, '2027-01-17', 'Warri Wolves',    false, 'Ozoro'),
  (22, '2027-01-20', 'Nasarawa United', true,  'Benin'),
  (23, '2027-01-24', 'Kun Khalifat',    false, 'Owerri'),
  (24, '2027-01-31', 'Ranchers Bees',   true,  'Benin'),
  (25, '2027-02-10', 'Ikorodu City',    false, 'Lagos'),
  (26, '2027-02-14', 'Abia Warriors',   true,  'Benin'),
  (27, '2027-02-21', 'Barau',           false, 'Kano'),
  (28, '2027-02-28', 'Sporting Lagos',  true,  'Benin'),
  (29, '2027-03-07', 'Rangers Int''l',  true,  'Benin'),
  (30, '2027-03-14', 'Rivers United',   false, 'Port Harcourt'),
  (31, '2027-03-21', 'Kwara United',    true,  'Benin'),
  (32, '2027-03-28', 'Niger Tornadoes', false, 'TBA'),
  (33, '2027-04-04', 'Shooting Stars',  true,  'Benin'),
  (34, '2027-04-10', 'Doma United',     false, 'TBA'),
  (35, '2027-04-18', 'Inter Lagos',     true,  'Benin'),
  (36, '2027-05-09', 'Enyimba Int''l',  false, 'Aba'),
  (37, '2027-05-16', 'Kano Pillars',    true,  'Benin'),
  (38, '2027-05-30', 'Plateau United',  false, 'Jos')
on conflict (matchday) do nothing;

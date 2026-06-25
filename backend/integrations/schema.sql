-- Sentinel — full schema
-- Paste this into the Supabase SQL editor after dropping all existing tables.
-- Drop order respects foreign key constraints (dependents first).

drop table if exists public.predictions          cascade;
drop table if exists public.speech_history       cascade;
drop table if exists public.blood_sugar_record   cascade;
drop table if exists public.voice_command_history cascade;
drop table if exists public.stroke_history       cascade;
drop table if exists public.otp_codes            cascade;
drop table if exists public.emergency_contacts   cascade;
drop table if exists public.users                cascade;

-- ─── Core user table ───────────────────────────────────────────────────────────

create table public.users (
  user_id         uuid    default gen_random_uuid() primary key,
  email           text    unique not null,
  name            text    not null,
  hashed_password text,
  created_at      timestamp with time zone default now()
);

-- ─── Emergency contacts ────────────────────────────────────────────────────────

create table public.emergency_contacts (
  id         uuid  default gen_random_uuid() primary key,
  user_id    uuid  references public.users(user_id) on delete cascade not null,
  email      text  not null,
  name       text,
  created_at timestamp with time zone default now(),
  unique(user_id, email)
);

-- ─── 2FA OTP codes ────────────────────────────────────────────────────────────

create table public.otp_codes (
  id          uuid    default gen_random_uuid() primary key,
  user_id     uuid    references public.users(user_id) on delete cascade not null,
  code        text    not null,
  expires_at  timestamp with time zone not null,
  used        boolean default false
);

-- ─── History tables ───────────────────────────────────────────────────────────

create table public.stroke_history (
  id           uuid  default gen_random_uuid() primary key,
  user_id      uuid  references public.users(user_id) on delete cascade not null,
  stroke_event jsonb not null,
  date         timestamp with time zone default now()
);

create table public.voice_command_history (
  id            uuid  default gen_random_uuid() primary key,
  user_id       uuid  references public.users(user_id) on delete cascade not null,
  voice_command text  not null,
  date          timestamp with time zone default now()
);

create table public.blood_sugar_record (
  id                   uuid     default gen_random_uuid() primary key,
  user_id              uuid     references public.users(user_id) on delete cascade not null,
  event                text     not null,
  blood_sugar_reading  numeric,
  critical_alert       boolean  not null,
  message              text,
  date                 timestamp with time zone default now()
);

create table public.speech_history (
  id                              uuid    default gen_random_uuid() primary key,
  user_id                         uuid    references public.users(user_id) on delete cascade,
  timestamp                       timestamp with time zone default now(),
  filename                        text,
  transcribed_text                text,
  transcription_discrepancy_score numeric,
  pacing_score                    numeric,
  combined_slur_score             numeric,
  classification                  text,
  alert_triggered                 boolean,
  alert_level                     text
);

create table public.predictions (
  id              uuid    default gen_random_uuid() primary key,
  user_id         uuid    references public.users(user_id) on delete cascade not null,
  label           text    not null,
  confidence      numeric not null,
  raw_detections  jsonb,
  source          text    not null,
  created_at      timestamp with time zone default now()
);

-- ─── Disable RLS so the anon key can read/write all tables ───────────────────

alter table public.users                  disable row level security;
alter table public.emergency_contacts     disable row level security;
alter table public.otp_codes              disable row level security;
alter table public.stroke_history         disable row level security;
alter table public.voice_command_history  disable row level security;
alter table public.blood_sugar_record     disable row level security;
alter table public.speech_history         disable row level security;
alter table public.predictions            disable row level security;


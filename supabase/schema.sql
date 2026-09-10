-- forMe 백엔드 스키마
-- Supabase 대시보드 > SQL Editor 에 통째로 붙여넣고 실행하세요.
-- 테이블 3개 + 행 단위 보안(RLS). 모든 행은 auth.uid() 로 소유자를 가른다.

-- ─────────────────────────────────────────────────────────────
-- 1. profiles : 사용자당 1행 (이름 + 프로필 사진 base64)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  name       text not null default '',
  photo      text,                          -- data:image/jpeg;base64,... (작게 리사이즈됨)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are self-owned" on public.profiles;
create policy "profiles are self-owned"
  on public.profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 2. activities : 사용자가 고를 수 있는 휴식 활동 목록
--    id 는 클라이언트가 만든 문자열 uid (화면 코드가 이 id 를 그대로 쓴다)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.activities (
  id         text primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  icon       text not null default '🫧',
  categories text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists activities_user_idx on public.activities (user_id);

alter table public.activities enable row level security;

drop policy if exists "activities are self-owned" on public.activities;
create policy "activities are self-owned"
  on public.activities
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 3. records : 휴식을 한 번 마칠 때마다 한 행
-- ─────────────────────────────────────────────────────────────
create table if not exists public.records (
  id            text primary key,
  user_id       uuid not null references auth.users (id) on delete cascade,
  day           text not null,              -- 로컬 기준 'YYYY-MM-DD'
  at            bigint not null,            -- epoch millis (정렬용)
  activity_id   text,
  activity_name text not null default '',
  activity_icon text not null default '🫧',
  minutes       integer not null default 0,
  mood_before   text,
  mood_after    text,
  completed     boolean not null default true,
  created_at    timestamptz not null default now()
);

create index if not exists records_user_day_idx on public.records (user_id, day);

alter table public.records enable row level security;

drop policy if exists "records are self-owned" on public.records;
create policy "records are self-owned"
  on public.records
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 역할 권한(GRANT)
-- RLS 는 "어떤 행" 인지를 가리고, GRANT 는 "테이블을 만질 수 있는지" 를 가린다.
-- Supabase 가 보통 자동으로 걸어주지만, 안 걸리면 'permission denied for table' 이 난다.
-- ─────────────────────────────────────────────────────────────
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.profiles   to anon, authenticated;
grant select, insert, update, delete on public.activities to anon, authenticated;
grant select, insert, update, delete on public.records    to anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- updated_at 자동 갱신 (profiles 전용)
-- ─────────────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

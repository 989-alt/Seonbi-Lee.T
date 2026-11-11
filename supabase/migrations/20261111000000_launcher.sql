-- 방구석게이머 런처: projects 확장 + 방문 카운터
-- 여러 번 실행해도 안전하도록 if not exists 사용

alter table public.projects
  add column if not exists featured boolean not null default false,
  add column if not exists featured_order int,
  add column if not exists tag text,
  add column if not exists grade text,
  add column if not exists hero_image_path text,
  add column if not exists partner text,
  add column if not exists partner_url text,
  add column if not exists track_slug text;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'projects_partner_check') then
    alter table public.projects add constraint projects_partner_check check (partner is null or partner in ('i-scream'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'projects_track_slug_key') then
    alter table public.projects add constraint projects_track_slug_key unique (track_slug);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'projects_slug_key')
     and not exists (select 1 from pg_indexes where tablename = 'projects' and indexdef ilike '%unique%(slug)%') then
    alter table public.projects add constraint projects_slug_key unique (slug);
  end if;
end $$;

-- 방문 기록: 브라우저 무작위 ID만, 개인정보·IP 없음
create table if not exists public.app_visits (
  app_slug   text not null,
  visitor_id uuid not null,
  day        date not null,
  primary key (app_slug, visitor_id, day)
);
alter table public.app_visits enable row level security;
-- 정책을 만들지 않음 = anon/authenticated 접근 차단. 서버(service role)만 읽고 씀.

create or replace function public.app_stats()
returns table (slug text, today bigint, total bigint)
language sql stable security definer set search_path = public as $$
  select app_slug as slug,
         count(distinct visitor_id) filter (where day = (now() at time zone 'Asia/Seoul')::date) as today,
         count(distinct visitor_id) as total
  from public.app_visits
  group by app_slug
$$;
revoke all on function public.app_stats() from public, anon, authenticated;

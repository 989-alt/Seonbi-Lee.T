-- dorms-check 점검 반영 (2026-11-12)

-- 1) 이벤트 트리거 함수는 API로 호출될 이유가 없다 → anon/authenticated 실행 권한 회수
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- 2) 이미지 버킷 업로드 용량·형식 제한 (서버 코드의 5MB 제한과 동일하게)
update storage.buckets
   set file_size_limit = 5242880,
       allowed_mime_types = array['image/png','image/jpeg','image/webp','image/gif','image/avif']
 where id in ('project-thumbs', 'post-heroes');

-- 3) 관리자 접속·권한 변경 기록 (1년 보관). 서비스 키로만 쓰고 읽는다.
create table if not exists public.admin_audit_log (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  action text not null,
  email text,
  user_id uuid,
  ip text,
  user_agent text,
  detail text
);
create index if not exists admin_audit_log_created_at_idx on public.admin_audit_log (created_at desc);
alter table public.admin_audit_log enable row level security;
revoke all on public.admin_audit_log from anon, authenticated;

-- 4) 1년 지난 기록 자동 삭제 (pg_cron, 매일 03:30 KST = 18:30 UTC)
create extension if not exists pg_cron;
select cron.schedule(
  'admin_audit_log_retention',
  '30 18 * * *',
  $$delete from public.admin_audit_log where created_at < now() - interval '1 year'$$
);

# 방구석게이머 런처 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** s-edu.ai.kr 홈을 "방구석게이머" 게임 런처(+첫 방문 인트로)로 바꾸고, Supabase 기반 방문자·앱별 사용자 카운터를 붙인다.

**Architecture:** 기존 Next.js 16 App Router + Supabase 구조를 유지한다. 앱 목록은 `projects` 표(열 추가)에서 읽어 순수 함수(`lib/launcher/catalog.ts`)로 STAGE·대표·검색을 계산하고, 클라이언트 런처 컴포넌트가 그린다. 카운터는 `app_visits` 표 + `/api/track`·`/api/stats` 라우트 + 앱용 `public/t.js`.

**Tech Stack:** Next.js 16.2 (App Router, `src/proxy.ts`), React 19, Tailwind 4, Supabase (`@supabase/ssr`), zod 4, Vitest(신규, 순수 로직), Python Playwright(`_test/`, 기존 스모크 방식).

**Spec:** `docs/superpowers/specs/2026-11-11-bangguseok-launcher-design.md`

## Global Constraints
- 이 Next.js는 학습 데이터와 다르다: 코드 쓰기 전 `node_modules/next/dist/docs/`의 해당 가이드를 읽는다(AGENTS.md).
- 닉네임 표기: "방구석게이머". 사이트 title: `방구석게이머 // 교실 런처`.
- STAGE 매핑: `edutech`→STAGE 1 "게임 · 수업자료", `class`→STAGE 2 "학급운영", `admin`→STAGE 3 "학교행정". 대표 슬롯 최대 8 / 3 / 3.
- 납품작(`partner='i-scream'`) 버튼 문구 "아이스크림 AI마트에서 이용하기", 링크 `https://issamgpt.com/ai-mart?type=ALL`, 안내 "아이스크림에 납품한 작품이에요". 원래 배포 주소·저장소 링크를 화면·HTML 어디에도 내보내지 않는다.
- HOT/NEW 배지 금지. 캐릭터 이미지는 화면당 1회(PLAYER 1 카드). 헤더에 방문자 숫자 금지(서버 현황은 라이브러리 하단).
- 색: #1B1530(남보라) #5BE08A(초록) #F3F1F8(밝은 바탕) #6B5FA0(보조). 글꼴: Galmuri11(제목·숫자, `next/font/local`) + Noto Sans KR. 본문 대비 4.5:1 이상.
- 카운터: 브라우저 무작위 UUID만 저장, IP·개인정보 저장 금지. 하루 기준 Asia/Seoul. `/api/stats` 60초 캐시.
- DB 변경은 SQL을 사용자에게 보여 주고 승인받은 뒤 적용한다.

## Review Focus
1. 카운터 표가 비었거나 `/api/stats` 실패 → 숫자 자리에 "집계 준비 중", TOP 5 숨김, 페이지는 정상 렌더 (Task 4 테스트)
2. 납품작 선택 시 원래 URL이 DOM에 없음, 버튼은 아이스크림 링크 (Task 1·4 테스트)
3. `?app=없는-slug` → 첫 대표 앱으로 대체, 오류 없음 (Task 1 테스트)
4. localStorage 차단(사파리 비공개 등) → 인트로는 그 페이지 로드에서 한 번 보이고 예외 없음, 추적은 조용히 건너뜀 (Task 3·5 테스트)
5. `/api/track`에 등록 안 된 slug·잘못된 vid·연타 → 400/429, DB 쓰기 없음 (Task 3 테스트)

---

### Task 1: 브랜치 · Vitest · 카탈로그 순수 로직

**Files:**
- Create: `vitest.config.ts`, `src/lib/launcher/catalog.ts`, `src/lib/launcher/catalog.test.ts`
- Modify: `package.json` (scripts `"test": "vitest run"`, devDep `vitest`), `src/lib/repositories/types.ts` (ProjectRow 확장)

**Interfaces:**
- Produces:
  - `ProjectRow`에 `featured: boolean; featured_order: number | null; tag: string | null; grade: string | null; hero_image_path: string | null; partner: "i-scream" | null; partner_url: string | null; track_slug: string | null`
  - `type Stage = 1 | 2 | 3`; `stageOf(c: ProjectCategory): Stage | null` (`etc`→null, 런처에서 제외)
  - `type LauncherApp = { slug; name; desc; tag; grade; stage: Stage; featured: boolean; order: number; thumb: string | null; hero: string | null; action: { kind: "play"; href: string } | { kind: "partner"; href: string; note: string }; trackSlug: string | null }`
  - `toLauncherApp(row: ProjectRow, thumbUrl: (p: string|null)=>string|null): LauncherApp | null`
  - `groupForLibrary(apps: LauncherApp[], q: string): { stage: Stage; title: string; featured: LauncherApp[]; emptySlots: number; rest: LauncherApp[] }[]`
  - `pickSelected(apps: LauncherApp[], slug: string | null): LauncherApp | null`
  - `const STAGE_TITLES`, `const SLOT_MAX = {1: 8, 2: 3, 3: 3}`, `const ISCREAM_URL`

- [ ] **Step 1:** `git checkout -b feat/bangguseok-launcher`; `npm i -D vitest`; vitest.config.ts에 `@` → `src` alias.
- [ ] **Step 2: 실패하는 테스트 작성** — `catalog.test.ts`:
  - `toLauncherApp(partnerRow).action` → `{kind:"partner", href:"https://issamgpt.com/ai-mart?type=ALL", note:"아이스크림에 납품한 작품이에요"}`이고 `JSON.stringify(result)`에 row.external_url 문자열이 없다
  - `toLauncherApp({...row, category:"etc"})` → `null`; `status !== "published"` → `null`
  - `groupForLibrary`: 대표 10개 STAGE 1 입력 → featured 길이 8(featured_order 오름차순), 넘친 2개는 rest; STAGE 2 대표 1개 → `emptySlots === 2`
  - `groupForLibrary(apps, "수학")` → 이름·태그에 "수학" 포함만, 검색 중엔 `emptySlots === 0`; 결과 없으면 `[]`
  - `pickSelected(apps, "nope")` → STAGE 1 첫 대표; `pickSelected([], null)` → `null`
- [ ] **Step 3:** `npm test` → FAIL(모듈 없음)
- [ ] **Step 4:** 구현. 검색은 공백 제거·소문자 후 `includes`(초성 검색 없음).
- [ ] **Step 5:** `npm test` → PASS; `npx tsc --noEmit` 통과
- [ ] **Step 6:** commit `feat(launcher): catalog model and grouping logic`

### Task 2: DB 마이그레이션 · 시드 · 저장소 함수 (승인 게이트)

**Files:**
- Create: `supabase/migrations/20261111000000_launcher.sql`, `supabase/seed/20261111_launcher_catalog.sql`
- Modify: `src/lib/repositories/projects.ts`

**Interfaces:**
- Consumes: Task 1 `ProjectRow` 확장 필드
- Produces: `listLauncherRows(): Promise<ProjectRow[]>` (published, category ≠ etc); SQL 함수 `app_stats() returns table(slug text, today bigint, total bigint)`

- [ ] **Step 1:** 마이그레이션 작성 — `projects`에 Task 1 열 추가(`partner` check in ('i-scream')), `track_slug` unique; 표 `app_visits(app_slug text not null, visitor_id uuid not null, day date not null, primary key(app_slug, visitor_id, day))` + RLS enable(정책 없음 = anon 차단); 함수 `app_stats()`: today = `day = (now() at time zone 'Asia/Seoul')::date`의 고유 visitor 수, total = 전체 고유 visitor 수; `portal` 포함.
- [ ] **Step 2:** 시드 작성 — 스펙 5절 카탈로그 전 항목 upsert(on conflict slug). external_url은 각 저장소 README/Vercel 도메인에서 확인한 값; 확인 못 한 항목은 `status='draft'`로 넣고 목록을 사용자에게 보고. 납품작 6종은 `partner='i-scream'`, `partner_url` = ISCREAM_URL, `external_url = null`. 대표 순서는 스펙 ★ 순서. woorimal-rpg는 draft.
- [ ] **Step 3: 승인 게이트** — 두 SQL 파일을 사용자에게 보여 주고 승인받는다. 승인 후 Supabase(MCP 또는 사용자 대시보드 SQL 편집기)에 적용. 적용 결과로 `select count(*) from projects where status='published'`와 `select * from app_stats()`를 실행해 기록.
- [ ] **Step 4:** `listLauncherRows()` 구현(기존 listPublishedProjects 패턴, `.neq("category","etc")`).
- [ ] **Step 5:** commit `feat(db): launcher columns, app_visits, catalog seed`

### Task 3: 카운터 API · t.js

**Files:**
- Create: `src/lib/stats/track.ts`, `src/lib/stats/track.test.ts`, `src/app/api/track/route.ts`, `src/app/api/stats/route.ts`, `public/t.js`, `src/lib/supabase/admin.ts`(service role 클라이언트, 서버 전용)
- Modify: `src/lib/rateLimit.ts`

**Interfaces:**
- Consumes: `app_visits`, `app_stats()`, `projects.track_slug`
- Produces:
  - `checkRateLimit(key: string, opts?: { max: number; windowMs: number })` — 기본값은 기존(3회/1시간) 유지해 contact 라우트 동작 불변
  - `parseTrack(body: unknown): { app: string; vid: string } | null` (zod: app `^[a-z0-9-]{2,40}$`, vid uuid v4)
  - `seoulDay(d: Date): string` (YYYY-MM-DD)
  - `GET /api/stats` → `{ ok: true, portal: {today, total}, apps: Record<slug,{today,total}> } | { ok: false }`
  - `POST /api/track` → 204 | 400 | 429
  - `t.js`: `data-app` 읽어 localStorage `bg_vid`(없으면 생성) → `navigator.sendBeacon('https://s-edu.ai.kr/api/track', …)`; 하루 1회만(`bg_sent_<app>_<day>`); localStorage 예외 시 아무것도 안 함

- [ ] **Step 1: 실패하는 테스트** — `parseTrack({app:"plane-puzzle", vid:<uuid>})` 통과; `app:"../x"`, `vid:"abc"`, 누락 → null. `seoulDay(new Date("2026-11-10T15:30:00Z")) === "2026-11-11"`. `checkRateLimit("k",{max:2,windowMs:1000})` 세 번째 `ok:false`, 기본 호출은 기존처럼 4번째부터 false.
- [ ] **Step 2:** `npm test` → FAIL
- [ ] **Step 3:** 구현. track 라우트: parseTrack → rate limit(`track:`+vid, 30/분) → slug가 `portal` 또는 published `track_slug`인지 확인(60초 메모리 캐시) → `insert … on conflict do nothing`. CORS: 요청 Origin이 published external_url들의 origin 또는 s-edu.ai.kr일 때만 허용 헤더. stats 라우트: `app_stats()` 호출, `revalidate = 60`, 실패 시 `{ok:false}` 200.
- [ ] **Step 4:** `npm test` PASS; `npm run build` 성공
- [ ] **Step 5:** commit `feat(stats): track/stats API and t.js snippet`

### Task 4: 런처 UI

**Files:**
- Create: `src/components/launcher/Launcher.tsx`(client, 상태·URL 동기화), `Library.tsx`, `AppStage.tsx`, `StatsLine.tsx`, `ServerStatus.tsx`, `TopPlayed.tsx`, `PlayerCard.tsx`, `src/lib/launcher/stats.ts` + `stats.test.ts`
- Modify: `src/app/page.tsx`(서버: rows+stats 읽어 Launcher에 전달), `src/app/globals.css`(토큰)

**Interfaces:**
- Consumes: Task 1 `LauncherApp`, `groupForLibrary`, `pickSelected`; Task 3 stats 응답
- Produces: `formatCount(n: number | undefined, ok: boolean): string` ("집계 준비 중" | "1,234"); `topPlayed(apps, stats, n=5): {app, total}[]` (total 0 제외, partner 제외)

- [ ] **Step 1: 실패하는 테스트** — `formatCount(undefined,false) === "집계 준비 중"`, `formatCount(1234,true) === "1,234"`, `formatCount(0,true) === "0"`; `topPlayed`가 total 0·partner 앱을 빼고 내림차순 5개.
- [ ] **Step 2:** `npm test` FAIL → 구현 → PASS
- [ ] **Step 3:** 컴포넌트 구현 — 시안 "② 메인 · 게임 런처"를 따른다: 상단 바(로고 · 라이브러리 / AI 뉴스 `/news` / 배우기 `/learn` / 앱 제안·문의 `/contact` / ↺ 인트로), 왼쪽 라이브러리(검색 `<input type=search>` + label, STAGE별 대표·빈 슬롯 점선·"전체 라이브러리 ▾" 접기, 하단 ServerStatus), 오른쪽 AppStage(hero 이미지 cover + 왼쪽 그라데이션, 이름 Galmuri 40px, ▶ PLAY `<a target=_blank rel=noopener>` 또는 partner 버튼+안내), StatsLine(partner면 "아이스크림 AI마트 제공"), 아래 TopPlayed(비면 섹션 숨김)·PlayerCard(캐릭터 1회). 선택은 `?app=` 쿼리와 동기화(`router.replace`, scroll 없음). 폭 < 900px에서 세로로 쌓고 STAGE 목록 접기.
- [ ] **Step 4:** 포털 방문 집계 — Launcher 마운트 시 `t.js`와 같은 규칙으로 `portal` 1회 전송(공용 `src/lib/stats/client.ts`).
- [ ] **Step 5:** `_test/launcher.py`(기존 smoke.py 형식) — 홈 로드, 납품작 클릭 시 버튼 href = 아이스크림 URL이고 페이지 HTML에 그 앱 external 도메인 문자열 없음, `?app=nope` 로드 시 오류 없이 첫 대표 표시, `/api/stats`를 500으로 가로채면 "집계 준비 중" 표시, 검색 "zzzz" → 안내 문구.
- [ ] **Step 6:** `npm run build` + 로컬 `next start`로 `_test/launcher.py` PASS
- [ ] **Step 7:** commit `feat(launcher): launcher home UI`

### Task 5: 인트로 오버레이

**Files:**
- Create: `src/components/launcher/IntroOverlay.tsx`, `src/lib/launcher/introSeen.ts` + `introSeen.test.ts`
- Modify: `Launcher.tsx`(오버레이 포함, 상단 "↺ 인트로"가 `window.dispatchEvent(new Event("bg:intro"))`)

**Interfaces:**
- Produces: `readIntroSeen(storage: Storage | null): boolean`, `writeIntroSeen(storage: Storage | null): void` — 키 `bg_intro_seen_v1`, 예외·null이면 read는 false, write는 무시

- [ ] **Step 1: 실패하는 테스트** — getItem이 throw하는 가짜 storage → `readIntroSeen` false, `writeIntroSeen` throw 없음; 정상 storage 왕복 true.
- [ ] **Step 2:** FAIL → 구현 → PASS
- [ ] **Step 3:** 오버레이 구현 — 시안 "① 인트로": 방 일러스트(hero 캐릭터 대형) 전체 화면, 왼쪽 로고·"▶ 서버 접속하기"·PRESS START, 로딩 바+로그 5줄(약 2.5초), 모니터(transform-origin 58.3% 59%)로 scale 7 줌 1.15초, ACCESS GRANTED 후 닫힘·포커스는 라이브러리 검색창으로. "건너뛰기 ▶▶" 항상, Esc도 건너뛰기. `prefers-reduced-motion` → 줌·깜빡임 없이 페이드. 닫힐 때 `writeIntroSeen`. 열린 동안 배경 `inert`.
- [ ] **Step 4:** `_test/launcher.py`에 추가 — 첫 방문 시 오버레이 보임, 건너뛰기 후 새로고침하면 안 보임, "↺ 인트로"로 다시 열림.
- [ ] **Step 5:** build + 테스트 PASS → commit `feat(launcher): first-visit server-connect intro`

### Task 6: 레이아웃 정리 · 브랜드 교체 · 관리자 필드

**Files:**
- Modify: `src/app/layout.tsx`(ShutterLoader 제거, Galmuri `next/font/local`, metadata), `src/components/layout/TopNav.tsx`·`Footer.tsx`(새 톤, 홈에서는 Launcher 자체 상단 바만), `next.config.ts`(`/projects` → `/` 308), `src/app/admin/(dashboard)/projects/ProjectForm.tsx`·`actions.ts`(Task 1 필드 입력·zod 검증)
- Delete: `src/components/layout/ShutterLoader.tsx`, `ParticleBackground.tsx`, `TerminalHeader.tsx`(참조 0 확인 후)
- Create: `src/fonts/Galmuri11.woff2`, `Galmuri11-Bold.woff2`, `src/fonts/OFL.txt`

- [ ] **Step 1:** `grep -rn "ShutterLoader\|ParticleBackground\|TerminalHeader\|선비이선생\|SEONBI" src` 로 참조 목록 확보 → 모두 교체·삭제
- [ ] **Step 2:** 관리자 폼에 featured·순서·tag·grade·hero 이미지 업로드·partner 선택·track_slug 추가. partner 선택 시 external_url 입력 비활성.
- [ ] **Step 3:** `npm run build` 성공; `_test/smoke.py`와 `_test/launcher.py` PASS; `/projects` 접속 시 `/`로 이동 확인
- [ ] **Step 4:** commit `refactor(layout): 방구석게이머 branding, remove terminal chrome, admin fields`

### Task 7: 썸네일 추가 생성 · 업로드

**Files:** 없음(Storage·DB 데이터) — 생성 스크립트는 사용자 PC 스크래치 `~/kie_gen.py` 재사용

- [ ] **Step 1:** 시드 후 `thumbnail_path is null`인 published 앱 목록 추출
- [ ] **Step 2:** 기존 PIX 프롬프트 규칙(16비트 픽셀, 남보라·초록·코랄, 글자 없음, 3:2)으로 kie.ai 생성(사용자 PC device_bash, IP 허용 목록 때문). 결과를 확인용 시트로 사용자에게 보여 줌
- [ ] **Step 3:** webp 변환(썸네일 900px, 대형 1536px) → Storage `project-thumbs/launcher/<slug>.webp`, `<slug>-lg.webp` 업로드 → `thumbnail_path`·`hero_image_path` 갱신. 기존 10장·캐릭터 4장도 같은 위치로.
- [ ] **Step 4:** 홈에서 썸네일 없는 published 앱 0개 확인

### Task 8: 프리뷰 배포 · 확인 · 반영

- [ ] **Step 1:** 브랜치 push → Vercel 프리뷰 URL 확보(빌드 로그 확인)
- [ ] **Step 2:** 프리뷰에서 `_test/launcher.py` 실행(BASE_URL 인자) PASS, 모바일 폭 390 스크린샷 확인
- [ ] **Step 3:** 사용자에게 프리뷰 링크 전달 → 승인 후 main 병합(PR) → 프로덕션 확인
- [ ] **Step 4:** (후속, 별도 승인) 대표 앱 저장소부터 `t.js` 한 줄 추가 PR

# 방구석게이머 런처 — s-edu.ai.kr 리팩토링 설계

작성: 2026-11-11 · 대상 저장소: `989-alt/Seonbi-Lee.T` (Vercel `seonbi-lee-t`, 도메인 s-edu.ai.kr)
시안: 디자인 캔버스 "방구석게이머 포트폴리오 시안" (① 인트로, ② 메인 · 게임 런처)

## 1. 왜
선생님들이 사이트에 오면 자기소개가 아니라 **앱을 바로 찾아 실행**하게 한다. 게임이 메인이다.
닉네임은 선비이선생 → **방구석게이머**로 바꾼다. 레퍼런스(moonsunezip.com)와는 디자인뿐 아니라
**페이지 구조도 다르게** 간다(카드 허브 ✕ → 게임 런처).

## 2. 목표 / 하지 않을 것 / 실패 조건
- 목표
  - 첫 화면에서 대표 앱을 고르고 ▶ PLAY 한 번으로 실행
  - 오늘 접속한 선생님 수 · 누적 방문 수, 앱별 누적/오늘 사용자 수 표시
  - 처음 방문 때 "서버 접속하기" 인트로(방 장면 → 모니터 줌인), 건너뛰기 가능
  - 아이스크림 납품작 6종은 직접 실행 대신 아이스크림 AI마트로 안내
- 하지 않을 것: 100일 챌린지 미니앱(day-*, project-*, quiz-math-*), 개인 용도 프로젝트, 로그인·즐겨찾기
- 실패 조건
  - 레퍼런스와 구조가 닮음: 헤더 방문자 카운터, 캐릭터 반복 등장, HOT/NEW 배지, 썸네일 카드 격자 허브 — 쓰지 않는다
  - 납품작이 원본 배포 주소·저장소로 연결됨
  - 교실 TV·프로젝터에서 목록 글자가 안 읽힘
  - 카운터가 학생·교사 개인정보를 수집함

## 3. 정해진 것 (사용자 결정)
| 항목 | 결정 |
|---|---|
| 페이지 틀 | C안 게임 런처 (왼쪽 라이브러리 + 오른쪽 선택 앱 큰 화면) |
| 인트로 | A안 방 장면 → 모니터 줌인, 첫 방문 1회 + 건너뛰기 |
| 첫인상·톤 | 오락실 같은 설렘, 게임 화면처럼(STAGE, ▶ PLAY, PLAYER 1) |
| 밝기 | 상단 바·선택 앱 화면은 어둡게, 라이브러리·목록은 밝게 |
| 캐릭터 | 사용자 그림 기준 kie.ai 생성, 화면당 1회만 (만든 사람 카드) |
| 썸네일 | 16비트 픽셀아트, kie.ai(GPT Image 2.6) 생성 |
| 배지 | HOT/NEW 없음 |
| 개수 | 대표 슬롯 8 / 3 / 3 + 그 밖은 "전체 라이브러리" |
| 납품작 | 목록에 함께, 버튼만 "아이스크림 AI마트에서 이용하기" → https://issamgpt.com/ai-mart?type=ALL |
| 카운터 | 기존 Supabase에 저장 |
| 100일 챌린지 | 이번 범위 제외 |
| 개인 프로젝트 | 제외 |

## 4. 방법 비교
- 페이지 틀: A 방 탐험 / B 월드맵 / **C 런처(선택)** — C가 레퍼런스와 확실히 다르면서 앱을 가장 빨리 찾음. A는 인트로로 흡수.
- 카운터: **Supabase(선택)** / Cloudflare Workers — 이미 Supabase·관리자 화면이 있어 관리 지점이 하나로 끝남.
- 캐릭터 이미지: **레퍼런스 기반 생성(선택)** / 텍스트만 / 원본 1장.

## 5. 앱 카탈로그
STAGE 1 = 게임·수업자료(`edutech`), STAGE 2 = 학급운영(`class`), STAGE 3 = 학교행정(`admin`). ★ = 대표 슬롯, 🍦 = 아이스크림 납품작.

**STAGE 1 게임·수업자료**
| 앱 | 저장소 | 비고 |
|---|---|---|
| ★ 숫자야구 | math-baseball | workers.dev |
| ★ 한 판! 돌리고 뒤집기 | plane-puzzle | github.io |
| ★ 한상 식당 | hansang-tycoon | github.io |
| ★ K-무역상 | world-trade | Vercel |
| ★🍦 할머니의 사진첩 | grandma-album | 아이스크림 |
| ★🍦 돌아라! 지구 한 바퀴 (세계여행) | traveling-world-game | 아이스크림 |
| ★🍦 이어라! 언어 표현 한 바퀴 (텔레스트레이션) | sokdam-chain | 아이스크림 |
| ★🍦 큐브 왕국 건축가 (3D 우봉고) | space-puzzle | 아이스크림 |
| 🍦 퀴즈 서바이벌 | quiz-survivor | 아이스크림 |
| 🍦 키워라! 식물 한살이 (식물키우기) | kiwora | 아이스크림 |
| 민주주의의 여정 | democracy-journey | |
| 원의 넓이 탐험대 | circle | github.io |
| 천체 시뮬레이터 COSMIC-EDU | cosmic-edu | Vercel |
| 모두의 교실 디자인 스튜디오 | design-for-all | github.io |
| 국기 따라 그리기 | world-flags-drawing | Vercel |
| 한국사 역사 지도 | korean-history-map | |
| 퀴즈 생성기 | quiz | github.io |
| AI 미술 도안 워크스페이스 | art-class-workspace | Vercel |
| CineEdu 영화 학습지 | movie-worksheet | Vercel |
| 말빛 한울 (가제) | woorimal-rpg | 완성 여부 확인 후 공개 |

**STAGE 2 학급운영**: ★ 자리바꾸기(seat-changer), ★ 발표자 뽑기(class-picker), ★ 랜덤픽(randompick), 쿵쿵따! 끝말잇기(last-word-game), 학급 모둠 점수판(group-socre), 학급 활동 기록판(classroom-board)

**STAGE 3 학교행정**: ★ AI 평어·행발(evaluationapp), ★ 전담 시간표 편성(time-table), ★ 누가기록 생성기(nuga-log-app), 평어 도우미(eval-helper)

**제외**: day-*/project-*/quiz-math-*(챌린지), housewarming, recipes, dress-tour-sketchbook, honeymoon-guide, wedding-gift-ledger, redev-map, trend-trader, lotto-generator, smart-do-it, memo-smoke, MCP·프록시·스킬 저장소, 중복 배포본(-99sh, -v1.2, -pg1u, -misimport), ai-class, FILM, presentor(class-picker와 중복), recreation, sky-climber, season-lab, kinetic, qr

각 앱의 실제 배포 주소·대상 학년·설명은 구현 때 README/배포 화면에서 확인해 채운다(확인 불가 항목은 사용자에게 묻는다).

## 6. 화면
**인트로 (`/` 첫 방문 시 오버레이)** — 방 일러스트 전체 화면, 왼쪽에 로고·"▶ 서버 접속하기"·PRESS START. 누르면 로딩 바+접속 로그(약 2.5초) → 모니터로 줌인 → ACCESS GRANTED → 런처. "건너뛰기 ▶▶" 항상 표시. `localStorage`에 본 기록 저장, `prefers-reduced-motion`이면 줌 없이 페이드. 상단 메뉴 "↺ 인트로"로 다시 보기.

**런처 (`/`)**
- 상단 바(어두움): 로고 방구석게이머 · 라이브러리 / AI 뉴스(`/news`) / 배우기(`/learn`) / 앱 제안·문의(`/contact`) / ↺ 인트로
- 왼쪽 라이브러리(밝음): 검색, STAGE 1·2·3 대표 슬롯(빈 슬롯 점선), 그 아래 "전체 라이브러리 ▾"(분류 필터), 맨 아래 "서버 현황"(오늘 접속한 선생님 · 누적 방문)
- 오른쪽(어두움): 선택 앱의 큰 픽셀 일러스트 위에 STAGE·태그·이름·설명·▶ PLAY(새 탭) / 납품작은 "🍦 아이스크림 AI마트에서 이용하기" + "아이스크림에 납품한 작품이에요" 안내
- 기록 줄: 누적 플레이어 · 오늘 플레이 · 대상 · 실행 방식 (납품작은 숫자 대신 "아이스크림 AI마트 제공")
- 아래: 많이 플레이한 앱 TOP 5(실제 집계, 동률·0이면 숨김) · PLAYER 1 만든 사람 카드(캐릭터 1회)
- URL: `/?app=<slug>`로 선택 상태 공유 가능
- 모바일: 라이브러리가 위로, 선택 앱 화면이 아래로 쌓임. 목록은 STAGE별 접기.

**기존 페이지**: `/projects`는 `/`로 리다이렉트. `/news`, `/learn`, `/about`, `/contact`, `/admin`은 유지하되 새 색·글꼴로 머리·바닥만 맞춘다. TerminalHeader·ParticleBackground·ShutterLoader는 제거.

## 7. 데이터 (Supabase)
`projects` 표에 열 추가 (마이그레이션 1개):
- `featured boolean default false`, `featured_order int`
- `tag text`(예: "게임 · 수학"), `grade text`(예: "3~4학년")
- `hero_image_path text`(큰 일러스트), 기존 `thumbnail_path`는 작은 썸네일
- `partner text null`(`'i-scream'`), `partner_url text null`
- `track_slug text unique` — 카운터 키 (기본값 = slug)
관리자 프로젝트 폼에 위 필드 추가. 카탈로그는 시드 SQL로 넣는다.

새 표 `app_visits`:
```
app_slug text, visitor_id uuid, day date (Asia/Seoul),
primary key (app_slug, visitor_id, day)
```
- 포트폴리오 방문은 `app_slug = 'portal'`
- 오늘 = 그날 고유 visitor 수, 누적 = 고유 visitor 수(전체 기간)
- 집계 뷰/함수 `app_stats()` → `{slug, today, total}`; 결과는 60초 캐시
- RLS: anon 쓰기·읽기 금지. 서버 라우트만 service role로 접근

## 8. 카운터 API
- `POST /api/track` `{app, vid}` — `vid`는 브라우저가 만든 무작위 UUID(localStorage). 개인정보·IP 저장 안 함. 기존 `lib/rateLimit` 적용, 등록된 `track_slug`만 허용, CORS는 카탈로그 앱 도메인만.
- `GET /api/stats` — 공개 숫자만 반환, 60초 캐시.
- 앱용 스니펫 `public/t.js`: `<script src="https://s-edu.ai.kr/t.js" data-app="plane-puzzle" defer></script>` 한 줄.
- 롤아웃: 1단계 포털 방문만 집계 → 2단계 대표 앱부터 각 저장소에 스니펫 추가(저장소마다 커밋·배포 필요). 스니펫이 없는 앱은 "집계 준비 중"으로 표시.

## 9. 이미지
- 이미 생성: 캐릭터 4장, 썸네일 10장(+ 대형) — `Downloads/bangguseok-assets`
- 추가 생성: 카탈로그 중 썸네일 없는 앱(약 16개)을 같은 프롬프트 규칙으로 kie.ai 생성(사용자 PC에서 실행, IP 허용 목록 때문)
- 저장: Supabase Storage `project-thumbs` (기존 버킷), webp

## 10. 글꼴·색
Galmuri11(OFL, 제목·숫자) + Noto Sans KR(본문). 남보라 #1B1530, 초록 #5BE08A, 밝은 바탕 #F3F1F8, 보조 #6B5FA0. 본문 대비 4.5:1 이상.

## 11. 진행 순서
1. 브랜치 `feat/bangguseok-launcher` 생성
2. 마이그레이션 + 시드(카탈로그) — 적용 전 SQL을 보여주고 승인받음
3. 런처 UI · 인트로 · 레이아웃 교체
4. `/api/track`, `/api/stats`, `t.js` + 포털 방문 집계
5. 썸네일 추가 생성·업로드
6. Vercel 프리뷰 배포 → 사용자 확인 → 프로덕션 반영
7. (후속) 각 앱 저장소에 스니펫 추가

## 12. 사용자가 확인할 것
- ⚠️ 납품작 저장소 공개 상태: grandma-album, quiz-survivor, space-puzzle, traveling-world-game, sokdam-chain, kiwora — 계약상 비공개 필요 여부
- 실행 방식 문구(로그인 필요 여부)는 앱별로 확인
- 말빛 한울(woorimal-rpg) 공개 여부

## 13. 빌더 재량
간격·애니메이션 세부, 아이콘, 접근성 보완, 컴포넌트 분리 방식, 캐시 방법.

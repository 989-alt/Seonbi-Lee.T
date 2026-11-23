# 사주·타로 운세 페이지 개발 방향 (로컬 작업 인수인계)

> 작성일 2026-11-23 · 브랜치 `claude/gifted-ride-bms6uo` · PR 989-alt/Seonbi-Lee.T#27 (draft, 문서만 포함)
> 목적: 선생님들이 들어와 재미로 사주·타로를 보고, 결과 화면에서 SEONBI'S LAB 콘텐츠(배움터·놀이터·프로젝트)로 자연스럽게 이동하게 한다.

---

## 1. 지금까지 정해진 것

| 항목 | 결정 내용 | 근거 문서 |
|---|---|---|
| 성격 | 심심풀이 운세. 모든 화면에 "재미로 보는 운세" 고지 | `saju-tarot-logic.md` Part 4 |
| 개인정보 | **수집하지 않는다.** 생년월일·시각·성별은 브라우저에서만 계산하고, 서버와 API에는 계산 결과(간지·오행 등)만 보낸다. 로그인 없음, 원문 저장 없음 | `question-catalog.md` §0, C2 |
| 계산 vs 문장 | 계산·판정(합충, 용신, 점수, 셔플)은 **코드**가 결정론적으로 하고, Claude는 그 결과를 **상담 문장으로 풀어 쓰기만** 한다 | `question-catalog.md` A4 |
| AI 모델 | 실시간 상담은 **Claude Sonnet 5.5** (`claude-sonnet-5-5`) | `question-catalog.md` Part C |
| 비용 구조 | 오늘의 운세·띠별 운세·카드 기본 문장은 **Batch API로 미리 생성**(월 수천 원으로 고정). 자유 질문·주제 상담만 실시간 호출(1회 약 11~62원) | `question-catalog.md` C3 |
| 질문 범위 | 사주: 기간(평생·대운 10/20/30년·연·월·일)과 영역(연애·결혼·재물·직업·학업 등)의 조합, 삼재, 택일. 타로: 주제 11종, 배열법 21종, 해석 기법 16종 | `question-catalog.md` Part A·B |
| 금지 영역 | 질병 진단, 수명, 투자 종목, 합격 단정, **특정 학생·타인에 대한 점** | `question-catalog.md` §0 |
| 카드 그림 | 기존 덱 복제 금지. 자체 제작 일러스트 사용 | `saju-tarot-logic.md` 2.8 |

## 2. 아직 정하지 않은 것 (로컬에서 먼저 결정)

1. **화풍.** `gpt-asset-guide.md` §0-1의 7가지 후보(픽셀·민화·수채·플랫·판타지·수묵·3D)로 GPT 앱에서 비교 시안을 뽑아 고른다. 사주와 타로를 다른 화풍으로 가져가는 것도 가능하다.
2. 화풍이 정해지면 v1 시안(`mockups/`)을 그 화풍에 맞게 다시 만든다. 모바일(390px) 시안도 함께 만든다.
3. **라우트 위치.** 제안은 `/fortune`(허브), `/fortune/saju`, `/fortune/tarot`이다. 기존 `/play/[slug]` 아래에 둘지도 결정이 필요하다.
4. 시안 기준 **AI 상담 하루 이용 한도**는 1인 3회이고, 긴 답변은 하루 1회로 제한한다.
5. 대운 기능에 성별 입력(선택)을 넣을지 여부. 넣지 않으면 그래프 대신 세운 12개월 달력을 보여준다.

## 3. 문서 지도

| 파일 | 내용 |
|---|---|
| `docs/fortune/saju-tarot-logic.md` | 사주 계산식(연·월·일·시주, 시각 보정, 오행·십신·12운성·합충·신살·대운), 타로 덱·스프레드·셔플·총평 규칙, 테스트 벡터 |
| `docs/fortune/question-catalog.md` | 답할 수 있는 질문 전체 목록, 질문별로 쓰는 계산 요소, Sonnet 5.5 연동 설계와 비용 |
| `docs/fortune/gpt-asset-guide.md` | GPT 앱에 붙여넣을 화풍·시안·에셋 프롬프트, 파일 이름 규칙, 체크리스트 |
| `docs/fortune/mockups/` | v1 SVG/PNG 시안(사주방·타로방), 에셋(A)·모션(M) 목록 |
| `docs/fortune/DEVELOPMENT.md` | 이 문서 |

## 4. 아키텍처

```
[브라우저]                                   [서버 (Next Route Handler)]          [Anthropic]
 입력 폼 ─▶ lib/fortune/saju (계산)           /api/fortune/ask                    Sonnet 5.5
         ─▶ lib/fortune/tarot (셔플·판정)  ─▶  · 금지 질문 필터                ─▶  (캐시된 시스템 프롬프트
 결과 UI ◀─ data/fortune (문장 테이블)         · PII 패턴 제거                      + 특징값 JSON)
         ◀─ /api/fortune/daily (사전 생성분)    · rate limit(lib/rateLimit.ts)
                                               · 응답 원문 저장 안 함
```

### 4-1. 폴더 구조 제안
```
src/
├─ lib/fortune/
│  ├─ saju/
│  │  ├─ ganji.ts        천간·지지 표, 60갑자 index 유틸
│  │  ├─ calendar.ts     JDN, KST·서머타임→UTC(tzdb), 경도 보정, 음력→양력(KASI 표)
│  │  ├─ solarTerms.ts   12절 시각 조회(내장 JSON)
│  │  ├─ pillars.ts      연·월·일·시주 계산(자시 옵션)
│  │  ├─ analysis.ts     오행 분포, 지장간, 십신, 12운성, 신강약, 용신(간이)
│  │  ├─ relations.ts    합·충·형·파·해, 신살, 공망, 삼재
│  │  ├─ daeun.ts        대운·세운·월운
│  │  └─ today.ts        오늘의 운세 점수·테마·행운 아이템
│  ├─ tarot/
│  │  ├─ deck.ts         78장 정의
│  │  ├─ shuffle.ts      Fisher–Yates(crypto), 오늘의 카드 시드(mulberry32)
│  │  ├─ spreads.ts      배열법 정의(position 의미)
│  │  └─ summary.ts      메이저 비율·슈트 분포·원소 품위·퀸테센스
│  └─ ai/
│     ├─ features.ts     API로 보낼 특징값 JSON 생성(원본 정보 제외)
│     ├─ scrub.ts        전화·이메일·주민번호 패턴 제거, 금지 주제 판별
│     └─ prompt.ts       시스템 프롬프트(고정, 캐시 대상)
├─ data/fortune/
│  ├─ solar-terms-1900-2100.json
│  ├─ lunar-kr-1900-2050.json
│  ├─ tarot-cards.ts     카드 키워드·메시지·teacherTip·contentTag
│  ├─ ilgan.ts           일간 캐릭터 10종 설명
│  └─ content-map.ts     운세 테마 → 사이트 콘텐츠 매핑
├─ app/fortune/          page.tsx(허브), saju/, tarot/
├─ app/api/fortune/ask/route.ts      실시간 상담(서버 전용 키)
└─ components/fortune/   PillarTable, OhaengRadar, LifeGraph, CardFan, TarotCard, …
public/fortune/          GPT로 뽑은 에셋(gpt-asset-guide §7 구조)
scripts/fortune/
├─ build-solar-terms.ts  절기 표 생성(1회)
└─ pregenerate.ts        Batch API로 일일·카드 문장 사전 생성
```

### 4-2. 기술 메모
- **Next.js 16은 학습 데이터와 다르다.** 코드를 쓰기 전에 `node_modules/next/dist/docs/`의 해당 가이드를 먼저 읽는다(`AGENTS.md` 규칙). 특히 라우트 핸들러, 캐싱, `next/font` 부분.
- 계산 로직은 **순수 함수**로 짜서 클라이언트 컴포넌트에서 호출한다. 서버로 생년월일을 넘기지 않는다.
- 시간대는 `Intl`/tzdb의 `Asia/Seoul`로 처리한다. 1948~51, 1955~60, 1987~88년 서머타임과 1954~61년 UTC+8:30 표준시가 반영되어 있는 것을 확인했다.
- AI 호출:
  - 의존성 `@anthropic-ai/sdk`를 추가하고, `ANTHROPIC_API_KEY`는 `.env.local`과 Vercel 환경변수에만 둔다. 클라이언트에 노출하면 안 된다.
  - 시스템 프롬프트는 고정해서 프롬프트 캐싱을 적용한다(약 3,500토큰).
  - effort는 짧은 답에 `low`, 긴 답에 `medium`을 쓴다.
  - refusal에 대비해 서버 측 fallback을 설정한다(`fallbacks: "default"`, 베타 헤더 필요).
  - 출력 길이 상한은 500자, 1,200자, 2,500자 세 단계로 둔다.
- 모션은 CSS keyframes와 Web Animations API를 기본으로 하고, 카드 드래그만 pointer 이벤트로 처리한다. `prefers-reduced-motion`을 지원한다.
- 기존 자산을 재사용한다: `lib/rateLimit.ts`, `lib/stats`(클릭 지표, 원문 미기록), `/og` 라우트(결과 공유 이미지), 갈무리 폰트.

## 5. 단계별 계획

| 단계 | 목표 | 산출물 | 완료 기준 |
|---|---|---|---|
| **P0 디자인** | 화풍 확정, 시안 v2(데스크톱+모바일), 1차 에셋 | `public/fortune/` 1차 필수 에셋(스타일 시트, 마스코트, 일간 10종, 카드 뒷면·틀, 메이저 22장) | 화풍 결정 기록, 시안 승인 |
| **P1 계산 엔진** | 사주·타로 순수 로직 + 테스트 | `lib/fortune/**`, 절기·음력 데이터 | `npm test` 통과, 테스트 벡터 + 만세력 대조 10~20건 |
| **P2 타로 MVP** | 오늘의 카드(메이저 22, 날짜 시드), 쓰리카드 | `/fortune/tarot` | 같은 날 같은 결과, 역방향 옵션 |
| **P3 사주 MVP** | 생년월일 입력 → 원국·일간 캐릭터·오행·오늘의 운세 | `/fortune/saju` | 시각 모름·자시·서머타임 엣지 케이스 통과 |
| **P4 UI·모션** | 시안의 M1~M6(사주), M1~M4(타로) 구현 | 컴포넌트, 애니메이션 | 모바일 확인, 저사양 모드 |
| **P5 사전 생성** | 일일 운세·카드 문장 Batch 생성 파이프라인 | `scripts/fortune/pregenerate.ts`, 저장소(Supabase 등) | 하루 1회 자동 갱신 |
| **P6 AI 상담** | 주제 상담·자유 질문 | `/api/fortune/ask` | PII 제거·금지 주제·rate limit·출력 상한 동작 |
| **P7 확장** | 대운 인생 그래프, 마이너 56장, 배열법 확장, 삼재·택일, 결과 공유 이미지 | — | 단계별 출시 |

> MVP 범위는 P1부터 P4까지이고 API 비용이 들지 않는다. P5와 P6부터 API 키가 필요하다.

## 6. 테스트 기준값 (vitest)

| 대상 | 입력 | 기대값 |
|---|---|---|
| 일주 | 2000-01-01 / 1900-01-01 / 2026-11-22 / 2026-11-23 | 戊午 / 甲戌 / 庚子 / 辛丑 |
| 연주 | 2024-02-03(입춘 전) / 2024-02-05 | 癸卯 / 甲辰 |
| 월두·시두 | 甲년 寅월 / 甲일 子시 / 乙일 子시 | 丙寅 / 甲子 / 丙子 |
| 시안 예시 | 1988-05-21 15:20 KST(서머타임 UTC+10), 서울 | 乙未 丙子 丁巳 戊辰, 태양시 13:48 |
| 삼재 | 2026 丙午년 | 亥卯未띠(돼지·토끼·양) 눌삼재 |
| 타로 시드 | 같은 ID + 같은 KST 날짜 | 같은 카드 |

## 7. 로컬 작업 시작하기

```bash
git fetch origin claude/gifted-ride-bms6uo
```
```bash
git checkout claude/gifted-ride-bms6uo
```
```bash
npm install
```
```bash
npm run dev
```
```bash
npm test
```

- 시안 SVG를 PNG로 확인하고 싶으면 SVG 파일을 브라우저로 바로 열면 된다. 갈무리 폰트가 컴퓨터에 설치되어 있지 않으면 대체 글꼴로 보인다.
- PR #27은 지금 문서만 담은 draft 상태다. 구현은 같은 브랜치에서 이어 가거나, 문서 PR을 병합한 뒤 새 브랜치(예: `feat/fortune-mvp`)를 만들어 진행한다.

## 8. 알려진 이슈
- Vercel `seonbi` 프로젝트 빌드가 가끔 `next/font/google`(Noto Sans KR) 다운로드 실패로 깨진다. 코드 문제가 아니고 다시 빌드하면 통과한다. 반복되면 Noto Sans KR도 갈무리처럼 `src/fonts`에 로컬 폰트로 내장하는 방안을 검토한다.
- 한국 음력은 중국 음력과 가끔 하루씩 어긋난다. 중국 기준 라이브러리를 쓰지 말고 KASI 데이터로 만든 표를 쓴다.
- 정밀한 용신론은 학파마다 다르다. 결과 화면에 "간이 해석"이라고 명시한다.

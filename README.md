# SEONBI'S LAB — 포트폴리오

교사 이선학(선비이선생)의 작업 아카이브. Next.js 16 + Tailwind v4 + Naver SMTP.

## 빠른 시작

```bash
npm install
cp .env.local.example .env.local   # 열어서 SMTP_PASS 입력
npm run dev                         # http://localhost:3000
```

## Contact 폼 — Naver SMTP 설정

**1. 네이버 SMTP 활성화**
- 네이버 메일 → 환경설정 → POP3/IMAP/SMTP 설정 → "SMTP 사용함" 체크

**2. (2단계 인증 시) 앱 비밀번호 발급**
- https://nid.naver.com/user2/help/myInfoV2 → "애플리케이션 비밀번호"

**3. `.env.local` 작성**

```env
SMTP_HOST=smtp.naver.com
SMTP_PORT=465
SMTP_USER=sunhak98
SMTP_PASS=실제_비밀번호_또는_앱비밀번호
SMTP_FROM=sunhak98@naver.com
CONTACT_TO_EMAIL=sunhak98@naver.com
```

> `.env.local`은 `.gitignore`에 포함되어 커밋되지 않습니다.

**4. 테스트**
- `/contact` 페이지 → 폼 작성 → "INITIATE TRANSFER"
- `sunhak98@naver.com` 받은편지함 확인

## 구조

```
src/
├─ app/
│  ├─ layout.tsx            # 루트 레이아웃 (폰트 + 네비/푸터)
│  ├─ page.tsx              # 홈
│  ├─ projects/page.tsx     # 프로젝트 아카이브
│  ├─ news/page.tsx         # AI 뉴스
│  ├─ about/page.tsx        # 소개
│  ├─ contact/page.tsx      # 연락
│  ├─ api/contact/route.ts  # 메일 발송 API
│  └─ globals.css           # DESIGN.md 토큰 + 애니메이션
├─ components/
│  ├─ layout/               # TopNav, Footer, ShutterLoader, ParticleBackground, TerminalHeader
│  ├─ contact/ContactForm.tsx
│  └─ ui/SectionHeading.tsx
├─ data/
│  ├─ projects.ts           # 프로젝트 더미 데이터
│  └─ posts.ts              # 뉴스 더미 데이터
└─ lib/
   ├─ mail.ts               # nodemailer Naver SMTP 래퍼
   └─ rateLimit.ts          # in-memory 레이트 리밋
```

## 디자인 시스템

`../stitch_vibe_coder_dev_archive/cyberdocent_lab/DESIGN.md`의 **Neon Laboratory** 스펙을 `src/app/globals.css`의 `@theme` 블록으로 이식했습니다.

- **색상**: obsidian 배경 + 네온 시안/보라/오렌지
- **코너**: 모든 `border-radius` = 0 (DESIGN.md "sharp corners")
- **타이포**: Space Grotesk (headline/label) + Manrope (body) + Noto Sans KR (fallback)
- **모션**: `prefers-reduced-motion` 존중 — 파티클 캔버스와 stagger 애니메이션 자동 비활성화

## 접근성 / UX

- 모든 터치 타겟 최소 44×44px
- `aria-label`, `aria-hidden`, `aria-live="polite"` 적용
- Focus ring 2px primary
- Honeypot + in-memory 레이트 리밋(IP당 1시간 3회)

## 다음 단계

자세한 로드맵은 `../stitch_vibe_coder_dev_archive/developmentplan.md` 참조.

- Phase 2: Supabase Auth + 관리자 CMS (`/admin`)
- Phase 3: 프로젝트 CRUD (DB 연동으로 더미 데이터 교체)
- Phase 4: 뉴스 Markdown 에디터
- Phase 5: Plausible Analytics + 실측 푸터

## 스크립트

```bash
npm run dev     # 개발 서버
npm run build   # 프로덕션 빌드
npm run start   # 프로덕션 실행
```

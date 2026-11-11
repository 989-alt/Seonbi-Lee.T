import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { PageHero } from "@/components/ui/PageHero";
import { SkillBar } from "@/components/about/SkillBar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "플레이어 프로필 // 방구석게이머",
  description: "AI로 수업과 학급 운영을 돕는 프로그램을 만드는 교사 이선학(방구석게이머) 소개",
};

const STATS: { name: string; value: number; accentClass: string; textClass: string }[] = [
  { name: "CLAUDE", value: 95, accentClass: "bg-primary", textClass: "text-primary" },
  { name: "ANTIGRAVITY", value: 85, accentClass: "bg-secondary", textClass: "text-secondary" },
  { name: "GEMINI", value: 75, accentClass: "bg-tertiary", textClass: "text-tertiary" },
  { name: "N8N", value: 65, accentClass: "bg-on-surface", textClass: "text-on-surface" },
  { name: "ETC (MIDJOURNEY, STITCH...)", value: 55, accentClass: "bg-primary-dim", textClass: "text-primary-dim" },
];

/** 강의 — 최근 것이 위 */
const LECTURES: { title: string; org: string; href?: string }[] = [
  {
    title: "수업을 채우는 동료, 업무를 줄이는 비서 — 바로 쓰는 Claude",
    org: "비바샘 원격연수 강사",
    href: "https://t.vivasam.com/courses/job/t26-016",
  },
  { title: "The Master Class · Claude Code 중급반", org: "몽당분필 강사" },
  { title: "Claude A to Z", org: "에듀플러스위크 강사" },
  { title: "지식샘터 · 찾아가는 학교컨설팅", org: "강사" },
];

const HISTORY = [
  "아이스크림미디어 바이브코딩 공모전 수상",
  "상상그리다 필름 콘텐츠팀",
  "몽당분필 10기",
  "경기 교사 크리에이터 2기",
  "2024 교실혁명 선도교사",
  "2025 AIEDAP 마스터 교원",
  "ATC 파이썬 주니어스쿨 / 헬로메이플 강사 및 연구회원",
];

export default function AboutPage() {
  return (
    <main className="flex-grow pt-24 px-6 md:px-12 lg:px-20 pb-20 max-w-[1280px] mx-auto w-full">
      <div className="mt-6 mb-10">
        <PageHero
          label="PLAYER 1 · PROFILE"
          title="방구석게이머"
          desc={<>이천송정초등학교 교사 이선학. 밤마다 방구석에서 AI로 수업과 학급 운영을 돕는 프로그램을 만들어요.<br />콘텐츠 제안은 언제나 환영, 피드백은 최대한 빠르게 반영할게요.</>}
          image={{ src: "/launcher/char-pick.webp", alt: "손가락으로 가리키며 윙크하는 방구석게이머 캐릭터" }}
          action={
            <div className="flex flex-col gap-2">
              <Link href="/" className="rounded-[8px] bg-mint px-4 py-3 text-center font-pixel text-sm font-bold text-night">▶ 라이브러리</Link>
              <Link href="/contact" className="rounded-[8px] border-2 border-night-line px-4 py-3 text-center text-sm font-bold text-lilac hover:text-white">제보함 →</Link>
            </div>
          }
        />
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Reveal className="lg:col-span-7" direction="left">
          <div className="h-full rounded-[14px] border border-outline-variant bg-white p-7 md:p-8">
            <h2 className="m-0 mb-1 font-[family-name:var(--font-label)] text-[13px] tracking-[0.12em] text-primary">QUEST LOG</h2>
            <p className="m-0 mb-6 text-[22px] font-black text-on-surface">강의 · 연수</p>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {LECTURES.map((l) => {
                const body = (
                  <>
                    <span aria-hidden className="flex h-9 w-9 flex-none items-center justify-center rounded-[8px] bg-night font-pixel text-mint">★</span>
                    <span className="flex min-w-0 flex-col gap-[2px]">
                      <span className="text-[16px] font-bold leading-snug text-on-surface">{l.title}</span>
                      <span className="text-[13px] text-on-surface-variant">{l.org}{l.href ? " · 연수 보러 가기 ↗" : ""}</span>
                    </span>
                  </>
                );
                return (
                  <li key={l.title}>
                    {l.href ? (
                      <a href={l.href} target="_blank" rel="noopener" className="flex items-center gap-4 rounded-[10px] bg-surface-container p-3 hover:bg-secondary-container">{body}</a>
                    ) : (
                      <div className="flex items-center gap-4 rounded-[10px] bg-surface-container p-3">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </Reveal>

        <Reveal className="lg:col-span-5" direction="right" delay={0.1}>
          <div className="h-full rounded-[14px] border border-outline-variant bg-white p-7 md:p-8">
            <h2 className="m-0 mb-1 font-[family-name:var(--font-label)] text-[13px] tracking-[0.12em] text-primary">STATS</h2>
            <p className="m-0 mb-6 text-[22px] font-black text-on-surface">능력치</p>
            <ul className="space-y-5">
              {STATS.map((s) => (
                <SkillBar key={s.name} name={s.name} value={s.value} accentClass={s.accentClass} textClass={s.textClass} />
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <Reveal delay={0.15}>
        <section className="mt-6 rounded-[14px] border border-outline-variant bg-white p-7 md:p-8">
          <h2 className="m-0 mb-1 font-[family-name:var(--font-label)] text-[13px] tracking-[0.12em] text-primary">ACHIEVEMENTS</h2>
          <p className="m-0 mb-6 text-[22px] font-black text-on-surface">경력 · 이력</p>
          <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2">
            {HISTORY.map((item) => (
              <li key={item} className="flex items-center gap-3 rounded-[10px] bg-surface-container px-4 py-3">
                <span aria-hidden className="font-pixel text-[15px] text-tertiary">◆</span>
                <span className="text-[15px] text-on-surface">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </Reveal>
    </main>
  );
}

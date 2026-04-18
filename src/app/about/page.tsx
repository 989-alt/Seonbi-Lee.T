import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SkillBar } from "@/components/about/SkillBar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "소개 // SEONBI'S LAB",
  description: "교사 이선학 (선비이선생) 소개",
};

const SKILLS: { name: string; value: number; accentClass: string; textClass: string }[] = [
  { name: "CLAUDE", value: 95, accentClass: "bg-primary", textClass: "text-primary" },
  { name: "ANTIGRAVITY", value: 85, accentClass: "bg-secondary", textClass: "text-secondary" },
  { name: "GEMINI", value: 75, accentClass: "bg-tertiary", textClass: "text-tertiary" },
  { name: "N8N", value: 65, accentClass: "bg-on-surface", textClass: "text-on-surface" },
  { name: "ETC (MIDJOURNEY, STITCH...)", value: 55, accentClass: "bg-primary-dim", textClass: "text-primary-dim" },
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
    <main className="flex-grow pt-24 px-6 md:px-12 lg:px-20 pb-20 max-w-[1440px] mx-auto w-full">
      <section className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Reveal className="lg:col-span-7" direction="left">
          <div className="bg-surface-container-low p-8 md:p-10 relative h-full">
            <div
              aria-hidden="true"
              className="absolute top-0 left-0 w-[2px] h-full bg-primary"
            />

            <div className="flex flex-col md:flex-row gap-6 md:gap-10 h-full">
              <div className="flex-1 flex flex-col">
                <div>
                  <h1 className="font-[family-name:var(--font-headline)] text-4xl md:text-5xl font-bold text-on-surface mb-2 tracking-tight">
                    <span className="hero-keyword">선비이선생</span>
                  </h1>
                  <p className="font-[family-name:var(--font-label)] text-xs md:text-sm text-on-surface-variant tracking-widest">
                    이천송정초등학교 이선학
                  </p>
                  <Link
                    href="/contact"
                    className="inline-block mt-5 font-[family-name:var(--font-label)] text-sm text-primary tracking-widest hover:text-primary-dim transition-colors"
                  >
                    문의/요청 메일 보내기 →
                  </Link>
                </div>

                <p className="font-[family-name:var(--font-body)] text-on-surface-variant leading-relaxed mt-auto pt-8 md:pt-12">
                  AI를 활용해 수업과 학급 운영에 도움이 되는 여러 프로그램을
                  만드는 교사 이선학입니다. 콘텐츠 제안은 언제나 환영, 피드백은
                  최대한 빠르게 반영하겠습니다.
                </p>
              </div>

              <div className="flex-shrink-0 flex items-center justify-center md:items-start md:pt-2">
                <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden bg-surface-container-high ring-2 ring-primary/40 shadow-[0_0_40px_rgba(143,245,255,0.15)]">
                  <Image
                    src="/profile.png"
                    alt="선비이선생 프로필"
                    fill
                    sizes="(max-width: 768px) 144px, 176px"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal className="lg:col-span-5" direction="right" delay={0.1}>
          <div className="bg-surface-container-low p-8 relative h-full">
            <h2 className="font-[family-name:var(--font-headline)] text-lg tracking-widest uppercase text-on-surface mb-6">
              기술 스택
            </h2>
            <ul className="space-y-5">
              {SKILLS.map((s) => (
                <SkillBar
                  key={s.name}
                  name={s.name}
                  value={s.value}
                  accentClass={s.accentClass}
                  textClass={s.textClass}
                />
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <Reveal delay={0.15}>
        <section className="mt-12 bg-surface-container-low p-8 md:p-12 section-scan">
          <h2 className="font-[family-name:var(--font-headline)] text-lg tracking-widest uppercase text-on-surface mb-6 inline-flex items-center gap-3">
            <span aria-hidden="true" className="w-6 h-[2px] bg-primary" />
            경력 / 이력
          </h2>
          <ul className="space-y-3 font-[family-name:var(--font-body)] text-on-surface-variant">
            {HISTORY.map((item, i) => (
              <li key={i} className="flex items-start gap-3 group">
                <span
                  aria-hidden="true"
                  className="text-primary mt-1 font-[family-name:var(--font-label)] text-xs transition-transform group-hover:scale-125"
                >
                  ●
                </span>
                <span className="group-hover:text-on-surface transition-colors">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </Reveal>
    </main>
  );
}

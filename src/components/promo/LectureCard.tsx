import { LECTURE, LECTURE_WORLDS, worldOf, type LectureWorld } from "@/lib/promo/lecture";

const TONE: Record<LectureWorld["tone"], { tile: string; num: string; dot: string }> = {
  mint: { tile: "bg-mint-soft", num: "text-[#2f9a5a]", dot: "bg-[#2f9a5a]" },
  violet: { tile: "bg-[#eeeaf6]", num: "text-primary", dot: "bg-primary" },
  amber: { tile: "bg-[#fdeedd]", num: "text-[#b45a12]", dot: "bg-[#b45a12]" },
};

/** 배우기 페이지 강의 카드(C1): 보스 스테이지 + 15차시 타일 */
export function LectureCard() {
  return (
    <section aria-labelledby="lecture-title" data-lecture-card className="mb-14 flex flex-col gap-6">
      <div className="flex flex-col gap-6 rounded-[16px] border-[3px] border-mint bg-night p-6 text-[#edeaf7] sm:p-8 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="font-pixel text-xs font-bold tracking-[0.14em] text-mint">★ BOSS STAGE · {LECTURE.provider}</span>
          <h2 id="lecture-title" className="m-0 font-pixel text-[22px] leading-[1.4] font-bold text-white sm:text-[26px]">
            {LECTURE.title}
          </h2>
          <p className="m-0 text-sm text-lilac">{LECTURE.summary}</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {LECTURE.meta.split(" · ").map((m) => (
              <span key={m} className="rounded-full bg-mint px-3 py-1 font-pixel text-xs font-bold text-night">{m}</span>
            ))}
            <span className="rounded-full border border-night-line px-3 py-1 text-xs text-lilac">강사 · 방구석게이머</span>
          </div>
        </div>
        <a
          href={LECTURE.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-none self-start rounded-[10px] bg-mint px-6 py-4 text-center font-pixel text-base font-bold text-night shadow-[0_5px_0_#2f9a5a] hover:brightness-105 md:self-center"
        >
          ▶ 연수 신청하러 가기
        </a>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-on-surface-variant">
          <span className="font-pixel font-bold tracking-[0.1em] text-on-surface">15 STAGES</span>
          {LECTURE_WORLDS.map((w) => (
            <span key={w.name} className="flex items-center gap-[6px]">
              <span aria-hidden className={`h-[10px] w-[10px] rounded-[2px] ${TONE[w.tone].dot}`} />
              {w.name} {w.from}–{w.to}
            </span>
          ))}
        </div>
        <ol className="m-0 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3 lg:grid-cols-5">
          {LECTURE.lessons.map((t, i) => {
            const tone = TONE[worldOf(i + 1).tone];
            return (
              <li key={t} className={`flex items-start gap-[10px] rounded-[8px] px-3 py-[9px] ${tone.tile}`}>
                <span className={`flex-none pt-[2px] font-pixel text-xs font-bold ${tone.num}`}>{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[13px] leading-snug text-on-surface">{t}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

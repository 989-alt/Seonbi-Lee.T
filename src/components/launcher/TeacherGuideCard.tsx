import type { TeacherGuide } from "@/lib/launcher/guide";

function Chip({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-[2px] rounded-[8px] bg-paper px-3 py-2">
      <span className="text-[12px] text-ink-soft">{label}</span>
      <span className="text-[15px] font-bold text-night">{value}</span>
    </div>
  );
}

export function TeacherGuideCard({ guide, appName }: { guide: TeacherGuide; appName: string }) {
  return (
    <section aria-label="교사용 안내" className="flex min-w-0 flex-[2_1_520px] flex-col gap-5 rounded-[12px] border border-paper-line bg-white px-6 py-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="m-0 font-pixel text-lg font-bold text-night">교사용 안내</h2>
        <span className="text-[13px] text-ink-soft">{appName}</span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2">
        <Chip label="어떤 게임" value={guide.genre} />
        <Chip label="인원" value={guide.players} />
        <Chip label="시간" value={guide.time} />
        <Chip label="준비물" value={guide.device} />
      </div>
      {guide.curriculum && (
        <p className="m-0 text-[14px] leading-[1.6] text-ink-soft">
          <b className="text-night">교육과정</b> · {guide.curriculum}
        </p>
      )}
      <div className="flex flex-col gap-3">
        <h3 className="m-0 text-[15px] font-black text-night">이렇게 진행해요</h3>
        <ol className="m-0 flex list-none flex-col gap-[10px] p-0">
          {guide.steps.map((s, i) => (
            <li key={i} className="flex gap-3 text-[16px] leading-[1.6] text-night">
              <span aria-hidden className="mt-[2px] flex h-6 w-6 flex-none items-center justify-center rounded-[4px] bg-night font-pixel text-[13px] font-bold text-mint">
                {i + 1}
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>
      {guide.tips.length > 0 && (
        <div className="flex flex-col gap-2 rounded-[10px] bg-mint-soft px-4 py-3">
          <h3 className="m-0 text-[14px] font-black text-night">수업 팁</h3>
          <ul className="m-0 flex flex-col gap-1 pl-5 text-[15px] leading-[1.6] text-night">
            {guide.tips.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
}

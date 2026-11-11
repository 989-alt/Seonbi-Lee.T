import type { LauncherApp } from "@/lib/launcher/catalog";
import type { StatsResponse } from "@/lib/stats/track";
import { appCounts, formatCount } from "@/lib/launcher/stats";

export function AppStage({ app, stats }: { app: LauncherApp; stats: StatsResponse }) {
  const c = appCounts(app, stats);
  const partner = app.action.kind === "partner";
  return (
    <>
      <section aria-labelledby="bg-title" className="relative flex min-h-[460px] items-end overflow-hidden bg-night">
        {app.hero && (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={app.slug} src={app.hero} alt={`${app.name} 일러스트`} className="bg-fade absolute inset-0 h-full w-full object-cover" />
        )}
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,14,34,0.92)_0%,rgba(18,14,34,0.6)_42%,rgba(18,14,34,0)_75%)]" />
        <div key={`t-${app.slug}`} className="bg-fade relative flex max-w-[560px] flex-col gap-3 px-6 pt-10 pb-11 text-white sm:px-10">
          <span className="font-pixel text-[13px] tracking-[0.08em] text-mint">
            STAGE {app.stage}{app.tag ? ` · ${app.tag}` : ""}
          </span>
          <h1 id="bg-title" className="m-0 font-pixel text-[32px] leading-[1.25] font-bold sm:text-[40px]">{app.name}</h1>
          <p className="m-0 text-[17px] leading-[1.65] text-[#e4e0f2]">{app.desc}</p>
          <div className="mt-2 flex flex-wrap items-center gap-[14px]">
            {app.action.kind === "play" ? (
              <>
                <a href={app.action.href} target="_blank" rel="noopener" className="rounded-[8px] bg-mint px-8 py-4 font-pixel text-xl font-bold text-night hover:brightness-105">
                  ▶ PLAY
                </a>
                <span className="text-[13px] text-lilac">새 탭에서 바로 열려요</span>
              </>
            ) : (
              <>
                <a href={app.action.href} target="_blank" rel="noopener" className="rounded-[8px] bg-mint px-6 py-4 font-pixel text-base font-bold text-night hover:brightness-105 sm:text-lg">
                  🍦 아이스크림 AI마트에서 이용하기
                </a>
                <span className="text-[13px] text-lilac">{app.action.note}</span>
              </>
            )}
          </div>
        </div>
      </section>
      <div className="flex flex-wrap items-center gap-x-9 gap-y-3 border-b border-paper-line bg-white px-6 py-4 sm:px-10">
        {partner ? (
          <Stat label="이용 방법" value="아이스크림 AI마트 제공" />
        ) : (
          <>
            <Stat label="누적 플레이어" value={c ? `${formatCount(c.total, true)}명` : formatCount(0, false)} pixel />
            <Stat label="오늘 플레이" value={c ? `${formatCount(c.today, true)}명` : formatCount(0, false)} pixel />
          </>
        )}
        {app.grade && <Stat label="대상" value={app.grade} />}
      </div>
    </>
  );
}

function Stat({ label, value, pixel }: { label: string; value: string; pixel?: boolean }) {
  return (
    <div className="flex flex-col gap-[2px]">
      <span className="text-xs text-ink-soft">{label}</span>
      <b className={pixel ? "font-pixel text-[22px] text-night" : "text-base text-night"}>{value}</b>
    </div>
  );
}

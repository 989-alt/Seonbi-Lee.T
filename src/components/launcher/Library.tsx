"use client";

import { useState } from "react";
import type { LauncherApp, LibraryGroup } from "@/lib/launcher/catalog";
import type { StatsResponse } from "@/lib/stats/track";
import { appCounts, formatCount } from "@/lib/launcher/stats";

type Props = {
  groups: LibraryGroup[];
  q: string;
  onQ: (q: string) => void;
  selected: string | null;
  onPick: (slug: string) => void;
  stats: StatsResponse;
};

function AppRow({ app, sel, onPick, stats }: { app: LauncherApp; sel: boolean; onPick: (s: string) => void; stats: StatsResponse }) {
  const c = appCounts(app, stats);
  const sub = app.action.kind === "partner" ? "아이스크림 AI마트" : c ? `${formatCount(c.total, true)}명 플레이` : "집계 준비 중";
  const cls = `flex w-full items-center gap-3 rounded-[8px] p-2 text-left text-night transition-colors hover:bg-paper ${sel ? "bg-mint-soft" : ""}`;
  const inner = (
    <>
      {app.thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={app.thumb} alt="" className="h-[35px] w-[52px] flex-none rounded-[4px] object-cover" />
      ) : (
        <span aria-hidden className="h-[35px] w-[52px] flex-none rounded-[4px] bg-night" />
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className={`truncate text-sm ${sel ? "font-black" : "font-medium"}`}>{app.name}</span>
        <span className="font-pixel text-[11px] text-ink-soft">{sub}</span>
      </span>
    </>
  );
  if (app.action.kind === "partner") {
    return (
      <a href={app.action.href} target="_blank" rel="noopener" onClick={() => onPick(app.slug)} className={cls} aria-label={`${app.name} — 아이스크림 AI마트로 이동(새 탭)`}>
        {inner}
        <span aria-hidden className="flex-none text-xs text-ink-soft">↗</span>
      </a>
    );
  }
  return (
    <button type="button" onClick={() => onPick(app.slug)} aria-pressed={sel} className={cls}>
      {inner}
    </button>
  );
}

export function Library({ groups, q, onQ, selected, onPick, stats }: Props) {
  const [openRest, setOpenRest] = useState<Record<number, boolean>>({});
  const searching = q.trim().length > 0;
  return (
    <div className="flex flex-1 flex-col gap-1 px-[10px] pb-4">
      <div className="px-[6px] pt-4 pb-2">
        <label htmlFor="bg-q" className="mb-[6px] block text-xs font-bold text-ink-soft">앱 찾기</label>
        <input
          id="bg-q"
          type="search"
          value={q}
          onChange={(e) => onQ(e.target.value)}
          placeholder="이름·과목·학년으로 검색"
          className="h-[42px] w-full rounded-[8px] border-2 border-paper-line bg-[#f8f7fc] px-3 text-sm text-night outline-none focus:border-violet"
        />
      </div>
      {groups.length === 0 && (
        <p className="px-2 py-4 text-sm text-ink-soft">찾는 앱이 없어요. 다른 낱말로 검색해 보세요.</p>
      )}
      {groups.map((g) => {
        const showRest = searching || openRest[g.stage];
        return (
          <section key={g.stage} aria-label={`STAGE ${g.stage} ${g.title}`} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between px-2 pt-[14px] pb-[6px]">
              <h2 className="font-pixel text-sm font-bold text-night">STAGE {g.stage} {g.title}</h2>
            </div>
            {g.featured.map((a) => (
              <AppRow key={a.slug} app={a} sel={a.slug === selected} onPick={onPick} stats={stats} />
            ))}
            {Array.from({ length: g.emptySlots }, (_, i) => (
              <div key={i} className="hidden items-center gap-3 rounded-[8px] border-2 min-[900px]:flex border-dashed border-paper-line p-2 text-[13px] text-ink-soft">
                <span aria-hidden className="h-[31px] w-[48px] rounded-[4px] bg-paper" />
                빈 슬롯 · 새 앱 준비 중
              </div>
            ))}
            {g.rest.length > 0 && !searching && (
              <button
                type="button"
                onClick={() => setOpenRest((o) => ({ ...o, [g.stage]: !o[g.stage] }))}
                aria-expanded={!!openRest[g.stage]}
                className="mt-1 rounded-[8px] px-2 py-2 text-left text-[13px] font-bold text-violet hover:bg-paper"
              >
                {openRest[g.stage] ? "▴ 접기" : `▾ 전체 라이브러리 ${g.rest.length}개 더 보기`}
              </button>
            )}
            {showRest && g.rest.map((a) => (
              <AppRow key={a.slug} app={a} sel={a.slug === selected} onPick={onPick} stats={stats} />
            ))}
          </section>
        );
      })}
    </div>
  );
}

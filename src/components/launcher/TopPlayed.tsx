import type { LauncherApp } from "@/lib/launcher/catalog";
import { formatCount } from "@/lib/launcher/stats";

export function TopPlayed({ rows, onPick }: { rows: { app: LauncherApp; total: number }[]; onPick: (s: string) => void }) {
  if (rows.length === 0) return null;
  const max = rows[0].total;
  return (
    <section aria-labelledby="bg-rank" className="flex min-w-0 flex-col gap-[10px] rounded-[12px] border border-paper-line bg-white px-[22px] py-5">
      <h2 id="bg-rank" className="m-0 mb-1 font-pixel text-lg font-bold text-night">많이 플레이한 앱</h2>
      {rows.map((r, i) => (
        <button key={r.app.slug} type="button" onClick={() => onPick(r.app.slug)} className="flex w-full items-center gap-3 py-[6px] text-left text-night">
          <span className="w-[34px] flex-none font-pixel text-[15px] font-bold text-violet">{i + 1}위</span>
          <span className="min-w-0 flex-1 truncate text-[15px] font-bold">{r.app.name}</span>
          <span aria-hidden className="h-[10px] w-[120px] flex-none overflow-hidden rounded-[2px] bg-[#eeeaf6]">
            <span className="block h-full bg-violet" style={{ width: `${Math.max(4, (r.total / max) * 100)}%` }} />
          </span>
          <span className="w-16 flex-none text-right font-pixel text-[13px]">{formatCount(r.total, true)}명</span>
        </button>
      ))}
    </section>
  );
}

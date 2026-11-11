import type { StatsResponse } from "@/lib/stats/track";
import { formatCount } from "@/lib/launcher/stats";

export function ServerStatus({ stats }: { stats: StatsResponse }) {
  return (
    <div className="mx-3 mb-3 flex flex-col gap-2 rounded-[10px] bg-night px-4 py-[14px] font-pixel text-[#edeaf7]">
      <span className="flex items-center gap-2 text-xs text-mint">
        <span aria-hidden className="h-2 w-2 bg-mint" />서버 현황 · ONLINE
      </span>
      <div className="flex justify-between text-[13px]">
        <span className="text-lilac">오늘 접속한 선생님</span>
        <b className="text-base">{stats.ok ? `${formatCount(stats.portal.today, true)}명` : formatCount(0, false)}</b>
      </div>
      <div className="flex justify-between text-[13px]">
        <span className="text-lilac">누적 방문</span>
        <b className="text-base">{stats.ok ? `${formatCount(stats.portal.total, true)}명` : formatCount(0, false)}</b>
      </div>
    </div>
  );
}

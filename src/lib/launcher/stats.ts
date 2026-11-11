import type { StatsResponse } from "@/lib/stats/track";
import type { LauncherApp } from "./catalog";

export const NOT_READY = "집계 준비 중";

export function formatCount(n: number | undefined, ok: boolean): string {
  if (!ok) return NOT_READY;
  return (n ?? 0).toLocaleString("ko-KR");
}

export function appCounts(app: LauncherApp, stats: StatsResponse): { today: number; total: number } | null {
  if (!stats.ok || !app.trackSlug) return null;
  return stats.apps[app.trackSlug] ?? null;
}

export function topPlayed(apps: LauncherApp[], stats: StatsResponse, n = 5): { app: LauncherApp; total: number }[] {
  if (!stats.ok) return [];
  return apps
    .filter((a) => a.trackSlug)
    .map((app) => ({ app, total: stats.apps[app.trackSlug!]?.total ?? 0 }))
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, n);
}

import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { PORTAL_SLUG, type StatsResponse } from "./track";

const TTL_MS = 60_000;
let statsCache: { at: number; value: StatsResponse } | null = null;
let slugCache: { at: number; slugs: Set<string>; origins: Set<string> } | null = null;

/** app_stats() 집계, 60초 메모리 캐시. 실패해도 throw하지 않고 { ok:false } */
export async function getStats(): Promise<StatsResponse> {
  if (statsCache && Date.now() - statsCache.at < TTL_MS) return statsCache.value;
  let value: StatsResponse = { ok: false };
  try {
    const { data, error } = await createSupabaseAdminClient().rpc("app_stats");
    if (!error && Array.isArray(data)) {
      const apps: Record<string, { today: number; total: number }> = {};
      for (const r of data as { slug: string; today: number; total: number }[]) {
        apps[r.slug] = { today: Number(r.today), total: Number(r.total) };
      }
      value = { ok: true, portal: apps[PORTAL_SLUG] ?? { today: 0, total: 0 }, apps };
    } else if (error) {
      console.error("[stats] app_stats error:", error.message);
    }
  } catch (e) {
    console.error("[stats] app_stats failed:", e);
  }
  statsCache = { at: Date.now(), value };
  return value;
}

/** 추적 허용 slug(포털 + 공개된 track_slug)와 CORS 허용 origin */
export async function getTrackables(): Promise<{ slugs: Set<string>; origins: Set<string> }> {
  if (slugCache && Date.now() - slugCache.at < TTL_MS) return slugCache;
  const slugs = new Set<string>([PORTAL_SLUG]);
  const origins = new Set<string>(["https://s-edu.ai.kr", "https://www.s-edu.ai.kr"]);
  try {
    const { data } = await createSupabaseAdminClient()
      .from("projects")
      .select("track_slug, external_url")
      .eq("status", "published")
      .is("partner", null);
    for (const r of (data ?? []) as { track_slug: string | null; external_url: string | null }[]) {
      if (r.track_slug) slugs.add(r.track_slug);
      if (r.external_url) {
        try { origins.add(new URL(r.external_url).origin); } catch { /* ignore bad url */ }
      }
    }
  } catch (e) {
    console.error("[stats] trackables failed:", e);
  }
  slugCache = { at: Date.now(), slugs, origins };
  return slugCache;
}

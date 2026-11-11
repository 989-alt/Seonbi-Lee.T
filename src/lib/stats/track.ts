import { checkRateLimit } from "@/lib/rateLimit";
import { z } from "zod";

const TrackSchema = z.object({
  app: z.string().regex(/^[a-z0-9-]{2,40}$/),
  vid: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i),
});

export type TrackPayload = { app: string; vid: string };

export function parseTrack(body: unknown): TrackPayload | null {
  const r = TrackSchema.safeParse(body);
  return r.success ? { app: r.data.app, vid: r.data.vid.toLowerCase() } : null;
}

/** Asia/Seoul 기준 날짜 YYYY-MM-DD */
export function seoulDay(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

export const PORTAL_SLUG = "portal";

export type StatsResponse =
  | { ok: true; portal: { today: number; total: number }; apps: Record<string, { today: number; total: number }> }
  | { ok: false };

export const MAX_TRACK_BODY = 1024;

export type TrackGateInput = {
  origin: string | null;
  ip: string;
  bodyLength: number;
  body: unknown;
  slugs: Set<string>;
  origins: Set<string>;
};

/** /api/track 요청 판정: 출처·크기·형식·IP별 빈도·등록 여부 */
export function trackGate(i: TrackGateInput): { status: 204; payload: TrackPayload } | { status: 400 | 403 | 429 } {
  if (i.origin && !i.origins.has(i.origin)) return { status: 403 };
  if (i.bodyLength > MAX_TRACK_BODY) return { status: 400 };
  const payload = parseTrack(i.body);
  if (!payload) return { status: 400 };
  if (!checkRateLimit(`track-ip:${i.ip}`, { max: 30, windowMs: 60_000 }).ok) return { status: 429 };
  if (!i.slugs.has(payload.app)) return { status: 400 };
  return { status: 204, payload };
}

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

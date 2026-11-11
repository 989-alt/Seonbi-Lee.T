import { ISCREAM_URL } from "./catalog";

export type LauncherFields = {
  featured: boolean;
  featured_order: number | null;
  tag: string | null;
  grade: string | null;
  partner: "i-scream" | null;
  partner_url: string | null;
  track_slug: string | null;
};

type Result = { ok: true; value: LauncherFields; clearExternalUrl?: true } | { ok: false; error: string };

const text = (v: unknown, max: number) => {
  const s = typeof v === "string" ? v.trim().slice(0, max) : "";
  return s ? s : null;
};

/** 관리자 폼의 런처 필드 해석 (FormData entries 객체) */
export function parseLauncherFields(f: Record<string, unknown>): Result {
  const orderRaw = text(f.featured_order, 4);
  let featured_order: number | null = null;
  if (orderRaw) {
    const n = Number(orderRaw);
    if (!Number.isInteger(n) || n < 1 || n > 99) return { ok: false, error: "대표 순서는 1~99 사이 정수예요." };
    featured_order = n;
  }
  const partner = f.partner === "i-scream" ? "i-scream" : null;
  const track = text(f.track_slug, 40);
  if (track && !/^[a-z0-9-]{2,40}$/.test(track)) return { ok: false, error: "집계 키는 영문 소문자·숫자·하이픈만 써요." };
  const value: LauncherFields = {
    featured: f.featured === "on" || f.featured === "true",
    featured_order,
    tag: text(f.tag, 40),
    grade: text(f.grade, 40),
    partner,
    partner_url: partner ? ISCREAM_URL : null,
    track_slug: partner ? null : track,
  };
  return partner ? { ok: true, value, clearExternalUrl: true } : { ok: true, value };
}

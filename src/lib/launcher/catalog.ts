import type { ProjectCategory, ProjectRow } from "@/lib/repositories/types";
import { parseGuide, type TeacherGuide } from "./guide";

export type Stage = 1 | 2 | 3;

export const ISCREAM_URL = "https://issamgpt.com/ai-mart?type=ALL";
export const ISCREAM_NOTE = "아이스크림에 납품한 작품이에요";
export const STAGE_TITLES: Record<Stage, string> = { 1: "게임 · 수업자료", 2: "학급운영", 3: "학교행정" };
export const SLOT_MAX: Record<Stage, number> = { 1: 8, 2: 3, 3: 3 };

/**
 * 놀이터 안(/play/[slug])에서 띄우지 않고 새 탭으로 여는 앱.
 * evaluationapp: 나이스 입력 확장이 앱 주소의 브라우저 저장소를 읽어야 해서 다른 사이트 안에서는 동작하지 않는다.
 */
export const OPEN_IN_NEW_TAB = new Set(["evaluationapp"]);

/** 놀이터 실행 화면이 띄울 수 있는 앱 주소(CSP frame-src와 같은 목록) */
export const EMBED_HOSTS = ["https://989-alt.github.io", "https://*.vercel.app", "https://*.workers.dev"];

export function canEmbed(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== "https:") return false;
    return hostname === "989-alt.github.io" || hostname.endsWith(".vercel.app") || hostname.endsWith(".workers.dev");
  } catch {
    return false;
  }
}

export type LauncherAction =
  | { kind: "play"; href: string; embed: boolean }
  | { kind: "partner"; href: string; note: string };

export type LauncherApp = {
  slug: string;
  name: string;
  desc: string;
  tag: string | null;
  grade: string | null;
  stage: Stage;
  featured: boolean;
  order: number;
  thumb: string | null;
  hero: string | null;
  action: LauncherAction;
  trackSlug: string | null;
  guide: TeacherGuide | null;
};

export type LibraryGroup = {
  stage: Stage;
  title: string;
  featured: LauncherApp[];
  emptySlots: number;
  rest: LauncherApp[];
};

export function stageOf(c: ProjectCategory): Stage | null {
  if (c === "edutech") return 1;
  if (c === "class") return 2;
  if (c === "admin") return 3;
  return null;
}

export function toLauncherApp(row: ProjectRow, thumbUrl: (p: string | null) => string | null): LauncherApp | null {
  const stage = stageOf(row.category);
  if (!stage || row.status !== "published") return null;
  let action: LauncherAction;
  if (row.partner === "i-scream") {
    action = { kind: "partner", href: ISCREAM_URL, note: ISCREAM_NOTE };
  } else if (row.external_url) {
    action = { kind: "play", href: row.external_url, embed: canEmbed(row.external_url) && !OPEN_IN_NEW_TAB.has(row.slug) };
  } else {
    return null;
  }
  return {
    slug: row.slug,
    name: row.title_ko,
    desc: row.description,
    tag: row.tag,
    grade: row.grade,
    stage,
    featured: row.featured,
    order: row.featured_order ?? Number.MAX_SAFE_INTEGER,
    thumb: thumbUrl(row.thumbnail_path),
    hero: thumbUrl(row.hero_image_path ?? row.thumbnail_path),
    action,
    trackSlug: row.partner ? null : row.track_slug,
    guide: parseGuide(row.guide),
  };
}

const norm = (s: string) => s.replace(/\s+/g, "").toLowerCase();

export function matches(app: LauncherApp, q: string): boolean {
  const n = norm(q);
  if (!n) return true;
  return norm(`${app.name}${app.tag ?? ""}${app.grade ?? ""}`).includes(n);
}

export function groupForLibrary(apps: LauncherApp[], q: string): LibraryGroup[] {
  const searching = norm(q).length > 0;
  const groups: LibraryGroup[] = [];
  for (const stage of [1, 2, 3] as Stage[]) {
    const all = apps.filter((a) => a.stage === stage);
    const featuredAll = all.filter((a) => a.featured).sort((a, b) => a.order - b.order);
    const featuredIn = featuredAll.slice(0, SLOT_MAX[stage]);
    const rest = all
      .filter((a) => !featuredIn.includes(a))
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "ko"));
    const f = featuredIn.filter((a) => matches(a, q));
    const r = rest.filter((a) => matches(a, q));
    const emptySlots = searching ? 0 : SLOT_MAX[stage] - featuredIn.length;
    if (f.length + r.length + emptySlots === 0) continue;
    groups.push({ stage, title: STAGE_TITLES[stage], featured: f, emptySlots, rest: r });
  }
  return groups;
}

export function pickSelected(apps: LauncherApp[], slug: string | null): LauncherApp | null {
  if (apps.length === 0) return null;
  const hit = slug ? apps.find((a) => a.slug === slug) : undefined;
  if (hit) return hit;
  const firstFeatured = apps
    .filter((a) => a.stage === 1 && a.featured)
    .sort((a, b) => a.order - b.order)[0];
  return firstFeatured ?? apps[0];
}

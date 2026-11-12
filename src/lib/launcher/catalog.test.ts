import { describe, expect, it } from "vitest";
import type { ProjectRow } from "@/lib/repositories/types";
import { canEmbed, isStudentApp, isStudentPartnerGame, groupForLibrary, pickSelected, toLauncherApp, ISCREAM_URL, type LauncherApp } from "./catalog";

const thumb = (p: string | null) => (p ? `https://cdn.test/${p}` : null);

function row(over: Partial<ProjectRow> = {}): ProjectRow {
  return {
    id: "id-" + (over.slug ?? "x"), slug: "x", title_ko: "앱", title_en: null, description: "설명",
    category: "edutech", accent: "primary", version: null, tech_stack: [], thumbnail_path: null,
    external_url: "https://secret-original.example.com/app", status: "published", published_at: null,
    created_at: "2026-01-01", updated_at: "2026-01-01",
    featured: false, featured_order: null, tag: null, grade: null, hero_image_path: null,
    partner: null, partner_url: null, track_slug: null, guide: null, ...over,
  };
}
const app = (over: Partial<ProjectRow>) => toLauncherApp(row(over), thumb) as LauncherApp;

describe("toLauncherApp", () => {
  it("partner app links only to i-scream and never leaks the original url", () => {
    const a = app({ partner: "i-scream", partner_url: ISCREAM_URL });
    expect(a.action).toEqual({ kind: "partner", href: "https://issamgpt.com/ai-mart?type=ALL", note: "아이스크림에 납품한 작품이에요" });
    expect(JSON.stringify(a)).not.toContain("secret-original");
  });
  it("normal app plays its external url", () => {
    expect(app({}).action).toEqual({ kind: "play", href: "https://secret-original.example.com/app", embed: false });
  });
  it("uses only an explicit track_slug (blank = not tracked)", () => {
    expect(app({ slug: "s", track_slug: null }).trackSlug).toBeNull();
    expect(app({ slug: "s", track_slug: "s" }).trackSlug).toBe("s");
  });
  it("carries a parsed teacher guide and drops a broken one", () => {
    expect(app({ guide: { genre: "퍼즐", steps: ["열어요"] } }).guide?.steps).toEqual(["열어요"]);
    expect(app({ guide: { nope: 1 } }).guide).toBeNull();
  });
  it("drops etc category and unpublished rows", () => {
    expect(toLauncherApp(row({ category: "etc" }), thumb)).toBeNull();
    expect(toLauncherApp(row({ status: "draft" }), thumb)).toBeNull();
  });
});

describe("groupForLibrary", () => {
  const stage1 = Array.from({ length: 10 }, (_, i) =>
    app({ slug: `g${i}`, title_ko: `게임${i}`, featured: true, featured_order: 10 - i }));
  const class1 = app({ slug: "seat", title_ko: "자리바꾸기", category: "class", featured: true, featured_order: 1 });
  const mathy = app({ slug: "m", title_ko: "원의 넓이", tag: "게임 · 수학" });

  it("caps featured at slot max in featured_order and spills the rest", () => {
    const g = groupForLibrary([...stage1, class1], "");
    const s1 = g.find((x) => x.stage === 1)!;
    expect(s1.featured).toHaveLength(8);
    expect(s1.featured[0].slug).toBe("g9");
    expect(s1.rest.map((a) => a.slug).sort()).toEqual(["g0", "g1"]);
    expect(g.find((x) => x.stage === 2)!.emptySlots).toBe(2);
  });
  it("filters by name or tag while searching and shows no empty slots", () => {
    const g = groupForLibrary([...stage1, class1, mathy], "수학");
    expect(g.flatMap((x) => [...x.featured, ...x.rest]).map((a) => a.slug)).toEqual(["m"]);
    expect(g.every((x) => x.emptySlots === 0)).toBe(true);
  });
  it("returns nothing when no app matches", () => {
    expect(groupForLibrary([...stage1], "zzzz")).toEqual([]);
  });
});

describe("pickSelected", () => {
  const a = app({ slug: "first", featured: true, featured_order: 1 });
  const b = app({ slug: "b" });
  it("falls back to the first featured stage-1 app for an unknown slug", () => {
    expect(pickSelected([b, a], "nope")?.slug).toBe("first");
    expect(pickSelected([b, a], "b")?.slug).toBe("b");
  });
  it("returns null for an empty catalog", () => {
    expect(pickSelected([], null)).toBeNull();
  });
});

describe("canEmbed", () => {
  it("수록 앱 호스트만 허용", () => {
    expect(canEmbed("https://989-alt.github.io/circle/")).toBe(true);
    expect(canEmbed("https://cosmic-edu.vercel.app")).toBe(true);
    expect(canEmbed("https://math-baseball.sunhak989.workers.dev")).toBe(true);
    expect(canEmbed("http://cosmic-edu.vercel.app")).toBe(false);
    expect(canEmbed("https://evil.example.com")).toBe(false);
    expect(canEmbed("https://other.github.io/x")).toBe(false);
    expect(canEmbed("not a url")).toBe(false);
  });
});

describe("isStudentApp", () => {
  const base = { name: "x", desc: "", tag: null, grade: null, stage: 1 as const, featured: false, order: 0, thumb: null, hero: null, trackSlug: null, guide: null };
  it("목록에 있고 놀이터 안에서 열리는 앱만 학생용", () => {
    expect(isStudentApp({ ...base, slug: "circle", action: { kind: "play", href: "https://989-alt.github.io/circle/", embed: true } })).toBe(true);
    expect(isStudentApp({ ...base, slug: "seat-changer", action: { kind: "play", href: "https://seat-changer-two.vercel.app", embed: true } })).toBe(false);
    expect(isStudentApp({ ...base, slug: "circle", action: { kind: "partner", href: "x", note: "n" } })).toBe(false);
  });
});

describe("아이스크림 앱", () => {
  it("partner_url이 https면 그 주소, 아니면 기본 AI마트 주소", () => {
    expect(app({ partner: "i-scream", partner_url: "https://issamgpt.com/ai-mart/item/1", external_url: null }).action).toEqual({ kind: "partner", href: "https://issamgpt.com/ai-mart/item/1", note: expect.any(String) });
    expect(app({ partner: "i-scream", partner_url: "javascript:alert(1)", external_url: null }).action).toMatchObject({ kind: "partner", href: ISCREAM_URL });
  });
  it("학생 화면용 아이스크림 게임은 게임·수업자료 칸만", () => {
    expect(isStudentPartnerGame(app({ partner: "i-scream", external_url: null }))).toBe(true);
    expect(isStudentPartnerGame(app({ partner: "i-scream", external_url: null, category: "class" }))).toBe(false);
  });
});

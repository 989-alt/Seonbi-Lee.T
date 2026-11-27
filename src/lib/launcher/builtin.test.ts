import { describe, expect, it } from "vitest";
import type { ProjectRow } from "@/lib/repositories/types";
import { assetUrl } from "./assets";
import { BUILTIN_ROWS, withBuiltin } from "./builtin";
import { groupForLibrary, isStudentApp, isStudentPartnerGame, toLauncherApp, type LauncherApp } from "./catalog";

const thumb = (p: string | null) => assetUrl(p, undefined);
const toApps = (rows: ProjectRow[]) => rows.map((r) => toLauncherApp(r, thumb)).filter((a): a is LauncherApp => a !== null);
const SLUG = BUILTIN_ROWS[0].slug;

function dbRow(over: Partial<ProjectRow>): ProjectRow {
  return { ...BUILTIN_ROWS[0], id: "db-1", title_ko: "DB 쪽 제목", external_url: "https://example.vercel.app", ...over };
}

describe("내장 행: 교실 보드", () => {
  it("학급운영 칸의 추천 슬롯에 들어간다", () => {
    const apps = toApps(withBuiltin([]));
    const g = groupForLibrary(apps, "").find((x) => x.stage === 2)!;
    expect(g.featured.map((a) => a.name)).toEqual(["교실 보드"]);
    expect(g.emptySlots).toBe(2);
  });
  it("누르면 놀이터 화면이 아니라 /board 로 가는 사이트 내부 링크다", () => {
    const app = toApps(withBuiltin([]))[0];
    expect(app.action).toEqual({ kind: "internal", href: "/board" });
    expect(app.thumb).toBe("/board/board.webp");
    expect(app.trackSlug).toBeNull();
  });
  it("학생용 화면에는 나오지 않는다", () => {
    const app = toApps(withBuiltin([]))[0];
    expect(isStudentApp(app)).toBe(false);
    expect(isStudentPartnerGame(app)).toBe(false);
  });
  it("자리바꾸기(순서 1) 다음에 놓인다", () => {
    const seat = dbRow({ slug: "seat-changer", title_ko: "자리바꾸기", featured_order: 1, id: "s" });
    const g = groupForLibrary(toApps(withBuiltin([seat])), "").find((x) => x.stage === 2)!;
    expect(g.featured.map((a) => a.name)).toEqual(["자리바꾸기", "교실 보드"]);
  });
  it("같은 slug가 DB에 있으면 DB가 이긴다", () => {
    const rows = withBuiltin([dbRow({ slug: SLUG })]);
    expect(rows).toHaveLength(1);
    expect(rows[0].title_ko).toBe("DB 쪽 제목");
  });
  it("DB 행이 없어도(읽기 실패) 내장 행은 남는다", () => {
    expect(withBuiltin([]).map((r) => r.slug)).toEqual([SLUG]);
  });
});

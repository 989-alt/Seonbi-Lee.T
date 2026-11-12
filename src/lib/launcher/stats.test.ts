import { describe, expect, it } from "vitest";
import { formatCount, topPlayed } from "./stats";
import type { LauncherApp } from "./catalog";

const mk = (slug: string, partner = false): LauncherApp => ({
  slug, name: slug, desc: "", tag: null, grade: null, stage: 1, featured: false, order: 0,
  thumb: null, hero: null,
  action: partner ? { kind: "partner", href: "x", note: "n" } : { kind: "play", href: "x", embed: false },
  trackSlug: partner ? null : slug, guide: null,
});

describe("formatCount", () => {
  it("says 집계 준비 중 when stats are unavailable", () => {
    expect(formatCount(undefined, false)).toBe("집계 준비 중");
    expect(formatCount(5, false)).toBe("집계 준비 중");
  });
  it("formats numbers with thousands separators, including zero", () => {
    expect(formatCount(1234, true)).toBe("1,234");
    expect(formatCount(0, true)).toBe("0");
    expect(formatCount(undefined, true)).toBe("0");
  });
});

describe("topPlayed", () => {
  const apps = ["a", "b", "c", "d", "e", "f", "z"].map((s) => mk(s)).concat(mk("p", true));
  const stats = { ok: true as const, portal: { today: 1, total: 9 }, apps: {
    a: { today: 0, total: 5 }, b: { today: 0, total: 50 }, c: { today: 0, total: 7 }, d: { today: 0, total: 1 },
    e: { today: 0, total: 3 }, f: { today: 0, total: 2 }, z: { today: 0, total: 0 }, p: { today: 0, total: 999 },
  } };
  it("ranks by total, skips zero and partner apps, max 5", () => {
    expect(topPlayed(apps, stats).map((r) => [r.app.slug, r.total])).toEqual([["b", 50], ["c", 7], ["a", 5], ["e", 3], ["f", 2]]);
  });
  it("is empty when stats failed", () => {
    expect(topPlayed(apps, { ok: false })).toEqual([]);
  });
});

import { appCounts } from "./stats";
describe("appCounts", () => {
  const ok = { ok: true as const, portal: { today: 0, total: 0 }, apps: { a: { today: 1, total: 2 } } };
  it("is null (집계 준비 중) when the app has no counter row yet", () => {
    expect(appCounts(mk("b"), ok)).toBeNull();
  });
  it("returns the row when present", () => {
    expect(appCounts(mk("a"), ok)).toEqual({ today: 1, total: 2 });
  });
});

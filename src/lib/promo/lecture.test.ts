import { describe, expect, it } from "vitest";
import { LECTURE, LECTURE_WORLDS, closePromo, isPromoClosed, promoKey } from "./lecture";

function mem(): Storage {
  const m = new Map<string, string>();
  return { get length() { return m.size; }, clear: () => m.clear(), getItem: (k) => m.get(k) ?? null, key: (i) => [...m.keys()][i] ?? null, removeItem: (k) => void m.delete(k), setItem: (k, v) => void m.set(k, String(v)) };
}
const broken = { getItem() { throw new Error("x"); }, setItem() { throw new Error("x"); } } as unknown as Storage;

describe("lecture promo", () => {
  it("links straight to the vivasam course page", () => {
    expect(LECTURE.href).toBe("https://t.vivasam.com/courses/job/t26-016");
    expect(LECTURE.lessons).toHaveLength(15);
    expect(LECTURE.meta).toBe("15차시 · 1학점");
  });
  it("groups all 15 lessons into worlds without gaps", () => {
    const covered = LECTURE_WORLDS.flatMap((w) => Array.from({ length: w.to - w.from + 1 }, (_, i) => w.from + i));
    expect(covered).toEqual(Array.from({ length: 15 }, (_, i) => i + 1));
  });
  it("stays closed once dismissed, per lecture", () => {
    const s = mem();
    expect(isPromoClosed(s)).toBe(false);
    closePromo(s);
    expect(isPromoClosed(s)).toBe(true);
    expect(promoKey()).toContain("t26-016");
  });
  it("shows the bar when storage is blocked", () => {
    expect(isPromoClosed(broken)).toBe(false);
    expect(() => closePromo(broken)).not.toThrow();
    expect(isPromoClosed(null)).toBe(false);
  });
});

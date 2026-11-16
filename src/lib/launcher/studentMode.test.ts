import { describe, expect, it } from "vitest";
import { STUDENT_KEY, clearStudentMode, readStudentMode, studentHref, writeStudentMode } from "./studentMode";

function mem(): Storage {
  const m = new Map<string, string>();
  return {
    get length() { return m.size; },
    clear: () => m.clear(),
    getItem: (k) => m.get(k) ?? null,
    key: (i) => [...m.keys()][i] ?? null,
    removeItem: (k) => void m.delete(k),
    setItem: (k, v) => void m.set(k, String(v)),
  };
}
const broken = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } } as unknown as Storage;

describe("student mode", () => {
  it("is off until a student page marks it", () => {
    const s = mem();
    expect(readStudentMode(s)).toBe(false);
    writeStudentMode(s);
    expect(s.getItem(STUDENT_KEY)).toBe("1");
    expect(readStudentMode(s)).toBe(true);
  });

  it("is cleared when the teacher launcher opens", () => {
    const s = mem();
    writeStudentMode(s);
    clearStudentMode(s);
    expect(readStudentMode(s)).toBe(false);
  });

  it("never throws when storage is blocked or missing", () => {
    expect(() => writeStudentMode(broken)).not.toThrow();
    expect(() => clearStudentMode(broken)).not.toThrow();
    expect(readStudentMode(broken)).toBe(false);
    expect(readStudentMode(null)).toBe(false);
  });
});

describe("studentHref", () => {
  it("sends students back to the student list and student privacy page", () => {
    expect(studentHref("back", "woorimal-rpg", true)).toBe("/students");
    expect(studentHref("privacy", "woorimal-rpg", true)).toBe("/students/privacy");
  });
  it("keeps teacher links for teachers", () => {
    expect(studentHref("back", "woorimal-rpg", false)).toBe("/?app=woorimal-rpg");
    expect(studentHref("privacy", "woorimal-rpg", false)).toBe("/privacy");
  });
});

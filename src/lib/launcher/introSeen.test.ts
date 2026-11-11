import { describe, expect, it } from "vitest";
import { readIntroSeen, writeIntroSeen, INTRO_KEY } from "./introSeen";

const memory = (): Storage => {
  const m = new Map<string, string>();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k),
    clear: () => m.clear(), key: () => null, get length() { return m.size; } } as Storage;
};
const broken = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } } as unknown as Storage;

describe("introSeen", () => {
  it("round-trips through storage under the versioned key", () => {
    const s = memory();
    expect(readIntroSeen(s)).toBe(false);
    writeIntroSeen(s);
    expect(readIntroSeen(s)).toBe(true);
    expect(s.getItem(INTRO_KEY)).toBe("1");
    expect(INTRO_KEY).toBe("bg_intro_seen_v1");
  });
  it("treats blocked or missing storage as not seen and never throws", () => {
    expect(readIntroSeen(broken)).toBe(false);
    expect(() => writeIntroSeen(broken)).not.toThrow();
    expect(readIntroSeen(null)).toBe(false);
    expect(() => writeIntroSeen(null)).not.toThrow();
  });
});

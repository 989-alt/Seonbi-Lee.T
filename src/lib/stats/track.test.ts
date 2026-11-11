import { describe, expect, it } from "vitest";
import { parseTrack, seoulDay } from "./track";
import { checkRateLimit } from "@/lib/rateLimit";

const VID = "3f2b8c1e-6a4d-4e2f-9b1a-7c5d3e8f0a12";

describe("parseTrack", () => {
  it("accepts a known-shaped slug and uuid v4", () => {
    expect(parseTrack({ app: "plane-puzzle", vid: VID })).toEqual({ app: "plane-puzzle", vid: VID });
  });
  it("rejects path-like slugs, bad uuids and missing fields", () => {
    expect(parseTrack({ app: "../x", vid: VID })).toBeNull();
    expect(parseTrack({ app: "plane-puzzle", vid: "abc" })).toBeNull();
    expect(parseTrack({ app: "plane-puzzle" })).toBeNull();
    expect(parseTrack("nonsense")).toBeNull();
  });
});

describe("seoulDay", () => {
  it("uses the Asia/Seoul calendar date", () => {
    expect(seoulDay(new Date("2026-11-10T15:30:00Z"))).toBe("2026-11-11");
    expect(seoulDay(new Date("2026-11-10T14:59:00Z"))).toBe("2026-11-10");
  });
});

describe("checkRateLimit", () => {
  it("honours custom limits per key", () => {
    const o = { max: 2, windowMs: 1000 };
    expect(checkRateLimit("t:a", o).ok).toBe(true);
    expect(checkRateLimit("t:a", o).ok).toBe(true);
    expect(checkRateLimit("t:a", o).ok).toBe(false);
  });
  it("keeps the old default of 3 per hour", () => {
    expect([1, 2, 3, 4].map(() => checkRateLimit("contact:ip").ok)).toEqual([true, true, true, false]);
  });
});

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

import { trackGate } from "./track";
import { pruneExpired } from "@/lib/rateLimit";
describe("trackGate", () => {
  const base = { origin: null as string | null, ip: "1.2.3.4", bodyLength: 80, body: { app: "portal", vid: VID },
    slugs: new Set(["portal"]), origins: new Set(["https://s-edu.ai.kr"]) };
  it("rejects foreign origins with 403", () => {
    expect(trackGate({ ...base, origin: "https://evil.example" })).toEqual({ status: 403 });
  });
  it("rejects oversized bodies and unregistered slugs with 400", () => {
    expect(trackGate({ ...base, bodyLength: 5000 }).status).toBe(400);
    expect(trackGate({ ...base, body: { app: "nope", vid: VID } }).status).toBe(400);
  });
  it("rate-limits per IP even when the vid changes every request", () => {
    const ip = "9.9.9.9";
    const results = Array.from({ length: 31 }, (_, i) =>
      trackGate({ ...base, ip, body: { app: "portal", vid: `3f2b8c1e-6a4d-4e2f-9b1a-${String(i).padStart(12, "0")}` } }).status);
    expect(results.slice(0, 30).every((s) => s === 204)).toBe(true);
    expect(results[30]).toBe(429);
  });
  it("accepts a valid same-site request and returns the payload", () => {
    expect(trackGate({ ...base, origin: "https://s-edu.ai.kr", ip: "5.5.5.5" })).toEqual({ status: 204, payload: { app: "portal", vid: VID } });
  });
});
describe("pruneExpired", () => {
  it("removes expired buckets", () => {
    checkRateLimit("old:key", { max: 5, windowMs: 1 });
    expect(pruneExpired(Date.now() + 10)).toBeGreaterThan(0);
  });
});

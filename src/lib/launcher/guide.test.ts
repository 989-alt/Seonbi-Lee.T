import { describe, expect, it } from "vitest";
import { parseGuide } from "./guide";

describe("parseGuide", () => {
  it("keeps a valid guide and trims text", () => {
    expect(parseGuide({ genre: " 퍼즐 ", players: "1인", steps: ["열어요", "풀어요"], tips: ["팁"] }))
      .toEqual({ genre: "퍼즐", players: "1인", time: null, device: null, curriculum: null, steps: ["열어요", "풀어요"], tips: ["팁"] });
  });
  it("returns null for missing, malformed or step-less guides", () => {
    expect(parseGuide(null)).toBeNull();
    expect(parseGuide("text")).toBeNull();
    expect(parseGuide({ genre: "퍼즐", steps: [] })).toBeNull();
    expect(parseGuide({ steps: ["a"] })).toBeNull();
  });
  it("caps steps at 8 and tips at 5", () => {
    const g = parseGuide({ genre: "g", steps: Array(12).fill("s"), tips: Array(9).fill("t") });
    expect(g?.steps).toHaveLength(8);
    expect(g?.tips).toHaveLength(5);
  });
});

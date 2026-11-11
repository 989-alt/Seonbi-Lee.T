import { describe, expect, it } from "vitest";
import { withTopic, TOPICS } from "./topic";

describe("withTopic", () => {
  it("prefixes the chosen topic label", () => {
    expect(withTopic("bug", "숫자야구가 안 열려요")).toBe("[버그 제보] 숫자야구가 안 열려요");
    expect(withTopic("idea", " 분수 게임 ")).toBe("[앱 제안] 분수 게임");
  });
  it("leaves the subject alone for unknown topics or already-prefixed subjects", () => {
    expect(withTopic("nope", "제목")).toBe("제목");
    expect(withTopic("idea", "[앱 제안] 제목")).toBe("[앱 제안] 제목");
  });
  it("offers three topics", () => {
    expect(TOPICS.map((t) => t.id)).toEqual(["idea", "bug", "collab"]);
  });
});

import { describe, expect, it } from "vitest";
import { safeAdminRedirect } from "./safeRedirect";

describe("safeAdminRedirect", () => {
  it("관리자 내부 경로는 그대로 둔다", () => {
    expect(safeAdminRedirect("/admin/posts")).toBe("/admin/posts");
  });
  it.each(["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", "/news", "", null, 3])(
    "외부·비관리자 경로 %s 는 /admin 으로 바꾼다",
    (v) => {
      expect(safeAdminRedirect(v)).toBe("/admin");
    },
  );
});

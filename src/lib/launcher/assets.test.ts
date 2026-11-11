import { describe, expect, it } from "vitest";
import { assetUrl } from "./assets";

describe("assetUrl", () => {
  it("serves site-local paths as-is", () => {
    expect(assetUrl("/launcher/apps/circle.webp", "https://x.supabase.co")).toBe("/launcher/apps/circle.webp");
  });
  it("builds Supabase public storage urls for storage keys", () => {
    expect(assetUrl("abc.webp", "https://x.supabase.co")).toBe("https://x.supabase.co/storage/v1/object/public/project-thumbs/abc.webp");
  });
  it("returns null without a path or base", () => {
    expect(assetUrl(null, "https://x.supabase.co")).toBeNull();
    expect(assetUrl("abc.webp", undefined)).toBeNull();
  });
});

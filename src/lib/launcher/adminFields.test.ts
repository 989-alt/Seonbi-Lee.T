import { describe, expect, it } from "vitest";
import { parseLauncherFields } from "./adminFields";
import { ISCREAM_URL } from "./catalog";

describe("parseLauncherFields", () => {
  it("maps checkbox, order and text fields", () => {
    expect(parseLauncherFields({ featured: "on", featured_order: "3", tag: " 게임 · 수학 ", grade: "", track_slug: "plane-puzzle", partner: "" }))
      .toEqual({ ok: true, value: { featured: true, featured_order: 3, tag: "게임 · 수학", grade: null, partner: null, partner_url: null, track_slug: "plane-puzzle" } });
  });
  it("defaults to not featured with no order", () => {
    const r = parseLauncherFields({});
    expect(r.ok && r.value.featured).toBe(false);
    expect(r.ok && r.value.featured_order).toBeNull();
  });
  it("partner apps get the i-scream link, no track slug, and clear external_url", () => {
    const r = parseLauncherFields({ partner: "i-scream", track_slug: "x-y" });
    expect(r).toEqual({ ok: true, value: expect.objectContaining({ partner: "i-scream", partner_url: ISCREAM_URL, track_slug: null }), clearExternalUrl: true });
  });
  it("rejects bad track slugs and orders", () => {
    expect(parseLauncherFields({ track_slug: "Bad Slug!" }).ok).toBe(false);
    expect(parseLauncherFields({ featured_order: "-1" }).ok).toBe(false);
  });
});

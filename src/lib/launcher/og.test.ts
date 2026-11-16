import { describe, expect, it } from "vitest";
import { appOgImagePath, appShareMeta, ogSourceUrl } from "./og";

const app = { slug: "math-baseball", name: "숫자야구", desc: "실시간 숫자 추리 대결" };

describe("ogSourceUrl", () => {
  it("turns a site path into an absolute url on this origin", () => {
    expect(ogSourceUrl("/launcher/apps/math-baseball-lg.webp", "https://s-edu.ai.kr")).toBe("https://s-edu.ai.kr/launcher/apps/math-baseball-lg.webp");
  });
  it("keeps an https storage url", () => {
    expect(ogSourceUrl("https://x.supabase.co/storage/v1/object/public/a.webp", "https://s-edu.ai.kr")).toBe("https://x.supabase.co/storage/v1/object/public/a.webp");
  });
  it("rejects missing, protocol-relative and non-https sources", () => {
    expect(ogSourceUrl(null, "https://s-edu.ai.kr")).toBeNull();
    expect(ogSourceUrl("//evil.example/a.png", "https://s-edu.ai.kr")).toBeNull();
    expect(ogSourceUrl("http://plain.example/a.png", "https://s-edu.ai.kr")).toBeNull();
    expect(ogSourceUrl("javascript:alert(1)", "https://s-edu.ai.kr")).toBeNull();
  });
});

describe("appShareMeta", () => {
  it("uses the app name, description and its own preview image", () => {
    const m = appShareMeta(app, "/play/math-baseball");
    expect(appOgImagePath("math-baseball")).toBe("/og/app/math-baseball");
    expect(m.title).toBe("숫자야구 // 방구석게이머 교실 놀이터");
    expect(m.description).toBe("실시간 숫자 추리 대결");
    expect(m.openGraph).toMatchObject({ title: "숫자야구 // 방구석게이머 교실 놀이터", url: "/play/math-baseball" });
    expect(m.openGraph?.images).toEqual([{ url: "/og/app/math-baseball", width: 1200, height: 630, alt: "숫자야구" }]);
    expect(m.twitter).toMatchObject({ card: "summary_large_image", images: ["/og/app/math-baseball"] });
  });
});

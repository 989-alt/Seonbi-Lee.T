import { describe, expect, it } from "vitest";
import { DORMS_FEED, parseDormsFeed } from "./feed";

const item = (o: Record<string, unknown> = {}) => ({
  id: "a1", kind: "app", title: "숫자야구", summary: "요약", image: "https://img.example/a.png",
  dorms: 3, comments: 1, createdAt: "2026-10-16T08:16:13Z", locked: false, url: "https://dorms.school/apps/a1", ...o,
});
const feed = (o: Record<string, unknown> = {}) => ({
  profile: { id: "p", handle: "h", name: "선비이선생", bio: "", avatar: null, totalDorms: 70, rank: 124,
    region: "경기", role: "초등학교", links: [], url: "https://dorms.school/u/p",
    library: { name: "서재", url: "https://dorms.school/channels/c" } },
  apps: [item()], posts: [], counts: { apps: 1, games: 0, posts: 0 }, ...o,
});

describe("DORMS_FEED", () => {
  it("is the exact library-site address with no query", () => {
    expect(DORMS_FEED).toBe("https://dorms.school/api/library-site/ReZLNB1Rs5fxP1suyjBAxQ0ew_Q9kmE5");
  });
});

describe("parseDormsFeed", () => {
  it("keeps profile, every app and every post", () => {
    const f = parseDormsFeed(feed({ apps: [item(), item({ id: "a2", kind: "game" })], posts: [item({ id: "s1", kind: "story" })] }));
    expect(f?.profile.name).toBe("선비이선생");
    expect(f?.profile.url).toBe("https://dorms.school/u/p");
    expect(f?.apps.map((a) => a.id)).toEqual(["a1", "a2"]);
    expect(f?.posts.map((p) => p.kind)).toEqual(["story"]);
  });

  it("keeps urls exactly as given", () => {
    const f = parseDormsFeed(feed());
    expect(f?.apps[0].url).toBe("https://dorms.school/apps/a1");
  });

  it("turns a null or non-https image into null so a default picture is shown", () => {
    const f = parseDormsFeed(feed({ apps: [item({ image: null }), item({ id: "a2", image: "javascript:alert(1)" })] }));
    expect(f?.apps.map((a) => a.image)).toEqual([null, null]);
    expect(f?.profile.avatar).toBeNull();
  });

  it("drops the summary of a locked item", () => {
    const f = parseDormsFeed(feed({ apps: [item({ locked: true, summary: "숨김" })] }));
    expect(f?.apps[0]).toMatchObject({ locked: true, summary: "" });
  });

  it("keeps an item whose url is not http(s) but gives it no link", () => {
    const f = parseDormsFeed(feed({ apps: [item({ url: "javascript:alert(1)" })] }));
    expect(f?.apps).toHaveLength(1);
    expect(f?.apps[0].url).toBeNull();
  });

  it("tolerates missing optional fields", () => {
    const f = parseDormsFeed(feed({ apps: [{ id: "x", title: "제목", url: "https://dorms.school/apps/x" }], posts: undefined }));
    expect(f?.apps[0]).toMatchObject({ title: "제목", summary: "", image: null, dorms: 0, comments: 0, locked: false });
    expect(f?.posts).toEqual([]);
  });

  it("returns null for a feed without a profile", () => {
    expect(parseDormsFeed({ apps: [] })).toBeNull();
    expect(parseDormsFeed("nope")).toBeNull();
  });
});

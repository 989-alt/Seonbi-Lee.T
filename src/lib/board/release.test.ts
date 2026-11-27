import { afterEach, describe, expect, it, vi } from "vitest";
import { BOARD_HOME, LATEST_JSON, formatSize, getLatestRelease, parseLatest } from "./release";

const latest = (o: Record<string, unknown> = {}) => ({
  version: "1.0.13",
  added: ["모서리 둥글기"],
  improved: ["휠 스크롤", "띠 가운데"],
  url: "https://989-alt.github.io/teacher-widget/teacher-widget-setup-1.0.13.exe",
  sha256: "ee3f",
  size: 34833410,
  ...o,
});

describe("addresses", () => {
  it("reads only GitHub Pages, never Releases", () => {
    expect(LATEST_JSON).toBe("https://989-alt.github.io/teacher-widget/latest.json");
    expect(BOARD_HOME).toBe("https://989-alt.github.io/teacher-widget/");
  });
});

describe("parseLatest", () => {
  it("keeps version, url, size and notes", () => {
    expect(parseLatest(latest())).toEqual({
      version: "1.0.13",
      url: "https://989-alt.github.io/teacher-widget/teacher-widget-setup-1.0.13.exe",
      size: 34833410,
      added: ["모서리 둥글기"],
      improved: ["휠 스크롤", "띠 가운데"],
    });
  });

  it("rejects an installer outside the Pages folder", () => {
    expect(parseLatest(latest({ url: "https://github.com/989-alt/teacher-widget/releases/download/v1/a.exe" }))).toBeNull();
    expect(parseLatest(latest({ url: "http://989-alt.github.io/teacher-widget/a.exe" }))).toBeNull();
    expect(parseLatest(latest({ url: "https://989-alt.github.io.evil.example/teacher-widget/a.exe" }))).toBeNull();
    expect(parseLatest(latest({ url: "https://989-alt.github.io/teacher-widget/../other/a.exe" }))).toBeNull();
    expect(parseLatest(latest({ url: "https://989-alt.github.io/teacher-widget/a.zip" }))).toBeNull();
  });

  it("rejects a missing or odd version", () => {
    expect(parseLatest(latest({ version: undefined }))).toBeNull();
    expect(parseLatest(latest({ version: "<b>1</b>" }))).toBeNull();
    expect(parseLatest("nope")).toBeNull();
    expect(parseLatest(null)).toBeNull();
  });

  it("tolerates missing size and notes", () => {
    expect(parseLatest(latest({ size: "big", added: undefined, improved: [1, "좋아짐"] }))).toMatchObject({
      size: null,
      added: [],
      improved: ["좋아짐"],
    });
  });
});

describe("formatSize", () => {
  it("shows megabytes", () => {
    expect(formatSize(34833410)).toBe("33.2MB");
    expect(formatSize(null)).toBe("");
  });
});

describe("getLatestRelease", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("reads latest.json once an hour", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(latest())));
    vi.stubGlobal("fetch", fetchMock);
    expect((await getLatestRelease())?.version).toBe("1.0.13");
    expect(fetchMock).toHaveBeenCalledWith(LATEST_JSON, { next: { revalidate: 3600 } });
  });

  it("returns null on a network error, a bad status or bad json", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    expect(await getLatestRelease()).toBeNull();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 404 })));
    expect(await getLatestRelease()).toBeNull();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{")));
    expect(await getLatestRelease()).toBeNull();
  });

  it("gives up when the server is slow", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    const p = getLatestRelease();
    await vi.advanceTimersByTimeAsync(5000);
    expect(await p).toBeNull();
    vi.useRealTimers();
  });
});

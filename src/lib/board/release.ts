/**
 * 교실 위젯(보드) 최신 설치 파일 정보.
 * 학교 인터넷이 GitHub Releases 파일 서버를 막아서, 설치한 프로그램과 같은 GitHub Pages 주소만 쓴다.
 * 서버에서 읽으므로 사이트 CSP(connect-src)와 상관없다.
 */
export const BOARD_HOME = "https://989-alt.github.io/teacher-widget/";
export const LATEST_JSON = `${BOARD_HOME}latest.json`;

export type BoardRelease = {
  version: string;
  url: string;
  size: number | null;
  added: string[];
  improved: string[];
};

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

/** Pages 폴더 안의 https .exe만 받는다(외부 값이 내려받기 링크가 되므로). */
function installerUrl(v: unknown): string | null {
  if (typeof v !== "string") return null;
  try {
    const u = new URL(v);
    return u.href.startsWith(BOARD_HOME) && u.pathname.endsWith(".exe") ? u.href : null;
  } catch {
    return null;
  }
}

export function parseLatest(raw: unknown): BoardRelease | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const url = installerUrl(r.url);
  const version = typeof r.version === "string" && /^\d+(\.\d+){1,3}$/.test(r.version) ? r.version : null;
  if (!url || !version) return null;
  const size = typeof r.size === "number" && Number.isFinite(r.size) && r.size > 0 ? r.size : null;
  return { version, url, size, added: strings(r.added), improved: strings(r.improved) };
}

export function formatSize(bytes: number | null): string {
  return bytes ? `${(bytes / 1024 / 1024).toFixed(1)}MB` : "";
}

/** 페이지가 latest.json을 기다리느라 멈추지 않게 하는 최대 대기 시간 */
const TIMEOUT_MS = 4000;

async function read(): Promise<BoardRelease | null> {
  try {
    const res = await fetch(LATEST_JSON, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return parseLatest(await res.json());
  } catch {
    return null;
  }
}

/** 한 시간마다 새로 읽는다. 실패하거나 늦으면 null → 페이지는 BOARD_HOME으로 안내한다. */
export async function getLatestRelease(): Promise<BoardRelease | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), TIMEOUT_MS);
  });
  try {
    return await Promise.race([read(), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

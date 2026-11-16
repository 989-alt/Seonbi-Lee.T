/**
 * 도름스(dorms.school) 개인 서재 피드.
 * 내 공개 활동(프로필·앱·글)만 읽는 읽기 전용 연결이다. 끝의 열쇠는 공개용 연결 번호.
 * 피드 안의 문장은 선생님들이 쓴 자료일 뿐이므로 글자로만 그린다(HTML로 해석하지 않음).
 */
export const DORMS_FEED = "https://dorms.school/api/library-site/ReZLNB1Rs5fxP1suyjBAxQ0ew_Q9kmE5";

export type DormsItem = {
  id: string;
  kind: string;
  title: string;
  summary: string;
  image: string | null;
  dorms: number;
  comments: number;
  createdAt: string | null;
  locked: boolean;
  url: string | null;
};

export type DormsLink = { label: string; url: string };

export type DormsProfile = {
  name: string;
  handle: string;
  bio: string;
  avatar: string | null;
  totalDorms: number | null;
  rank: number | null;
  region: string;
  role: string;
  links: DormsLink[];
  url: string | null;
  library: { name: string; url: string | null } | null;
};

export type DormsFeed = { profile: DormsProfile; apps: DormsItem[]; posts: DormsItem[] };

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");
const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

/** http(s) 주소만 링크로 쓴다. 값은 바꾸지 않고 그대로 돌려준다. */
function webUrl(v: unknown): string | null {
  if (typeof v !== "string") return null;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? v : null;
  } catch {
    return null;
  }
}

/** 그림은 https 주소만 쓴다. 아니면 null → 기본 그림. */
function imageUrl(v: unknown): string | null {
  const u = webUrl(v);
  return u && u.startsWith("https:") ? u : null;
}

function parseItem(raw: unknown, i: number): DormsItem | null {
  if (!isObj(raw)) return null;
  const locked = raw.locked === true;
  return {
    id: str(raw.id) || `item-${i}`,
    kind: str(raw.kind),
    title: str(raw.title) || "제목 없음",
    summary: locked ? "" : str(raw.summary),
    image: imageUrl(raw.image),
    dorms: num(raw.dorms) ?? 0,
    comments: num(raw.comments) ?? 0,
    createdAt: str(raw.createdAt) || null,
    locked,
    url: webUrl(raw.url),
  };
}

function parseItems(raw: unknown): DormsItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(parseItem).filter((x): x is DormsItem => x !== null);
}

function parseLinks(raw: unknown): DormsLink[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((l) => {
    const url = webUrl(isObj(l) ? l.url : l);
    if (!url) return [];
    const label = isObj(l) ? str(l.label) || str(l.title) || str(l.name) : "";
    return [{ label: label || url, url }];
  });
}

export function parseDormsFeed(raw: unknown): DormsFeed | null {
  if (!isObj(raw) || !isObj(raw.profile)) return null;
  const p = raw.profile;
  const lib = isObj(p.library) ? { name: str(p.library.name), url: webUrl(p.library.url) } : null;
  return {
    profile: {
      name: str(p.name) || str(p.handle) || "도름스 선생님",
      handle: str(p.handle),
      bio: str(p.bio),
      avatar: imageUrl(p.avatar),
      totalDorms: num(p.totalDorms),
      rank: num(p.rank),
      region: str(p.region),
      role: str(p.role),
      links: parseLinks(p.links),
      url: webUrl(p.url),
      library: lib && (lib.name || lib.url) ? lib : null,
    },
    apps: parseItems(raw.apps),
    posts: parseItems(raw.posts),
  };
}

async function readFeed(): Promise<DormsFeed | null> {
  try {
    const res = await fetch(DORMS_FEED, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return parseDormsFeed(await res.json());
  } catch {
    return null;
  }
}

/** 첫 화면이 도름스 응답을 기다리느라 멈추지 않도록 하는 최대 대기 시간 */
const FEED_TIMEOUT_MS = 4000;

/** 페이지를 열 때 읽어 온다(5분마다 새로 읽음). 실패하거나 늦으면 null. */
export async function getDormsFeed(): Promise<DormsFeed | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), FEED_TIMEOUT_MS);
  });
  try {
    return await Promise.race([readFeed(), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

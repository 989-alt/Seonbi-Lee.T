export const INTRO_KEY = "bg_intro_seen_v1";

export function readIntroSeen(storage: Storage | null): boolean {
  try {
    return storage?.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeIntroSeen(storage: Storage | null): void {
  try {
    storage?.setItem(INTRO_KEY, "1");
  } catch {
    /* 저장소 차단 — 이번 방문에서만 기억 */
  }
}

import { seoulDay } from "./track";

/** 브라우저에서 하루 1회 방문 전송. 저장소가 막혀 있으면 조용히 건너뜀. */
export function sendVisitOnce(app: string, endpoint = "/api/track"): void {
  try {
    const ls = window.localStorage;
    let vid = ls.getItem("bg_vid");
    if (!vid) {
      vid = crypto.randomUUID();
      ls.setItem("bg_vid", vid);
    }
    const key = `bg_sent_${app}_${seoulDay(new Date())}`;
    if (ls.getItem(key)) return;
    if (navigator.sendBeacon?.(endpoint, JSON.stringify({ app, vid }))) ls.setItem(key, "1");
  } catch {
    /* localStorage 차단 등 — 집계만 건너뜀 */
  }
}

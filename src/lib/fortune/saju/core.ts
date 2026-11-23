import KoreanLunarCalendar from "korean-lunar-calendar";

/** 사주 계산. 모두 순수 함수이고 브라우저에서만 쓴다(생년월일을 서버로 보내지 않는다). */

export const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
export const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
export const STEM_KO = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"] as const;
export const BRANCH_KO = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"] as const;
export const ANIMALS = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"] as const;

/** 오행 index: 木0 火1 土2 金3 水4 */
export type El = 0 | 1 | 2 | 3 | 4;
export const EL_NAMES = ["목", "화", "토", "금", "수"] as const;
export const EL_HANJA = ["木", "火", "土", "金", "水"] as const;
export const BRANCH_EL: readonly El[] = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
/** 지지의 정기(본기) 천간 — 십신 계산에 쓴다 */
export const BRANCH_MAIN_STEM = [9, 5, 0, 1, 4, 2, 3, 5, 6, 7, 4, 8] as const;

export const mod = (a: number, n: number) => ((a % n) + n) % n;
export const stemEl = (stem: number): El => Math.floor(stem / 2) as El;
export const stemOf = (p: number) => p % 10;
export const branchOf = (p: number) => p % 12;
export const ganjiName = (p: number) => STEMS[stemOf(p)] + BRANCHES[branchOf(p)];
export const ganjiKo = (p: number) => STEM_KO[stemOf(p)] + BRANCH_KO[branchOf(p)];

/** 천간·지지 index로 60갑자 index 찾기 */
export const ganjiIndex = (stem: number, branch: number) => mod(6 * stem - 5 * branch, 60);

/** 율리우스 일수(정오 기준 정수) */
export function jdn(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const Y = y + 4800 - a;
  const M = m + 12 * a - 3;
  return d + Math.floor((153 * M + 2) / 5) + 365 * Y + Math.floor(Y / 4) - Math.floor(Y / 100) + Math.floor(Y / 400) - 32045;
}

export const dayPillarIndex = (j: number) => mod(j + 49, 60);
export const yearPillarIndex = (sajuYear: number) => mod(sajuYear - 4, 60);

/** 월 순번 m: 寅월=0 … 丑월=11 */
export function monthPillarIndex(yearPillar: number, m: number): number {
  return ganjiIndex(mod(stemOf(yearPillar) * 2 + 2 + m, 10), mod(m + 2, 12));
}

export function hourPillarIndex(dayStem: number, hourBranch: number): number {
  return ganjiIndex(mod(dayStem * 2 + hourBranch, 10), hourBranch);
}

/**
 * 태양 겉보기 황경(도), Meeus 25장 저정밀식.
 * shortcut: 오차 약 0.01°(절기 시각 15분 안쪽), 절입 시각 분 단위 판정이 필요해지면 KASI 절기표를 내장한다.
 */
export function sunLongitude(utcMs: number): number {
  const year = new Date(utcMs).getUTCFullYear();
  const deltaT = Math.max(0, 63.8 + 0.55 * (year - 2000)); // 초. 황경 오차에 비해 작아 직선 근사로 충분하다
  const T = (utcMs / 86400000 + 2440587.5 + deltaT / 86400 - 2451545) / 36525;
  const rad = Math.PI / 180;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * rad;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
    0.000289 * Math.sin(3 * M);
  return mod(L0 + C - 0.00569 - 0.00478 * Math.sin((125.04 - 1934.136 * T) * rad), 360);
}

const YEAR_MS = 365.2422 * 86400000;

/** 그 해에 태양황경이 lon이 되는 UTC 시각(ms). 1월 1일 황경은 약 280° */
export function termUtc(year: number, lon: number): number {
  let t = Date.UTC(year, 0, 1) + (mod(lon - 280, 360) / 360) * YEAR_MS;
  for (let i = 0; i < 6; i++) t += ((mod(lon - sunLongitude(t) + 180, 360) - 180) / 360) * YEAR_MS;
  return t;
}

/** utc를 사이에 둔 앞뒤 '절'(월이 바뀌는 절기) 시각 */
export function surroundingJeol(utc: number): { prev: number; next: number } {
  const y = new Date(utc).getUTCFullYear();
  const all = [y - 1, y, y + 1].flatMap((yy) => Array.from({ length: 12 }, (_, m) => termUtc(yy, mod(315 + 30 * m, 360)))).sort((a, b) => a - b);
  const i = all.findIndex((t) => t > utc);
  return { prev: all[i - 1], next: all[i] };
}

const seoulFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Seoul", hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric",
});
const seoulParts = (d: Date) => Object.fromEntries(seoulFmt.formatToParts(d).map((x) => [x.type, Number(x.value)]));

function offsetAt(utcMs: number): number {
  const p = seoulParts(new Date(utcMs));
  return Math.round((Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - utcMs) / 60000);
}

/** 그 현지 시각의 한국 표준시 오프셋(분). 서머타임·UTC+8:30 시기를 tzdb로 반영 */
export function kstOffsetMinutes(y: number, m: number, d: number, hh: number, mm: number): number {
  const local = Date.UTC(y, m - 1, d, hh, mm);
  return offsetAt(local - offsetAt(local - 540 * 60000) * 60000);
}

/** 서울 경도 126.98°E → 지방평균태양시 UTC+8:27:55 */
const SEOUL_LMT_MS = 126.98 * 4 * 60000;

export type BirthInput = { y: number; m: number; d: number; /** "HH:MM" 또는 모름(null) */ time: string | null };
export type Saju = {
  year: number; month: number; day: number; hour: number | null;
  /** 월 순번 寅=0 … 丑=11 */
  monthOrder: number;
  sajuYear: number;
  solarTime: string | null;
  utc: number;
  /** 절기 경계에 걸쳐 연주·월주가 달라질 수 있음 */
  nearTerm: boolean;
};

export function yearMonthAt(utc: number): { sajuYear: number; monthOrder: number; year: number; month: number } {
  const monthOrder = Math.floor(mod(sunLongitude(utc) - 315, 360) / 30);
  const y = new Date(utc + 9 * 3600000).getUTCFullYear();
  const sajuYear = utc < termUtc(y, 315) ? y - 1 : y;
  const year = yearPillarIndex(sajuYear);
  return { sajuYear, monthOrder, year, month: monthPillarIndex(year, monthOrder) };
}

export function sajuOf(b: BirthInput): Saju {
  const [hh, mm] = b.time ? b.time.split(":").map(Number) : [12, 0];
  const utc = Date.UTC(b.y, b.m - 1, b.d, hh, mm) - kstOffsetMinutes(b.y, b.m, b.d, hh, mm) * 60000;
  const { sajuYear, monthOrder, year, month } = yearMonthAt(utc);
  const { prev, next } = surroundingJeol(utc);
  const margin = b.time ? 20 * 60000 : 12 * 3600000;
  const base = { year, month, monthOrder, sajuYear, utc, nearTerm: utc - prev < margin || next - utc < margin };
  if (!b.time) return { ...base, day: dayPillarIndex(jdn(b.y, b.m, b.d)), hour: null, solarTime: null };

  const solar = new Date(utc + SEOUL_LMT_MS);
  const shown = new Date(Math.round(solar.getTime() / 60000) * 60000);
  const sh = solar.getUTCHours();
  // 통자시: 태양시 23시가 넘으면 다음 날로 본다
  const day = dayPillarIndex(jdn(solar.getUTCFullYear(), solar.getUTCMonth() + 1, solar.getUTCDate()) + (sh >= 23 ? 1 : 0));
  const hourBranch = Math.floor(((sh + 1) % 24) / 2);
  const solarTime = `${String(shown.getUTCHours()).padStart(2, "0")}:${String(shown.getUTCMinutes()).padStart(2, "0")}`;
  return { ...base, day, hour: hourPillarIndex(stemOf(day), hourBranch), solarTime };
}

export function lunarToSolar(y: number, m: number, d: number, leap: boolean): { y: number; m: number; d: number } | null {
  if (m < 1 || m > 12 || d < 1 || d > 30) return null;
  const cal = new KoreanLunarCalendar();
  if (!cal.setLunarDate(y, m, d, leap)) return null;
  const s = cal.getSolarCalendar();
  // 되돌려 봐서 다르면 없는 날짜(작은달 30일, 없는 윤달)
  const back = new KoreanLunarCalendar();
  back.setSolarDate(s.year, s.month, s.day);
  const l = back.getLunarCalendar();
  if (l.year !== y || l.month !== m || l.day !== d || !!l.intercalation !== leap) return null;
  return { y: s.year, m: s.month, d: s.day };
}

export function seoulToday(now = new Date()): { y: number; m: number; d: number } {
  const p = seoulParts(now);
  return { y: p.year, m: p.month, d: p.day };
}

import { branchGodIndex, branchRelations, stageIndex, tenGodIndex, type Analysis } from "./analysis";
import { BRANCH_EL, branchOf, dayPillarIndex, jdn, mod, stemEl, stemOf, surroundingJeol, yearMonthAt, yearPillarIndex, type El, type Saju } from "./core";

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(n)));

/** 나를 극하거나 힘을 빼는 쪽으로 기운 오행(간이 기신): 용신을 극하는 오행 */
const gisin = (yong: El) => mod(yong + 3, 5) as El;

/** 12운성 → 에너지 보정 */
const STAGE_BONUS = [8, 2, 6, 10, 10, 0, -5, -5, -2, -5, 2, 4];

/** 기둥 하나(대운·세운·월운)가 이 사주에 얼마나 편안한지 0~100 */
export function pillarScore(s: Saju, a: Analysis, pillar: number): number {
  const st = stemOf(pillar);
  const br = branchOf(pillar);
  let n = 52;
  for (const [el, w] of [[stemEl(st), 0.7], [BRANCH_EL[br], 1]] as const) {
    if (el === a.yong) n += 20 * w;
    else if (mod(el + 1, 5) === a.yong) n += 10 * w; // 용신을 낳는 오행
    else if (el === gisin(a.yong)) n -= 13 * w;
  }
  for (const own of [branchOf(s.day), branchOf(s.month)]) {
    for (const r of branchRelations(own, br)) n += r === "육합" || r === "삼합" ? 6 : r === "충" ? -8 : -3;
  }
  n += STAGE_BONUS[stageIndex(a.dayStem, br)];
  return clamp(n, 22, 97);
}

export type DaeunStep = { age: number; pillar: number; score: number; god: number };

/** 대운 9개. 성별이 없으면 방향을 정할 수 없어 호출하지 않는다 */
export function daeun(s: Saju, a: Analysis, gender: "M" | "F"): DaeunStep[] {
  const forward = (stemOf(s.year) % 2 === 0) === (gender === "M");
  const { prev, next } = surroundingJeol(s.utc);
  const days = (forward ? next - s.utc : s.utc - prev) / 86400000;
  const start = Math.max(1, Math.round(days / 3));
  return Array.from({ length: 9 }, (_, i) => {
    const pillar = mod(s.month + (forward ? 1 : -1) * (i + 1), 60);
    return { age: start + i * 10, pillar, score: pillarScore(s, a, pillar), god: branchGodIndex(a.dayStem, branchOf(pillar)) };
  });
}

/** 세는나이(대운 나이 기준) */
export const koreanAge = (birthYear: number, thisYear: number) => thisYear - birthYear + 1;

export function yearLuck(s: Saju, a: Analysis, year: number) {
  const pillar = yearPillarIndex(year);
  return { year, pillar, score: pillarScore(s, a, pillar), god: tenGodIndex(a.dayStem, stemOf(pillar)) };
}

export type MonthLuck = { year: number; month: number; pillar: number; score: number };
/** 이번 달부터 12개월 월운(매월 15일 기준 월주) */
export function monthLuck(s: Saju, a: Analysis, from: { y: number; m: number }): MonthLuck[] {
  return Array.from({ length: 12 }, (_, i) => {
    const year = from.y + Math.floor((from.m - 1 + i) / 12);
    const month = ((from.m - 1 + i) % 12) + 1;
    const pillar = yearMonthAt(Date.UTC(year, month - 1, 15, 3)).month;
    return { year, month, pillar, score: pillarScore(s, a, pillar) };
  });
}

export type TodayFortune = {
  pillar: number;
  /** 오늘 천간의 십신 index */
  god: number;
  stage: number;
  total: number;
  love: number; money: number; study: number; energy: number;
  relations: string[];
  /** 문장 변주 선택용 고정 시드 */
  seed: number;
};

/** 문자열 해시(FNV-1a) — 같은 사주·같은 날이면 같은 문장 */
export function hashSeed(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 0x01000193);
  return h >>> 0;
}

export function todayFortune(s: Saju, a: Analysis, d: { y: number; m: number; d: number }): TodayFortune {
  const pillar = dayPillarIndex(jdn(d.y, d.m, d.d));
  const br = branchOf(pillar);
  const god = tenGodIndex(a.dayStem, stemOf(pillar));
  const group = Math.floor(god / 2);
  const bGroup = Math.floor(branchGodIndex(a.dayStem, br) / 2);
  const stage = stageIndex(a.dayStem, br);
  const relations = branchRelations(branchOf(s.day), br);
  const harmony = relations.reduce((n, r) => n + (r === "육합" || r === "삼합" ? 10 : r === "충" ? -10 : -5), 0);
  const el = BRANCH_EL[br] === a.yong ? 10 : BRANCH_EL[br] === gisin(a.yong) ? -5 : 0;
  const total = clamp(58 + STAGE_BONUS[stage] * 1.6 + harmony + el, 22, 97);
  const has = (g: number) => (group === g ? 12 : 0) + (bGroup === g ? 8 : 0);
  const base = 40 + total * 0.35;
  return {
    pillar, god, stage, total, relations,
    love: clamp(base + harmony + has(1) * 0.5 + has(3) * 0.5, 25, 98),
    money: clamp(base + has(2) + has(1) * 0.4, 25, 98),
    study: clamp(base + has(4) + has(1) * 0.4, 25, 98),
    energy: clamp(58 + STAGE_BONUS[stage] * 2.6 + harmony * 0.4, 25, 98),
    seed: hashSeed(`${s.year}|${s.month}|${s.day}|${s.hour}|${d.y}-${d.m}-${d.d}`),
  };
}

/** 삼재: 띠(연지) 기준. 들·눌·날 또는 null */
export function samjae(yearBranch: number, year: number): "들삼재" | "눌삼재" | "날삼재" | null {
  // 申子辰→寅卯辰, 巳酉丑→亥子丑, 寅午戌→申酉戌, 亥卯未→巳午未
  const start = [2, 11, 8, 5][yearBranch % 4];
  const k = mod(branchOf(yearPillarIndex(year)) - start, 12);
  return k < 3 ? (["들삼재", "눌삼재", "날삼재"] as const)[k] : null;
}

export type GoodDay = { y: number; m: number; d: number; pillar: number; score: number };
/** 오늘부터 30일 중 점수가 높은 날 5개(날짜순) */
export function goodDays(s: Saju, a: Analysis, from: { y: number; m: number; d: number }): GoodDay[] {
  return Array.from({ length: 30 }, (_, i) => {
    const t = new Date(Date.UTC(from.y, from.m - 1, from.d + i));
    const day = { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
    const pillar = dayPillarIndex(jdn(day.y, day.m, day.d));
    const clash = branchRelations(branchOf(s.day), branchOf(pillar)).some((r) => r === "충" || r === "형");
    return { ...day, pillar, score: pillarScore(s, a, pillar) - (clash ? 100 : 0) };
  })
    .sort((p, q) => q.score - p.score)
    .slice(0, 5)
    .sort((p, q) => Date.UTC(p.y, p.m, p.d) - Date.UTC(q.y, q.m, q.d));
}


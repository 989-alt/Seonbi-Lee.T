import { BRANCH_EL, BRANCH_MAIN_STEM, branchOf, mod, stemEl, stemOf, type El, type Saju } from "./core";

export const TEN_GODS = ["비견", "겁재", "식신", "상관", "편재", "정재", "편관", "정관", "편인", "정인"] as const;
export type TenGod = (typeof TEN_GODS)[number];
/** 십신 다섯 묶음: 비겁0 식상1 재성2 관성3 인성4 */
export const GOD_GROUPS = ["비겁", "식상", "재성", "관성", "인성"] as const;

export function tenGodIndex(dayStem: number, stem: number): number {
  const d = mod(stemEl(stem) - stemEl(dayStem), 5);
  return d * 2 + (dayStem % 2 === stem % 2 ? 0 : 1);
}
export const tenGod = (dayStem: number, stem: number): TenGod => TEN_GODS[tenGodIndex(dayStem, stem)];
export const branchGodIndex = (dayStem: number, branch: number) => tenGodIndex(dayStem, BRANCH_MAIN_STEM[branch]);

export const STAGES = ["장생", "목욕", "관대", "건록", "제왕", "쇠", "병", "사", "묘", "절", "태", "양"] as const;
const JANGSAENG = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3];
export function stageIndex(dayStem: number, branch: number): number {
  const s = JANGSAENG[dayStem];
  return dayStem % 2 === 0 ? mod(branch - s, 12) : mod(s - branch, 12);
}

export type Relation = "육합" | "삼합" | "충" | "형" | "파" | "해";
const pairKey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);
const HYEONG = new Set(["2-5", "5-8", "2-8", "1-10", "7-10", "1-7", "0-3", "4-4", "6-6", "9-9", "11-11"]);
const PA = new Set(["0-9", "1-4", "2-11", "3-6", "5-8", "7-10"]);

/** 두 지지의 관계. 겹치면 모두 돌려준다 */
export function branchRelations(a: number, b: number): Relation[] {
  const k = pairKey(a, b);
  const out: Relation[] = [];
  if (a !== b && mod(a + b, 12) === 1) out.push("육합");
  if (a !== b && mod(a - b, 4) === 0) out.push("삼합");
  if (mod(a - b, 12) === 6) out.push("충");
  if (HYEONG.has(k)) out.push("형");
  if (PA.has(k)) out.push("파");
  if (a !== b && mod(a + b, 12) === 7) out.push("해");
  return out;
}
export const stemHap = (a: number, b: number) => Math.abs(a - b) === 5;

type Pos = { stem?: number; branch?: number; weight: number };
function positions(s: Saju): Pos[] {
  const p: Pos[] = [
    { stem: stemOf(s.year), weight: 10 }, { stem: stemOf(s.month), weight: 10 },
    { branch: branchOf(s.year), weight: 10 }, { branch: branchOf(s.month), weight: 30 }, { branch: branchOf(s.day), weight: 15 },
  ];
  if (s.hour !== null) p.push({ stem: stemOf(s.hour), weight: 10 }, { branch: branchOf(s.hour), weight: 15 });
  return p;
}

export type Strength = "신강" | "중화" | "신약";
export type Sinsal = { key: string; name: string; desc: string };

export type Analysis = {
  dayStem: number;
  dayEl: El;
  /** 8글자(시각 모르면 6글자) 오행 개수 */
  counts: number[];
  /** 십신 다섯 묶음 개수(일간 제외) */
  groups: number[];
  support: number;
  strength: Strength;
  /** 간이 용신 오행 */
  yong: El;
  missing: El[];
  strongest: El;
  sinsal: Sinsal[];
  gongmang: number[];
};

const CHEONEUL: number[][] = [[1, 7], [0, 8], [11, 9], [11, 9], [1, 7], [0, 8], [1, 7], [2, 6], [3, 5], [3, 5]];
const MUNCHANG = [5, 6, 8, 9, 8, 9, 11, 0, 2, 3];
/** 삼합 그룹(지지 % 4)별 역마·도화·화개. 申子辰0 巳酉丑1 寅午戌2 亥卯未3 */
const YEOKMA = [2, 11, 8, 5];
const DOHWA = [9, 6, 3, 0];
const HWAGAE = [4, 1, 10, 7];

export function analyze(s: Saju): Analysis {
  const dayStem = stemOf(s.day);
  const dayEl = stemEl(dayStem);
  const counts = [0, 0, 0, 0, 0];
  const groups = [0, 0, 0, 0, 0];
  counts[dayEl]++;
  let help = 0;
  let total = 0;
  for (const p of positions(s)) {
    const el = p.stem !== undefined ? stemEl(p.stem) : BRANCH_EL[p.branch!];
    const g = mod(el - dayEl, 5);
    counts[el]++;
    groups[g]++;
    total += p.weight;
    if (g === 0 || g === 4) help += p.weight;
  }
  const support = Math.round((help / total) * 100);
  const strength: Strength = support >= 55 ? "신강" : support <= 45 ? "신약" : "중화";

  // 간이 억부 + 조후. 여름생은 水, 겨울생은 火를 먼저 본다(이미 2개 이상이면 억부로)
  const mb = branchOf(s.month);
  const els = (gs: number[]) => gs.map((g) => mod(dayEl + g, 5) as El);
  const weakest = (list: El[]) => list.reduce((a, b) => (counts[b] < counts[a] ? b : a));
  let yong = strength === "신강" ? weakest(els([1, 2, 3])) : strength === "신약" ? weakest(els([4, 0])) : weakest([0, 1, 2, 3, 4]);
  if ([5, 6, 7].includes(mb) && counts[4] < 2) yong = 4;
  if ([11, 0, 1].includes(mb) && counts[1] < 2) yong = 1;

  const branches = [branchOf(s.year), mb, branchOf(s.day), ...(s.hour !== null ? [branchOf(s.hour)] : [])];
  const groupKeys = [branchOf(s.year) % 4, branchOf(s.day) % 4];
  const hasBy = (table: number[]) => groupKeys.some((g) => branches.includes(table[g]));
  const sinsal: Sinsal[] = [];
  const add = (on: boolean, key: string, name: string, desc: string) => { if (on) sinsal.push({ key, name, desc }); };
  add(CHEONEUL[dayStem].some((b) => branches.includes(b)), "cheoneul", "천을귀인", "막힐 때 도와줄 사람이 나타나는 별이에요.");
  add(branches.includes(MUNCHANG[dayStem]), "munchang", "문창귀인", "글과 말, 배움에 밝은 별이에요. 공부하고 가르치는 일에 잘 어울려요.");
  add(hasBy(DOHWA), "dohwa", "도화", "사람을 끌어당기는 인기의 별이에요.");
  add(hasBy(YEOKMA), "yeokma", "역마", "움직이고 옮길수록 일이 잘 풀리는 별이에요.");
  add(hasBy(HWAGAE), "hwagae", "화개", "혼자 몰입할 때 빛나는 예술의 별이에요.");

  const xun = s.day - (s.day % 10);
  return {
    dayStem, dayEl, counts, groups, support, strength, yong, sinsal,
    missing: ([0, 1, 2, 3, 4] as El[]).filter((e) => counts[e] === 0),
    strongest: ([0, 1, 2, 3, 4] as El[]).reduce((a, b) => (counts[b] > counts[a] ? b : a)),
    gongmang: [mod(xun + 10, 12), mod(xun + 11, 12)],
  };
}

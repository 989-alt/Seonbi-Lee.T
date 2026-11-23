import { describe, expect, it } from "vitest";
import { analyze, branchRelations, STAGES, stageIndex, TEN_GODS, tenGod } from "./analysis";
import { ganjiName, sajuOf, stemOf } from "./core";
import { daeun, goodDays, monthLuck, samjae, todayFortune } from "./luck";

const s = sajuOf({ y: 1988, m: 5, d: 21, time: "15:20" });
const a = analyze(s);

describe("십신·12운성·관계", () => {
  it("丙 일간 기준 십신", () => {
    expect([..."甲乙丙丁戊己庚辛壬癸"].map((_, i) => tenGod(2, i))).toEqual(["편인", "정인", "비견", "겁재", "식신", "상관", "편재", "정재", "편관", "정관"]);
    expect(TEN_GODS).toHaveLength(10);
  });
  it("12운성: 甲은 寅에서 건록, 乙은 卯에서 건록, 丁은 午에서 건록", () => {
    expect([stageIndex(0, 2), stageIndex(1, 3), stageIndex(3, 6)].map((i) => STAGES[i])).toEqual(["건록", "건록", "건록"]);
  });
  it("지지 관계", () => {
    expect(branchRelations(0, 1)).toContain("육합");
    expect(branchRelations(8, 0)).toContain("삼합");
    expect(branchRelations(0, 6)).toContain("충");
    expect(branchRelations(0, 7)).toContain("해");
    expect(branchRelations(4, 4)).toEqual(["형"]);
    expect(branchRelations(3, 3)).toEqual([]);
  });
});

describe("분석", () => {
  it("오행 개수 합은 8, 십신 묶음 합은 7", () => {
    expect(a.counts.reduce((x, y) => x + y)).toBe(8);
    expect(a.groups.reduce((x, y) => x + y)).toBe(7);
  });
  it("乙未 丙子 丁巳 戊辰: 木1 火3 土3 金0 水1, 巳월(여름)이라 용신 水", () => {
    expect(a.counts).toEqual([1, 3, 3, 0, 1]);
    expect(a.missing).toEqual([3]);
    expect(a.yong).toBe(4);
  });
  it("시각을 모르면 6글자", () => {
    const b = analyze(sajuOf({ y: 1988, m: 5, d: 21, time: null }));
    expect(b.counts.reduce((x, y) => x + y)).toBe(6);
  });
  it("공망: 甲子순은 戌亥", () => {
    expect(analyze(sajuOf({ y: 2024, m: 1, d: 1, time: null })).gongmang).toEqual([10, 11]);
  });
});

describe("운", () => {
  it("대운은 월주에서 순행(양년 남자)·역행(양년 여자)한다", () => {
    expect(ganjiName(daeun(s, a, "M")[0].pillar)).toBe("戊午");
    expect(ganjiName(daeun(s, a, "F")[0].pillar)).toBe("丙辰");
    // 1988-05-21 ~ 망종(6/5경) 약 15일 → 5, 입하(5/5경)부터 약 16일 → 5
    expect(daeun(s, a, "M")[0].age).toBe(5);
    expect(daeun(s, a, "M")).toHaveLength(9);
  });
  it("오늘의 운세는 같은 날 같은 값, 점수는 0~100", () => {
    const d = { y: 2026, m: 11, d: 23 };
    const t = todayFortune(s, a, d);
    expect(todayFortune(s, a, d)).toEqual(t);
    expect(ganjiName(t.pillar)).toBe("辛丑");
    for (const n of [t.total, t.love, t.money, t.study, t.energy]) {
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThanOrEqual(100);
    }
    expect(TEN_GODS[t.god]).toBe(tenGod(stemOf(s.day), 7));
  });
  it("삼재: 2026 丙午년은 돼지·토끼·양띠 눌삼재", () => {
    expect([11, 3, 7].map((b) => samjae(b, 2026))).toEqual(["눌삼재", "눌삼재", "눌삼재"]);
    expect(samjae(0, 2026)).toBeNull();
    expect(samjae(0, 2022)).toBe("들삼재"); // 2022 壬寅
  });
  it("월운은 해를 넘겨 12개월", () => {
    const m = monthLuck(s, a, { y: 2026, m: 11 });
    expect(m.map((x) => x.month)).toEqual([11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(m[2].year).toBe(2027);
  });
  it("좋은 날은 5개, 날짜순", () => {
    const g = goodDays(s, a, { y: 2026, m: 11, d: 23 });
    expect(g).toHaveLength(5);
    const ts = g.map((x) => Date.UTC(x.y, x.m, x.d));
    expect([...ts].sort((x, y) => x - y)).toEqual(ts);
  });
  it("100년치 무작위 생일에서 오류 없이 점수 범위를 지킨다", () => {
    for (let i = 0; i < 400; i++) {
      const b = sajuOf({ y: 1930 + (i % 95), m: (i % 12) + 1, d: (i % 28) + 1, time: i % 3 ? `${String(i % 24).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}` : null });
      const x = analyze(b);
      for (const step of daeun(b, x, i % 2 ? "M" : "F")) {
        expect(step.age).toBeGreaterThanOrEqual(1);
        expect(step.age).toBeLessThanOrEqual(92);
        expect(Number.isInteger(step.score)).toBe(true);
      }
    }
  });
});

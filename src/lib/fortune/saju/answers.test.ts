import { describe, expect, it } from "vitest";
import { analyze } from "./analysis";
import { answer, matchDetail, overview, QUESTIONS, relationshipInsight, routeQuestion, type Ctx } from "./answers";
import { sajuOf } from "./core";
import { daeun } from "./luck";

const ctx = (y: number, time: string | null, gender: "M" | "F" | null): Ctx => {
  const saju = sajuOf({ y, m: 5, d: 21, time });
  const a = analyze(saju);
  return { saju, a, today: { y: 2026, m: 11, d: 23 }, daeun: gender ? daeun(saju, a, gender) : null, age: 2026 - y + 1 };
};

describe("질문 답변", () => {
  it("12개 주제 모두 빈 문장 없이 답하고 단정하는 말을 쓰지 않는다", () => {
    expect(QUESTIONS).toHaveLength(12);
    for (const c of [ctx(1988, "15:20", "M"), ctx(1975, null, null), ctx(1999, "00:10", "F")]) {
      for (const q of QUESTIONS) for (let b = 0; b < 12; b++) {
        const r = answer(q.id, c, b);
        expect(r.actions.length).toBeGreaterThan(0);
        for (const line of [r.summary, r.why, ...r.actions]) {
          expect(line.length).toBeGreaterThan(5);
          expect(line).not.toMatch(/undefined|NaN|반드시|무조건|흉/);
        }
      }
    }
  });
  it("한눈에 보기는 세 줄", () => {
    for (const y of [1960, 1975, 1988, 1999, 2004]) {
      const lines = overview(ctx(y, null, null).a);
      expect(lines).toHaveLength(3);
      for (const l of lines) expect(l).not.toMatch(/undefined|NaN/);
    }
  });
  it("인연 섹션 항목을 모두 채운다", () => {
    const r = relationshipInsight(ctx(1988, null, null).saju, ctx(1988, null, null).a);
    expect(r.compatibleTraits.length).toBeGreaterThanOrEqual(3);
    expect(r.practicalActions).toHaveLength(3);
    expect(r.meetingContexts.length).toBeGreaterThanOrEqual(3);
  });
  it("자유 질문을 주제로 연결한다", () => {
    expect(routeQuestion("내년에 어떤 해가 될까요")).toBe("newyear");
    expect(routeQuestion("전보를 쓸까 말까")).toBe("work");
    expect(routeQuestion("면접 언제 볼까")).toBe("goodday");
    expect(routeQuestion("ㅎㅎ")).toBeNull();
  });
  it("두 사람 사주 궁합: 점수 범위와 문장", () => {
    const me = ctx(1988, "15:20", null);
    for (const [y, t] of [[1990, "08:00"], [1985, null], [1988, "15:20"], [2000, "23:40"]] as const) {
      const other = sajuOf({ y, m: 9, d: 3, time: t });
      const d = matchDetail(me.saju, me.a, other, analyze(other));
      expect(d.score).toBeGreaterThanOrEqual(30);
      expect(d.score).toBeLessThanOrEqual(95);
      for (const l of [...d.points, ...d.tips, ...d.basis]) expect(l).not.toMatch(/undefined|NaN|반드시|무조건/);
      const r = answer("match", me, 0, other);
      expect(r.title).toBe("두 사람의 사주 궁합");
      expect(r.summary).toContain(`${d.score}점`);
    }
  });
});

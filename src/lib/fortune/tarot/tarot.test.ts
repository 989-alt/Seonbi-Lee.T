import { describe, expect, it } from "vitest";
import { TAROT_CARDS } from "@/data/fortune/tarot-cards";
import { dailyCardId, drawReversed, mulberry32, ORDERED_IDS, shuffle } from "./deck";
import { fanPlaces, hitCard, MAX_ROT, spreadOffset, tableMetrics } from "./layout";
import { blockedQuestion, readCards, SPREADS, spreadById, toneOf, TOPICS } from "./reading";
import { initialTarot, tarotReducer, type TarotState } from "./state";

describe("덱", () => {
  it("78장, 고유 ID, 메이저 22 + 슈트 14×4", () => {
    expect(ORDERED_IDS).toHaveLength(78);
    expect(new Set(ORDERED_IDS).size).toBe(78);
    const by = (g: string) => TAROT_CARDS.filter((c) => c.group === g).length;
    expect([by("major"), by("wands"), by("cups"), by("swords"), by("pentacles")]).toEqual([22, 14, 14, 14, 14]);
    expect(new Set(TAROT_CARDS.map((c) => c.front)).size).toBe(78);
    expect(TAROT_CARDS.find((c) => c.id === "major-08")?.nameKo).toBe("힘");
    expect(TAROT_CARDS.find((c) => c.id === "major-11")?.nameKo).toBe("정의");
  });
  it("셔플은 원본을 바꾸지 않고 순열을 돌려준다", () => {
    const before = [...ORDERED_IDS];
    const s = shuffle(ORDERED_IDS, mulberry32(1));
    expect(ORDERED_IDS).toEqual(before);
    expect(s).not.toEqual(before);
    expect(new Set(s).size).toBe(78);
  });
  it("오늘의 카드는 같은 기기·같은 날이면 같다", () => {
    expect(dailyCardId("a", "2026-11-23")).toBe(dailyCardId("a", "2026-11-23"));
    const days = Array.from({ length: 60 }, (_, i) => dailyCardId("a", `d${i}`));
    expect(new Set(days).size).toBeGreaterThan(8);
    expect(days.every((d) => d.startsWith("major-"))).toBe(true);
  });
  it("역방향을 끄면 모두 정방향", () => {
    expect(Object.values(drawReversed(ORDERED_IDS, mulberry32(3), false)).some(Boolean)).toBe(false);
    expect(Object.values(drawReversed(ORDERED_IDS, mulberry32(3), true)).some(Boolean)).toBe(true);
  });
});

describe("배치", () => {
  it.each([[1280, 3, 26], [1000, 3, 26], [700, 3, 26], [358, 6, 13], [328, 6, 13]])("폭 %i: %i층 × %i장, 화면 안, 회전 ±12° 이내", (w, rows, per) => {
    const m = tableMetrics(w, 3);
    expect([m.rows, m.perRow]).toEqual([rows, per]);
    const p = fanPlaces(ORDERED_IDS, [], m);
    expect(p.size).toBe(78);
    for (const c of p.values()) {
      expect(Math.abs(c.rot)).toBeLessThanOrEqual(MAX_ROT);
      expect(c.x - m.cardW / 2).toBeGreaterThanOrEqual(-2);
      expect(c.x + m.cardW / 2).toBeLessThanOrEqual(w + 2);
      expect(c.y + m.cardH / 2).toBeLessThan(m.slots[0].y - m.slotH / 2);
    }
    for (const s of m.slots) expect(s.x + m.slotW / 2).toBeLessThanOrEqual(w);
  });
  it.each([[1280], [1000], [358]])("폭 %i: 78장 모두 포인터로 고를 수 있다", (w) => {
    const m = tableMetrics(w, 3);
    const p = fanPlaces(ORDERED_IDS, [], m);
    const reach = new Map<string, number>();
    for (let y = 0; y < m.height; y += 4) for (let x = 0; x < w; x += 4) {
      const id = hitCard(x, y, p, m);
      if (id) reach.set(id, (reach.get(id) ?? 0) + 1);
    }
    expect(reach.size).toBe(78);
    // 가장 많이 가려진 카드도 16px²짜리 점 30개(약 480px²) 이상 보인다
    expect(Math.min(...reach.values())).toBeGreaterThanOrEqual(30);
  });
  it("1440 화면에서 겹침은 45% 이하", () => {
    const m = tableMetrics(1280, 3);
    expect(1 - m.gapX / m.cardW).toBeLessThanOrEqual(0.45);
  });
  it("뽑은 카드는 빠지고 나머지가 다시 모인다", () => {
    const m = tableMetrics(1280, 3);
    const p = fanPlaces(ORDERED_IDS, [ORDERED_IDS[0]], m);
    expect(p.size).toBe(77);
    const row0 = [...p.values()].filter((c) => c.row === 0);
    expect(row0.reduce((s, c) => s + c.x, 0) / row0.length).toBeCloseTo(640);
  });
  it("호버 옆 4장까지 살짝 비켜난다", () => {
    const m = tableMetrics(1280, 3);
    const p = fanPlaces(ORDERED_IDS, [], m);
    const at = (i: number) => p.get(ORDERED_IDS[i])!;
    expect([1, 2, 3, 4, 5].map((i) => spreadOffset(at(10 + i), at(10)))).toEqual([14, 10, 6, 3, 0]);
    expect(spreadOffset(at(9), at(10))).toBe(-14);
    expect(spreadOffset(at(36), at(10))).toBe(0);
  });
});

describe("상태", () => {
  const play = (s: TarotState, ...acts: Parameters<typeof tarotReducer>[1][]) => acts.reduce(tarotReducer, s);
  const ready = () => play(initialTarot(3), { type: "shuffle", deckOrder: shuffle(ORDERED_IDS, mulberry32(7)), reversedById: {} }, { type: "shuffled" }, { type: "spread" }, { type: "fanReady" });
  it("섞기 전에는 펼칠 수 없다", () => expect(tarotReducer(initialTarot(3), { type: "spread" }).phase).toBe("READY_STACK"));
  it("3장을 고르기 전에는 공개할 수 없다", () => {
    let s = ready();
    expect(tarotReducer(s, { type: "reveal" }).phase).toBe("READY_FAN");
    for (const id of s.deckOrder.slice(0, 3)) s = play(s, { type: "select", id }, { type: "landed" });
    expect(s.selected).toHaveLength(3);
    s = play(s, { type: "reveal" }, { type: "flip" }, { type: "flip" });
    expect(s.phase).toBe("REVEALING");
    expect(tarotReducer(s, { type: "flip" }).phase).toBe("RESULTS");
  });
  it("같은 카드·네 번째 카드·이동 중 선택은 무시한다", () => {
    let s = ready();
    const [a, b, c, d] = s.deckOrder;
    s = play(s, { type: "select", id: a });
    expect(tarotReducer(s, { type: "select", id: b }).selected).toEqual([a]);
    s = play(s, { type: "landed" }, { type: "select", id: a });
    expect(s.selected).toEqual([a]);
    s = play(s, { type: "select", id: b }, { type: "landed" }, { type: "select", id: c }, { type: "landed" }, { type: "select", id: d });
    expect(s.selected).toEqual([a, b, c]);
  });
  it("초기화하면 처음 상태", () => expect(tarotReducer(ready(), { type: "reset", need: 1 })).toEqual(initialTarot(1)));
});

describe("리딩", () => {
  const c = (id: string) => TAROT_CARDS.find((x) => x.id === id)!;
  it("모든 배열×주제에서 결론·뜻·할 일이 빠지지 않는다", () => {
    for (const sp of SPREADS) for (const t of TOPICS) {
      const ids = shuffle(ORDERED_IDS, mulberry32(5)).slice(0, sp.positions.length);
      const r = readCards(ids, { [ids[0]]: true }, sp.id, t.id);
      expect(r.positions.map((p) => p.position)).toEqual([...spreadById(sp.id).positions]);
      for (const p of r.positions) for (const x of [p.frame, p.meaning, p.action]) expect(x?.length).toBeGreaterThan(8);
      expect(r.positions[0].meaning).toBe(r.positions[0].card.reversed);
      expect(r.positions[0].action).toBe(r.positions[0].card.doReversed);
      expect(r.verdict.length).toBeGreaterThan(8);
      expect(r.actions.length).toBeGreaterThan(0);
      expect(JSON.stringify(r)).not.toContain("undefined");
    }
  });
  it("78장 모두 뜻과 행동이 서로 다르다", () => {
    for (const k of ["upright", "reversed", "doUpright", "doReversed"] as const) expect(new Set(TAROT_CARDS.map((x) => x[k])).size).toBe(78);
  });
  it("뒤집힌 카드의 흐름", () => {
    expect([toneOf(c("major-19"), false), toneOf(c("major-19"), true), toneOf(c("major-16"), true), toneOf(c("major-11"), true)]).toEqual([1, 0, 0, -1]);
  });
  it("3장: 미래 카드가 결론을 정하고 흐름을 설명한다", () => {
    const up = readCards(["major-16", "swords-03", "major-19"], {}, "three", "work");
    expect(up.verdict).toContain("흐름이 좋아요");
    expect(up.flow[1]).toContain("나아지는");
    expect(up.positions[0].topicLine).toBeNull();
    expect(up.positions[2].topicLine).toContain("나서도 좋은");
    expect(up.actions.map((a) => a.label)).toEqual(["지금 할 일", "앞날을 위해"]);
    expect(readCards(["major-19", "major-19", "major-16"], {}, "three", "love").flow[1]).toContain("조심할 일");
  });
  it("A냐 B냐: 더 순조로운 쪽을 말한다", () => {
    expect(readCards(["major-19", "major-16", "major-14"], {}, "choice", "choice").verdict).toContain("A 쪽");
    expect(readCards(["major-16", "major-19", "major-14"], {}, "choice", "choice").verdict).toContain("B 쪽");
    expect(readCards(["major-19", "major-17", "major-14"], {}, "choice", "choice").verdict).toContain("비슷");
  });
  it("답하지 않는 질문을 거른다", () => {
    for (const q of ["제가 암인가요", "어떤 주식 살까요", "우리 반 학생이 왜 그럴까", "임용 합격할까요", "암기도 안 되고 자살하고 싶어요", "질병휴직 중인데 수술할까"]) expect(blockedQuestion(q)).not.toBeNull();
    for (const q of ["이번 주 컨디션 어때요", "암기 과목 공부법", "전보를 쓸까요", "병설유치원으로 전보 갈까", "학생부장 맡을까", "대학생활 어떨까", "암사동으로 이사", ""]) expect(blockedQuestion(q)).toBeNull();
  });
});

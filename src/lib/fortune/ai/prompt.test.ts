import { describe, expect, it } from "vitest";
import { AskSchema, buildMessages, buildUserMessage, SYSTEM_PROMPT } from "./prompt";

const today = { y: 2026, m: 11, d: 23 };
const tarot = { kind: "tarot", topic: "work", spread: "three", cards: [{ id: "major-16", reversed: false }, { id: "swords-03", reversed: true }, { id: "major-19", reversed: false }], question: "새 업무 어떻게 시작할까" };
const saju = { kind: "saju", questionId: "money", pillars: { year: 4, month: 53, day: 12, hour: 31 }, question: "" };

describe("AI 풀이 요청", () => {
  it("타로: 뽑은 카드와 판정만 자료에 담는다", () => {
    const r = buildUserMessage(AskSchema.parse(tarot), today);
    if (!("user" in r)) throw new Error("blocked");
    for (const w of ["탑", "소드 3", "역방향", "태양", "과거 자리", "결론:", "새 업무 어떻게 시작할까"]) expect(r.user).toContain(w);
    expect(r.user).not.toMatch(/undefined|NaN/);
  });
  it("사주: 간지와 계산 결과만 담고 생년월일은 받지도 보내지도 않는다", () => {
    const parsed = AskSchema.parse({ ...saju, birth: "1988-05-21", time: "15:20", gender: "M" });
    expect(JSON.stringify(parsed)).not.toMatch(/1988|15:20|gender/);
    const r = buildUserMessage(parsed, today);
    if (!("user" in r)) throw new Error("blocked");
    for (const w of ["戊辰", "丁巳", "丙子", "乙未", "재물운", "결론:", "기본 조언:"]) expect(r.user).toContain(w);
    expect(r.user).not.toMatch(/undefined|NaN|1988/);
  });
  it("시각 모름도 된다", () => {
    const r = buildUserMessage(AskSchema.parse({ ...saju, questionId: "match", other: 3, pillars: { ...saju.pillars, hour: null } }), today);
    expect("user" in r && r.user).toContain("시 모름");
  });
  it("답하지 않는 질문과 연락처를 거른다", () => {
    expect(buildUserMessage(AskSchema.parse({ ...tarot, question: "무슨 주식 살까" }), today)).toHaveProperty("blocked");
    const r = buildUserMessage(AskSchema.parse({ ...tarot, question: "연락처 010-1234-5678 a@b.co 전보 갈까" }), today);
    expect("user" in r && r.user).not.toMatch(/010|a@b/);
  });
  it("잘못된 입력은 거절한다", () => {
    expect(AskSchema.safeParse({ ...tarot, cards: [{ id: "major-99", reversed: false }] }).success).toBe(false);
    expect(AskSchema.safeParse({ ...saju, pillars: { ...saju.pillars, day: 60 } }).success).toBe(false);
    expect(AskSchema.safeParse({ ...tarot, question: "가".repeat(201) }).success).toBe(false);
    expect(buildUserMessage(AskSchema.parse({ ...tarot, cards: tarot.cards.slice(0, 2) }), today)).toHaveProperty("blocked");
    expect(buildUserMessage(AskSchema.parse({ ...tarot, cards: [tarot.cards[0], tarot.cards[0], tarot.cards[2]] }), today)).toHaveProperty("blocked");
  });
  it("궁합: 상대 간지와 판정을 자료에 담는다", () => {
    const r = buildUserMessage(AskSchema.parse({ ...saju, questionId: "match", partner: { year: 7, month: 15, day: 40, hour: null } }), today);
    if (!("user" in r)) throw new Error("blocked");
    for (const w of ["상대 사주 글자", "辛未", "궁합 점수", "궁합 판정", "궁합 근거", "시 모름"]) expect(r.user).toContain(w);
    expect(r.user).not.toMatch(/undefined|NaN/);
  });
  it("자유 질문은 주제 답 없이 사주 전체 자료로 묻는다", () => {
    const r = buildUserMessage(AskSchema.parse({ ...saju, questionId: "free", question: "올해 운전 연수 받아도 될까" }), today);
    if (!("user" in r)) throw new Error("blocked");
    expect(r.user).toContain("자유 질문");
    expect(r.user).not.toContain("결론:");
    expect(r.user).toContain("운전 연수");
  });
  it("이어지는 질문: 대화 순서를 지키고, 같은 규칙으로 거른다", () => {
    const thread = [{ role: "assistant", text: "총평\n첫 풀이" }, { role: "user", text: "그럼 하반기는요?" }];
    const r = buildMessages(AskSchema.parse({ ...saju, thread }), today);
    if (!("messages" in r)) throw new Error("blocked");
    expect(r.messages.map((m) => m.role)).toEqual(["user", "assistant", "user"]);
    expect(r.messages[2].content).toContain("그럼 하반기는요?");
    expect(buildMessages(AskSchema.parse({ ...saju, thread: [thread[0], { role: "user", text: "비트코인 살까" }] }), today)).toHaveProperty("blocked");
    expect(AskSchema.safeParse({ ...saju, thread: [thread[1]] }).success).toBe(false);
    expect(AskSchema.safeParse({ ...saju, thread: [thread[0]] }).success).toBe(false);
    expect(AskSchema.safeParse({ ...saju, thread: Array.from({ length: 6 }, () => thread).flat() }).success).toBe(false);
    expect(AskSchema.safeParse({ ...saju, thread: [thread[0], { role: "user", text: "가".repeat(201) }] }).success).toBe(false);
  });
  it("시스템 프롬프트는 고정 문자열", () => expect(SYSTEM_PROMPT).toContain("자료에 없는 카드"));
});

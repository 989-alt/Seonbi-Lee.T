export const TOPICS = [
  { id: "idea", label: "앱 제안", hint: "이런 게임·도구가 있으면 좋겠어요" },
  { id: "bug", label: "버그 제보", hint: "써 보니 이런 문제가 있어요" },
  { id: "collab", label: "연수·협업", hint: "강의·연수·협업을 제안해요" },
] as const;

export type TopicId = (typeof TOPICS)[number]["id"];

/** 선택한 주제를 제목 앞에 [라벨]로 붙인다 */
export function withTopic(topic: string, subject: string): string {
  const s = subject.trim();
  const t = TOPICS.find((x) => x.id === topic);
  if (!t || s.startsWith(`[${t.label}]`)) return s;
  return `[${t.label}] ${s}`;
}

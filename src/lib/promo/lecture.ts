/** 비바샘 연수 홍보(첫 화면 공지 띠 + 배우기 페이지 카드) */
export const LECTURE = {
  id: "vivasam-t26-016",
  href: "https://t.vivasam.com/courses/job/t26-016",
  provider: "비바샘 원격교육연수원",
  title: "수업을 채우는 동료, 업무를 줄이는 비서 — 바로 쓰는 Claude",
  meta: "15차시 · 1학점",
  summary: "교사가 Claude를 활용하는 방법, 기초 개념부터 바이브 코딩까지",
  lessons: [
    "원리부터 이해하는 Claude",
    "Claude 기본기",
    "커넥터 & Claude Design",
    "Skill 활용과 제작",
    "외부 도구, MCP",
    "하네스의 이해",
    "Cowork 시작",
    "Cowork 채점 파이프라인",
    "바이브 코딩 첫걸음",
    "Claude Code 시작",
    "기획",
    "프론트엔드",
    "백엔드",
    "QA",
    "점진적 공개 하네스 설계",
  ],
} as const;

export type LectureWorld = { name: string; from: number; to: number; tone: "mint" | "violet" | "amber" };
export const LECTURE_WORLDS: LectureWorld[] = [
  { name: "Claude 기본기", from: 1, to: 6, tone: "mint" },
  { name: "Agent", from: 7, to: 8, tone: "violet" },
  { name: "바이브 코딩", from: 9, to: 15, tone: "amber" },
];

export const worldOf = (n: number) => LECTURE_WORLDS.find((w) => n >= w.from && n <= w.to) ?? LECTURE_WORLDS[0];

/** 닫은 공지 띠는 같은 강의에 대해 다시 띄우지 않는다(강의가 바뀌면 다시 보임) */
export const promoKey = () => `bg_promo_closed_${LECTURE.id}`;

export function isPromoClosed(storage: Storage | null): boolean {
  try {
    return storage?.getItem(promoKey()) === "1";
  } catch {
    return false;
  }
}

export function closePromo(storage: Storage | null): void {
  try {
    storage?.setItem(promoKey(), "1");
  } catch {
    /* 저장소 차단: 이번 화면에서만 닫힘 */
  }
}

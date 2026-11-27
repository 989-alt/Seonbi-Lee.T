import type { ProjectRow } from "@/lib/repositories/types";

/**
 * DB(projects 표)에 넣지 않고 코드에 두는 런처 행. 사이트 안 페이지처럼 DB에 쓸 필요가 없는 카드용.
 * slug가 DB에 생기면 DB 행이 이긴다. 'classroom-board'는 DB 시드의 '학급 활동 기록판'이 쓰고 있어 피했다.
 */
export const BUILTIN_ROWS: ProjectRow[] = [
  {
    id: "builtin-classroom-widget",
    slug: "classroom-widget",
    title_ko: "교실 보드",
    title_en: "Classroom Board",
    description: "바탕화면에 캘린더·시간표·급식·D-day를 띄우고, 메신저 쪽지에서 일정을 찾아 주는 선생님용 Windows 프로그램이에요.",
    category: "class",
    accent: "primary",
    version: null,
    tech_stack: [],
    thumbnail_path: "/board/board.webp",
    external_url: "https://s-edu.ai.kr/board",
    status: "published",
    published_at: null,
    created_at: "2026-11-27T00:00:00Z",
    updated_at: "2026-11-27T00:00:00Z",
    featured: true,
    featured_order: 2, // 자리바꾸기(1) 다음, 학급운영 칸 두 번째
    tag: "학급운영",
    grade: "교사용",
    hero_image_path: null,
    partner: null,
    partner_url: null,
    track_slug: null,
    guide: null,
  },
];

export function withBuiltin(rows: ProjectRow[]): ProjectRow[] {
  const taken = new Set(rows.map((r) => r.slug));
  return [...rows, ...BUILTIN_ROWS.filter((r) => !taken.has(r.slug))];
}

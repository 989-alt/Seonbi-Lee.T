export type ProjectCategory = "edutech" | "admin" | "class" | "etc";
export type ProjectAccent = "primary" | "secondary" | "tertiary" | "on-surface";

export interface Project {
  id: string;
  slug: string;
  titleKo: string;
  titleEn?: string;
  description: string;
  category: ProjectCategory;
  accent: ProjectAccent;
  version: string;
  techStack: string[];
  externalUrl?: string;
}

export const CATEGORY_LABEL: Record<ProjectCategory, string> = {
  edutech: "에듀테크",
  admin: "행정업무 경감",
  class: "학급 경영",
  etc: "기타",
};

// DESIGN.md: tertiary(orange) = Educational, secondary(purple) = Creative, primary(cyan) = Business
export const CATEGORY_ACCENT: Record<ProjectCategory, ProjectAccent> = {
  edutech: "tertiary",
  admin: "primary",
  class: "secondary",
  etc: "on-surface",
};

export const PROJECTS: Project[] = [
  {
    id: "p1",
    slug: "grade-manager",
    titleKo: "성적 관리 프로그램",
    titleEn: "Grade Manager",
    description:
      "동적 학기 기간에 따른 가중 평균을 지원하는 성적 관리 시스템. 지역 교육청 API와 연동되며, 관리자 작업 지연을 40% 단축했습니다.",
    category: "admin",
    accent: "primary",
    version: "v1.2",
    techStack: ["TypeScript", "Next.js", "Supabase"],
  },
  {
    id: "p2",
    slug: "art-designer",
    titleKo: "아트 디자인 생성기",
    titleEn: "Art Class Workspace",
    description:
      "초등학생이 시각적 블록을 조합해 절차적으로 생성되는 아트를 탐구할 수 있는 WebGL 기반 실험 도구.",
    category: "edutech",
    accent: "tertiary",
    version: "v0.9 BETA",
    techStack: ["React", "WebGL", "Three.js"],
  },
  {
    id: "p3",
    slug: "telegram-blog-pipeline",
    titleKo: "텔레그램 → 블로그 자동화",
    titleEn: "Telegram Blog Pipeline",
    description:
      "텔레그램 메시지를 받아 멀티에이전트로 가공한 뒤 Blogger·티스토리에 자동 포스팅하는 n8n 파이프라인.",
    category: "admin",
    accent: "primary",
    version: "v2.0",
    techStack: ["n8n", "Telegram API", "Blogger"],
  },
  {
    id: "p4",
    slug: "quiz-generator",
    titleKo: "퀴즈 제너레이터",
    titleEn: "Quiz Generator",
    description:
      "학습자 수준을 실시간 추정해 문항을 생성·출제하는 하이브리드 아키텍처. GitHub Pages와 Render 백엔드로 배포.",
    category: "edutech",
    accent: "tertiary",
    version: "v2.0",
    techStack: ["React", "Render", "Claude API"],
  },
  {
    id: "p5",
    slug: "wedding-invitation",
    titleKo: "모바일 청첩장",
    titleEn: "Wedding Invitation",
    description:
      "모바일 퍼스트로 설계한 청첩장 웹앱. 13개 섹션, Next.js 16, Supabase 연동.",
    category: "etc",
    accent: "on-surface",
    version: "v1.0",
    techStack: ["Next.js", "Supabase"],
  },
  {
    id: "p6",
    slug: "cosmic-edu",
    titleKo: "코스믹 에듀",
    titleEn: "Cosmic Edu",
    description:
      "천문 교육을 위한 WebGL 시뮬레이터. 달의 위상, 행성 공전, 빛의 전파 등을 인터랙티브하게 제공.",
    category: "edutech",
    accent: "tertiary",
    version: "v0.5",
    techStack: ["React", "Three.js", "WebGL"],
  },
];

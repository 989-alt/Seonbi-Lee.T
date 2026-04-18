export type PostAccent = "primary" | "secondary" | "tertiary";

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO format
  tags: string[];
  accent: PostAccent;
}

export const POSTS: Post[] = [
  {
    id: "n1",
    slug: "ai-dap-master",
    title: "AIEDAP 마스터 교원 연수 기록",
    excerpt:
      "2025년 AIEDAP 마스터 교원으로 참여하며 학습한 생성형 AI 활용 수업 설계 프레임워크와 적용 사례를 정리했습니다.",
    date: "2026-03-14",
    tags: ["AIEDAP", "수업설계"],
    accent: "primary",
  },
  {
    id: "n2",
    slug: "claude-code-for-teacher",
    title: "교사를 위한 Claude Code 활용법",
    excerpt:
      "수업 자료 자동 생성, 학생 과제 분석, 학급 행정 업무 자동화까지. 현장 교사 관점에서 Claude Code를 어떻게 활용할 수 있는지 10가지 사례를 소개합니다.",
    date: "2026-02-28",
    tags: ["Claude", "교사"],
    accent: "secondary",
  },
  {
    id: "n3",
    slug: "n8n-workflow-for-school",
    title: "학교 업무를 n8n으로 자동화하기",
    excerpt:
      "구글 설문, 스프레드시트, 텔레그램을 n8n으로 연결해 반복되는 학교 업무 여러 건을 자동화한 경험과 Oracle Cloud 배포 노하우.",
    date: "2026-01-17",
    tags: ["n8n", "자동화"],
    accent: "tertiary",
  },
];

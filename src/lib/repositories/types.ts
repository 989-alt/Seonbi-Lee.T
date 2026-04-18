export type ProjectCategory = "edutech" | "admin" | "class" | "etc";
export type Accent = "primary" | "secondary" | "tertiary" | "on-surface";
export type ProjectStatus = "draft" | "published" | "archived";
export type PostAccent = "primary" | "secondary" | "tertiary";
export type PostStatus = "draft" | "published";

export interface ProjectRow {
  id: string;
  slug: string;
  title_ko: string;
  title_en: string | null;
  description: string;
  category: ProjectCategory;
  accent: Accent;
  version: string | null;
  tech_stack: string[];
  thumbnail_path: string | null;
  external_url: string | null;
  status: ProjectStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content_md: string;
  accent: PostAccent;
  tags: string[];
  hero_image_path: string | null;
  status: PostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export const CATEGORY_LABEL: Record<ProjectCategory, string> = {
  edutech: "에듀테크",
  admin: "행정업무 경감",
  class: "학급 경영",
  etc: "기타",
};

export const CATEGORY_ACCENT: Record<ProjectCategory, Accent> = {
  edutech: "tertiary",
  admin: "primary",
  class: "secondary",
  etc: "on-surface",
};

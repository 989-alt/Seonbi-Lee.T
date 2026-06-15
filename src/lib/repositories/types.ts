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

export type ResourceAccent = "primary" | "secondary" | "tertiary";
export type ResourceStatus = "draft" | "published";
export type ResourceLinkKind = "link" | "download";
export type ResourceLevel = "entry" | "basic" | "applied" | "advanced";
export type ResourceKind = "lesson" | "gallery";

export interface ResourceLink {
  label: string;
  url: string;
  kind: ResourceLinkKind;
}

export interface ResourcePrompt {
  label: string;
  text: string;
}

export interface ResourceRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  accent: ResourceAccent;
  links: ResourceLink[];
  prompts: ResourcePrompt[];
  tags: string[];
  status: ResourceStatus;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  level: ResourceLevel | null;
  body_md: string;
  kind: ResourceKind;
}

export const LEVEL_LABEL: Record<ResourceLevel, string> = {
  entry: "입문",
  basic: "기초",
  applied: "실무",
  advanced: "심화",
};
export const LEVEL_ORDER: ResourceLevel[] = ["entry", "basic", "applied", "advanced"];
export const LEVEL_TAG: Record<ResourceLevel, string> = {
  entry: "01 / ENTRY",
  basic: "02 / BASIC",
  applied: "03 / APPLIED",
  advanced: "04 / ADVANCED",
};

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

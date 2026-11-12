import { assetUrl } from "@/lib/launcher/assets";
import { unstable_cache } from "next/cache";
import { createSupabasePublicClient, createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProjectRow } from "./types";

export async function listPublishedProjects(): Promise<ProjectRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[projects] listPublished error:", error);
    return [];
  }
  return (data ?? []) as ProjectRow[];
}

export async function listAllProjects(): Promise<ProjectRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[projects] listAll error:", error);
    return [];
  }
  return (data ?? []) as ProjectRow[];
}

export async function getProjectById(id: string): Promise<ProjectRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[projects] getById error:", error);
    return null;
  }
  return (data as ProjectRow) ?? null;
}

export function publicThumbnailUrl(path: string | null): string | null {
  return assetUrl(path, process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export const PROJECTS_TAG = "projects";

/**
 * 런처용: 공개된 STAGE 1~3 앱 (기타 분류 제외).
 * 공개 자료라 쿠키 없는 anon 클라이언트로 읽고 60초 캐시한다.
 * 관리자가 프로젝트를 바꾸면 updateTag(PROJECTS_TAG)로 즉시 갱신된다.
 */
export const listLauncherRows = unstable_cache(fetchLauncherRows, ["launcher-rows"], {
  tags: [PROJECTS_TAG],
  revalidate: 60,
});

async function fetchLauncherRows(): Promise<ProjectRow[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("status", "published")
    .neq("category", "etc");

  if (error) {
    console.error("[projects] listLauncherRows error:", error);
    return [];
  }
  return (data ?? []) as ProjectRow[];
}

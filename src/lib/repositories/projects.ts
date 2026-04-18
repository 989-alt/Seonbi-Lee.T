import { createSupabaseServerClient } from "@/lib/supabase/server";
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
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/project-thumbs/${path}`;
}

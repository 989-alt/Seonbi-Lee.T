import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PostRow } from "./types";

export async function listPublishedPosts(): Promise<PostRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[posts] listPublished error:", error);
    return [];
  }
  return (data ?? []) as PostRow[];
}

export async function listAllPosts(): Promise<PostRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[posts] listAll error:", error);
    return [];
  }
  return (data ?? []) as PostRow[];
}

export async function getPostById(id: string): Promise<PostRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[posts] getById error:", error);
    return null;
  }
  return (data as PostRow) ?? null;
}

export function publicHeroUrl(path: string | null): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/post-heroes/${path}`;
}

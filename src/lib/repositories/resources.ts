import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ResourceRow } from "./types";

export async function listPublishedResources(): Promise<ResourceRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[resources] listPublished error:", error);
    return [];
  }
  return (data ?? []) as ResourceRow[];
}

export async function listAllResources(): Promise<ResourceRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[resources] listAll error:", error);
    return [];
  }
  return (data ?? []) as ResourceRow[];
}

export async function getResourceById(id: string): Promise<ResourceRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[resources] getById error:", error);
    return null;
  }
  return (data as ResourceRow) ?? null;
}

export async function listPublishedLessons(): Promise<ResourceRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("status", "published")
    .eq("kind", "lesson")
    .is("course_slug", null)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[resources] listPublishedLessons error:", error);
    return [];
  }
  return (data ?? []) as ResourceRow[];
}

export async function listPublishedGallery(): Promise<ResourceRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("status", "published")
    .eq("kind", "gallery")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[resources] listPublishedGallery error:", error);
    return [];
  }
  return (data ?? []) as ResourceRow[];
}

export async function listAllResourcesByCourse(slug: string): Promise<ResourceRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("course_slug", slug)
    .order("kind", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[resources] listAllResourcesByCourse error:", error);
    return [];
  }
  return (data ?? []) as ResourceRow[];
}

export async function listPublishedResourcesByCourse(slug: string): Promise<ResourceRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("status", "published")
    .eq("course_slug", slug)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[resources] listPublishedResourcesByCourse error:", error);
    return [];
  }
  return (data ?? []) as ResourceRow[];
}

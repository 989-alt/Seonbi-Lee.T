import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CourseRow } from "./types";

export async function listPublishedCourses(): Promise<CourseRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[courses] listPublished error:", error);
    return [];
  }
  return (data ?? []) as CourseRow[];
}

export async function listAllCourses(): Promise<CourseRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[courses] listAll error:", error);
    return [];
  }
  return (data ?? []) as CourseRow[];
}

export async function getCourseBySlug(slug: string): Promise<CourseRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[courses] getBySlug error:", error);
    return null;
  }
  return (data as CourseRow) ?? null;
}

export async function getCourseById(id: string): Promise<CourseRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[courses] getById error:", error);
    return null;
  }
  return (data as CourseRow) ?? null;
}

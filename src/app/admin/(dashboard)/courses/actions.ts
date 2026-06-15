"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/auth";
import { uniqueSlug } from "@/lib/slug";

const CourseSchema = z.object({
  slug: z.string().trim().max(80).optional(),
  title: z.string().trim().min(1, "제목은 필수입니다.").max(160),
  description: z.string().trim().max(600).default(""),
  accent: z.enum(["primary", "secondary", "tertiary"]),
  sort_order: z.coerce.number().int().default(0),
  status: z.enum(["draft", "published"]).default("draft"),
});

type State = { error: string | null };

async function assertAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function createCourseAction(
  _prev: State | undefined,
  formData: FormData
): Promise<State> {
  await assertAdmin();

  const parsed = CourseSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값 확인" };
  }

  const supabase = await createSupabaseServerClient();
  const now = new Date().toISOString();

  const slug = await uniqueSlug(
    parsed.data.slug || parsed.data.title,
    async (c) => {
      const { data } = await supabase.from("courses").select("id").eq("slug", c).maybeSingle();
      return !!data;
    },
    "course",
  );

  const { error } = await supabase.from("courses").insert({
    slug,
    title: parsed.data.title,
    description: parsed.data.description,
    accent: parsed.data.accent,
    sort_order: parsed.data.sort_order,
    status: parsed.data.status,
    published_at: parsed.data.status === "published" ? now : null,
  });

  if (error) return { error: `저장 실패: ${error.message}` };

  revalidatePath("/admin/courses");
  revalidatePath("/learn");
  revalidatePath("/learn", "layout");
  redirect("/admin/courses");
}

export async function updateCourseAction(
  id: string,
  _prev: State | undefined,
  formData: FormData
): Promise<State> {
  await assertAdmin();

  const parsed = CourseSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값 확인" };
  }

  const supabase = await createSupabaseServerClient();
  const now = new Date().toISOString();

  const slug = await uniqueSlug(
    parsed.data.slug || parsed.data.title,
    async (c) => {
      const { data } = await supabase.from("courses").select("id").eq("slug", c).neq("id", id).maybeSingle();
      return !!data;
    },
    "course",
  );

  const updatePayload: Record<string, unknown> = {
    slug,
    title: parsed.data.title,
    description: parsed.data.description,
    accent: parsed.data.accent,
    sort_order: parsed.data.sort_order,
    status: parsed.data.status,
    updated_at: now,
  };

  if (parsed.data.status === "published") {
    const { data: cur } = await supabase
      .from("courses")
      .select("published_at")
      .eq("id", id)
      .maybeSingle();
    if (!cur?.published_at) updatePayload.published_at = now;
  }

  const { error } = await supabase.from("courses").update(updatePayload).eq("id", id);
  if (error) return { error: `저장 실패: ${error.message}` };

  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${id}`);
  revalidatePath("/learn");
  revalidatePath("/learn", "layout");
  redirect("/admin/courses");
}

export async function deleteCourseAction(id: string) {
  await assertAdmin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/courses");
  revalidatePath("/learn");
  revalidatePath("/learn", "layout");
  redirect("/admin/courses");
}

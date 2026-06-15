"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/auth";
import { uniqueSlug } from "@/lib/slug";

const PostSchema = z.object({
  slug: z.string().trim().max(80).optional(),
  title: z.string().trim().min(1, "제목은 필수입니다.").max(160),
  excerpt: z.string().trim().min(1, "요약은 필수입니다.").max(400),
  content_md: z.string().default(""),
  accent: z.enum(["primary", "secondary", "tertiary"]),
  tags: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
});

async function assertAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}

function parseTags(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function uploadHero(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error("히어로 이미지는 5MB 이하여야 합니다.");
  }
  const admin = createSupabaseAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const key = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const buffer = await file.arrayBuffer();
  const { error } = await admin.storage
    .from("post-heroes")
    .upload(key, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (error) {
    throw new Error(`히어로 업로드 실패: ${error.message}`);
  }
  return key;
}

export async function createPostAction(
  _prev: { error: string | null } | undefined,
  formData: FormData
): Promise<{ error: string | null }> {
  await assertAdmin();

  const parsed = PostSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값 확인" };
  }

  let heroPath: string | null = null;
  try {
    const file = formData.get("hero") as File | null;
    heroPath = await uploadHero(file);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "업로드 오류" };
  }

  const supabase = await createSupabaseServerClient();
  const now = new Date().toISOString();

  const slug = await uniqueSlug(
    parsed.data.slug || parsed.data.title,
    async (c) => {
      const { data } = await supabase.from("posts").select("id").eq("slug", c).maybeSingle();
      return !!data;
    },
    "post",
  );

  const { error } = await supabase.from("posts").insert({
    slug,
    title: parsed.data.title,
    excerpt: parsed.data.excerpt,
    content_md: parsed.data.content_md,
    accent: parsed.data.accent,
    tags: parseTags(parsed.data.tags),
    hero_image_path: heroPath,
    status: parsed.data.status,
    published_at: parsed.data.status === "published" ? now : null,
  });

  if (error) {
    return { error: `저장 실패: ${error.message}` };
  }

  revalidatePath("/admin/posts");
  revalidatePath("/news");
  revalidatePath("/");
  redirect("/admin/posts");
}

export async function updatePostAction(
  id: string,
  _prev: { error: string | null } | undefined,
  formData: FormData
): Promise<{ error: string | null }> {
  await assertAdmin();

  const parsed = PostSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값 확인" };
  }

  let heroPath: string | null | undefined = undefined;
  try {
    const file = formData.get("hero") as File | null;
    const uploaded = await uploadHero(file);
    if (uploaded) heroPath = uploaded;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "업로드 오류" };
  }

  const supabase = await createSupabaseServerClient();
  const now = new Date().toISOString();

  const slug = await uniqueSlug(
    parsed.data.slug || parsed.data.title,
    async (c) => {
      const { data } = await supabase.from("posts").select("id").eq("slug", c).neq("id", id).maybeSingle();
      return !!data;
    },
    "post",
  );

  const updatePayload: Record<string, unknown> = {
    slug,
    title: parsed.data.title,
    excerpt: parsed.data.excerpt,
    content_md: parsed.data.content_md,
    accent: parsed.data.accent,
    tags: parseTags(parsed.data.tags),
    status: parsed.data.status,
    updated_at: now,
  };
  if (heroPath) updatePayload.hero_image_path = heroPath;

  if (parsed.data.status === "published") {
    const { data: cur } = await supabase
      .from("posts")
      .select("published_at")
      .eq("id", id)
      .maybeSingle();
    if (!cur?.published_at) updatePayload.published_at = now;
  }

  const { error } = await supabase.from("posts").update(updatePayload).eq("id", id);
  if (error) {
    return { error: `저장 실패: ${error.message}` };
  }

  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${id}`);
  revalidatePath("/news");
  revalidatePath("/");
  redirect("/admin/posts");
}

export async function deletePostAction(id: string) {
  await assertAdmin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/posts");
  revalidatePath("/news");
  revalidatePath("/");
  redirect("/admin/posts");
}

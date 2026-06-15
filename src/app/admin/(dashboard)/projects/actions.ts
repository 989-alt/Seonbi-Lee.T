"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/auth";
import { uniqueSlug } from "@/lib/slug";

const ProjectSchema = z.object({
  slug: z.string().trim().max(80).optional(),
  title_ko: z.string().trim().min(1, "한글 제목은 필수입니다.").max(120),
  title_en: z
    .string()
    .trim()
    .max(120)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  description: z.string().trim().min(1, "설명은 필수입니다.").max(1000),
  category: z.enum(["edutech", "admin", "class", "etc"]),
  accent: z.enum(["primary", "secondary", "tertiary", "on-surface"]),
  version: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  tech_stack: z.string().optional(), // comma-separated
  external_url: z
    .string()
    .trim()
    .url("유효한 URL을 입력하세요.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

async function assertAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}

function parseTech(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function uploadThumbnail(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error("썸네일 파일 크기는 5MB 이하여야 합니다.");
  }

  const admin = createSupabaseAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const key = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const buffer = await file.arrayBuffer();
  const { error } = await admin.storage
    .from("project-thumbs")
    .upload(key, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw new Error(`썸네일 업로드 실패: ${error.message}`);
  }
  return key;
}

export async function createProjectAction(
  _prev: { error: string | null } | undefined,
  formData: FormData
): Promise<{ error: string | null }> {
  await assertAdmin();

  const parsed = ProjectSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값 확인" };
  }

  let thumbnailPath: string | null = null;
  try {
    const file = formData.get("thumbnail") as File | null;
    thumbnailPath = await uploadThumbnail(file);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "업로드 오류" };
  }

  const supabase = await createSupabaseServerClient();
  const now = new Date().toISOString();

  const slug = await uniqueSlug(
    parsed.data.slug || parsed.data.title_ko,
    async (c) => {
      const { data } = await supabase.from("projects").select("id").eq("slug", c).maybeSingle();
      return !!data;
    },
    "proj",
  );

  const { error } = await supabase.from("projects").insert({
    slug,
    title_ko: parsed.data.title_ko,
    title_en: parsed.data.title_en ?? null,
    description: parsed.data.description,
    category: parsed.data.category,
    accent: parsed.data.accent,
    version: parsed.data.version ?? null,
    tech_stack: parseTech(parsed.data.tech_stack),
    external_url: parsed.data.external_url ?? null,
    thumbnail_path: thumbnailPath,
    status: parsed.data.status,
    published_at: parsed.data.status === "published" ? now : null,
  });

  if (error) {
    return { error: `저장 실패: ${error.message}` };
  }

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
  redirect("/admin/projects");
}

export async function updateProjectAction(
  id: string,
  _prev: { error: string | null } | undefined,
  formData: FormData
): Promise<{ error: string | null }> {
  await assertAdmin();

  const parsed = ProjectSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값 확인" };
  }

  let thumbnailPath: string | null | undefined = undefined;
  try {
    const file = formData.get("thumbnail") as File | null;
    const uploaded = await uploadThumbnail(file);
    if (uploaded) thumbnailPath = uploaded;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "업로드 오류" };
  }

  const supabase = await createSupabaseServerClient();
  const now = new Date().toISOString();

  const slug = await uniqueSlug(
    parsed.data.slug || parsed.data.title_ko,
    async (c) => {
      const { data } = await supabase.from("projects").select("id").eq("slug", c).neq("id", id).maybeSingle();
      return !!data;
    },
    "proj",
  );

  const updatePayload: Record<string, unknown> = {
    slug,
    title_ko: parsed.data.title_ko,
    title_en: parsed.data.title_en ?? null,
    description: parsed.data.description,
    category: parsed.data.category,
    accent: parsed.data.accent,
    version: parsed.data.version ?? null,
    tech_stack: parseTech(parsed.data.tech_stack),
    external_url: parsed.data.external_url ?? null,
    status: parsed.data.status,
    updated_at: now,
  };

  if (thumbnailPath) updatePayload.thumbnail_path = thumbnailPath;

  // Transition to published → set published_at if not set
  if (parsed.data.status === "published") {
    const { data: cur } = await supabase
      .from("projects")
      .select("published_at")
      .eq("id", id)
      .maybeSingle();
    if (!cur?.published_at) updatePayload.published_at = now;
  }

  const { error } = await supabase.from("projects").update(updatePayload).eq("id", id);
  if (error) {
    return { error: `저장 실패: ${error.message}` };
  }

  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${id}`);
  revalidatePath("/projects");
  revalidatePath("/");
  redirect("/admin/projects");
}

export async function deleteProjectAction(id: string) {
  await assertAdmin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
  redirect("/admin/projects");
}

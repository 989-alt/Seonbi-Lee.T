"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/auth";

const LinkSchema = z.object({
  label: z.string().trim().min(1).max(120),
  url: z.string().trim().url("올바른 URL이 아닙니다.").max(1000),
  kind: z.enum(["link", "download"]).default("link"),
});

const PromptSchema = z.object({
  label: z.string().trim().max(120).default(""),
  text: z.string().trim().min(1).max(20000),
});

const ResourceSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "slug는 필수입니다.")
    .max(80)
    .regex(/^[a-z0-9-]+$/, "영문 소문자, 숫자, 하이픈(-)만 사용 가능합니다."),
  title: z.string().trim().min(1, "제목은 필수입니다.").max(160),
  description: z.string().trim().max(600).default(""),
  accent: z.enum(["primary", "secondary", "tertiary"]),
  tags: z.string().optional(),
  sort_order: z.coerce.number().int().default(0),
  status: z.enum(["draft", "published"]).default("draft"),
});

type State = { error: string | null };

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

function parseJsonField<T>(
  raw: FormDataEntryValue | null,
  schema: z.ZodType<T>
): { ok: true; value: T[] } | { ok: false; error: string } {
  if (raw == null || raw === "") return { ok: true, value: [] };
  let parsed: unknown;
  try {
    parsed = JSON.parse(String(raw));
  } catch {
    return { ok: false, error: "항목 형식이 올바르지 않습니다." };
  }
  const arr = z.array(schema).safeParse(parsed);
  if (!arr.success) {
    return { ok: false, error: arr.error.issues[0]?.message ?? "항목 검증 실패" };
  }
  return { ok: true, value: arr.data };
}

function buildPayload(formData: FormData):
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; error: string } {
  const parsed = ResourceSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값 확인" };
  }

  const links = parseJsonField(formData.get("links_json"), LinkSchema);
  if (!links.ok) return { ok: false, error: `링크: ${links.error}` };

  const prompts = parseJsonField(formData.get("prompts_json"), PromptSchema);
  if (!prompts.ok) return { ok: false, error: `프롬프트: ${prompts.error}` };

  return {
    ok: true,
    data: {
      slug: parsed.data.slug,
      title: parsed.data.title,
      description: parsed.data.description,
      accent: parsed.data.accent,
      tags: parseTags(parsed.data.tags),
      sort_order: parsed.data.sort_order,
      status: parsed.data.status,
      links: links.value,
      prompts: prompts.value,
    },
  };
}

export async function createResourceAction(
  _prev: State | undefined,
  formData: FormData
): Promise<State> {
  await assertAdmin();

  const built = buildPayload(formData);
  if (!built.ok) return { error: built.error };

  const supabase = await createSupabaseServerClient();
  const now = new Date().toISOString();

  const { error } = await supabase.from("resources").insert({
    ...built.data,
    published_at: built.data.status === "published" ? now : null,
  });

  if (error) return { error: `저장 실패: ${error.message}` };

  revalidatePath("/admin/resources");
  revalidatePath("/resources");
  revalidatePath("/");
  redirect("/admin/resources");
}

export async function updateResourceAction(
  id: string,
  _prev: State | undefined,
  formData: FormData
): Promise<State> {
  await assertAdmin();

  const built = buildPayload(formData);
  if (!built.ok) return { error: built.error };

  const supabase = await createSupabaseServerClient();
  const now = new Date().toISOString();

  const updatePayload: Record<string, unknown> = {
    ...built.data,
    updated_at: now,
  };

  if (built.data.status === "published") {
    const { data: cur } = await supabase
      .from("resources")
      .select("published_at")
      .eq("id", id)
      .maybeSingle();
    if (!cur?.published_at) updatePayload.published_at = now;
  }

  const { error } = await supabase
    .from("resources")
    .update(updatePayload)
    .eq("id", id);
  if (error) return { error: `저장 실패: ${error.message}` };

  revalidatePath("/admin/resources");
  revalidatePath(`/admin/resources/${id}`);
  revalidatePath("/resources");
  revalidatePath("/");
  redirect("/admin/resources");
}

export async function deleteResourceAction(id: string) {
  await assertAdmin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("resources").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/resources");
  revalidatePath("/resources");
  revalidatePath("/");
  redirect("/admin/resources");
}

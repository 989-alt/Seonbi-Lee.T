"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/auth";
import { logAdminEvent } from "@/lib/audit";

async function assertAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}

export type EnrollState =
  | { step: "idle"; error: string | null }
  | { step: "scan"; factorId: string; qr: string; secret: string; error: string | null };

/** TOTP 등록 시작: 남아 있는 미완료 등록을 지우고 QR을 만든다. */
export async function startEnrollAction(): Promise<EnrollState> {
  await assertAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: list } = await supabase.auth.mfa.listFactors();
  for (const f of list?.all ?? []) {
    if (f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
  }
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: `admin-${Date.now()}`,
  });
  if (error || !data) return { step: "idle", error: `등록을 시작하지 못했습니다: ${error?.message ?? "unknown"}` };
  return { step: "scan", factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret, error: null };
}

export async function confirmEnrollAction(prev: EnrollState, formData: FormData): Promise<EnrollState> {
  const user = await assertAdmin();
  if (prev.step !== "scan") return prev;
  const code = String(formData.get("code") ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return { ...prev, error: "6자리 숫자를 입력해 주세요." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: prev.factorId, code });
  if (error) return { ...prev, error: "인증 코드가 올바르지 않습니다. 앱의 새 숫자로 다시 시도하세요." };
  await logAdminEvent("mfa_enrolled", { email: user.email, userId: user.id });
  revalidatePath("/admin/security");
  redirect("/admin/security?enrolled=1");
}

export async function removeFactorAction(factorId: string) {
  const user = await assertAdmin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) throw new Error(error.message);
  await logAdminEvent("mfa_removed", { email: user.email, userId: user.id });
  revalidatePath("/admin/security");
}

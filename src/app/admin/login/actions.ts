"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { checkRateLimit } from "@/lib/rateLimit";
import { logAdminEvent, requestIp } from "@/lib/audit";
import { needsMfa } from "@/lib/auth";
import { safeAdminRedirect } from "@/lib/safeRedirect";

// 로그인 실패 제한: IP·계정별 15분에 5회
const LOGIN_LIMIT = { max: 5, windowMs: 15 * 60 * 1000 };
const GENERIC_ERROR = "이메일 또는 비밀번호가 올바르지 않습니다.";

export async function loginAction(
  _prev: { error: string | null } | undefined,
  formData: FormData
): Promise<{ error: string | null }> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeAdminRedirect(formData.get("redirect"));

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 모두 입력해 주세요." };
  }

  const ip = await requestIp();
  const byIp = checkRateLimit(`login:ip:${ip}`, LOGIN_LIMIT);
  const byEmail = checkRateLimit(`login:email:${email}`, LOGIN_LIMIT);
  if (!byIp.ok || !byEmail.ok) {
    await logAdminEvent("login_blocked", { email });
    const wait = Math.max(byIp.retryAfterSec ?? 0, byEmail.retryAfterSec ?? 0);
    return { error: `로그인 시도가 너무 많습니다. ${Math.ceil(wait / 60)}분 뒤 다시 시도해 주세요.` };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    await logAdminEvent("login_failed", { email, detail: error?.message });
    return { error: GENERIC_ERROR };
  }

  // Verify admin_users membership
  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!adminRow) {
    await logAdminEvent("login_not_admin", { email, userId: data.user.id });
    await supabase.auth.signOut();
    return { error: "관리자 권한이 없는 계정입니다." };
  }

  if (await needsMfa(supabase)) {
    await logAdminEvent("login_success", { email, userId: data.user.id, detail: "password ok, 2FA pending" });
    redirect(`/admin/login/mfa?redirect=${encodeURIComponent(redirectTo)}`);
  }

  await logAdminEvent("login_success", { email, userId: data.user.id });
  redirect(redirectTo);
}

export async function verifyMfaLoginAction(
  _prev: { error: string | null } | undefined,
  formData: FormData
): Promise<{ error: string | null }> {
  const code = String(formData.get("code") ?? "").replace(/\s/g, "");
  const redirectTo = safeAdminRedirect(formData.get("redirect"));
  if (!/^\d{6}$/.test(code)) return { error: "인증 앱의 6자리 숫자를 입력해 주세요." };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const ip = await requestIp();
  const rl = checkRateLimit(`mfa:${user.id}:${ip}`, LOGIN_LIMIT);
  if (!rl.ok) {
    await logAdminEvent("login_blocked", { email: user.email, userId: user.id, detail: "2FA" });
    return { error: "시도가 너무 많습니다. 잠시 뒤 다시 시도해 주세요." };
  }

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const factor = factors?.totp?.find((f) => f.status === "verified");
  if (!factor) redirect(redirectTo);

  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
  if (error) {
    await logAdminEvent("mfa_failed", { email: user.email, userId: user.id });
    return { error: "인증 코드가 올바르지 않습니다." };
  }
  await logAdminEvent("mfa_verified", { email: user.email, userId: user.id });
  redirect(redirectTo);
}

export async function cancelMfaLoginAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

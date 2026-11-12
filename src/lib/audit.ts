import "server-only";
import { headers } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type AuditAction =
  | "login_success"
  | "login_failed"
  | "login_blocked"
  | "login_not_admin"
  | "mfa_verified"
  | "mfa_failed"
  | "mfa_enrolled"
  | "mfa_removed"
  | "logout"
  | "idle_logout";

/** 요청 헤더에서 클라이언트 IP를 꺼낸다. */
export async function requestIp(): Promise<string> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

/**
 * 관리자 접속·권한 변경 기록(admin_audit_log, 1년 보관).
 * 기록 실패가 로그인 자체를 막지 않도록 예외를 삼킨다.
 */
export async function logAdminEvent(action: AuditAction, opts: { email?: string | null; userId?: string | null; detail?: string } = {}) {
  try {
    const h = await headers();
    const { error } = await createSupabaseAdminClient()
      .from("admin_audit_log")
      .insert({
        action,
        email: opts.email ?? null,
        user_id: opts.userId ?? null,
        ip: await requestIp(),
        user_agent: (h.get("user-agent") ?? "").slice(0, 300),
        detail: opts.detail?.slice(0, 500) ?? null,
      });
    if (error) console.error("[audit] insert error:", error.message);
  } catch (e) {
    console.error("[audit] failed:", e);
  }
}

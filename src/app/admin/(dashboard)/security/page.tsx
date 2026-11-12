import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { EnrollTotp } from "./EnrollTotp";
import { removeFactorAction } from "./actions";
import { getAdminUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "보안 설정 // 관리자" };

type AuditRow = { created_at: string; action: string; ip: string | null; user_agent: string | null; detail: string | null };

async function recentAudit(): Promise<AuditRow[] | null> {
  try {
    const { data, error } = await createSupabaseAdminClient()
      .from("admin_audit_log")
      .select("created_at, action, ip, user_agent, detail")
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) return null;
    return data as AuditRow[];
  } catch {
    return null;
  }
}

export default async function SecurityPage({ searchParams }: { searchParams: Promise<{ enrolled?: string }> }) {
  if (!(await getAdminUser())) redirect("/admin/login");
  const supabase = await createSupabaseServerClient();
  const [{ data: factors }, audit, sp] = await Promise.all([supabase.auth.mfa.listFactors(), recentAudit(), searchParams]);
  const verified = factors?.totp?.filter((f) => f.status === "verified") ?? [];

  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h1 className="font-[family-name:var(--font-headline)] text-2xl font-bold text-on-surface">2단계 인증</h1>
        {sp.enrolled && <p className="text-sm text-primary">등록했습니다. 다음 로그인부터 인증 코드를 묻습니다.</p>}
        {verified.length > 0 ? (
          <ul className="space-y-2">
            {verified.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-4 border border-outline-variant p-3 text-sm">
                <span className="text-on-surface">인증 앱 (TOTP) · 등록일 {new Date(f.created_at).toLocaleDateString("ko-KR")}</span>
                <form action={removeFactorAction.bind(null, f.id)}>
                  <button type="submit" className="min-h-[44px] text-error hover:underline">해제</button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <p className="text-sm text-on-surface-variant">
              아직 등록하지 않았습니다. 등록하면 로그인할 때 비밀번호와 함께 인증 앱의 6자리 숫자를 입력합니다.
            </p>
            <EnrollTotp />
          </>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-headline)] text-xl font-bold text-on-surface">최근 접속 기록 (최근 30건, 1년 보관)</h2>
        {audit === null ? (
          <p className="text-sm text-error">접속 기록 테이블(admin_audit_log)이 아직 없습니다. 마이그레이션을 적용해 주세요.</p>
        ) : audit.length === 0 ? (
          <p className="text-sm text-on-surface-variant">기록이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-on-surface-variant">
                <tr><th className="p-2">일시</th><th className="p-2">작업</th><th className="p-2">IP</th><th className="p-2">브라우저</th></tr>
              </thead>
              <tbody>
                {audit.map((r, i) => (
                  <tr key={i} className="border-t border-outline-variant text-on-surface">
                    <td className="p-2 whitespace-nowrap">{new Date(r.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</td>
                    <td className="p-2">{r.action}{r.detail ? ` · ${r.detail}` : ""}</td>
                    <td className="p-2">{r.ip}</td>
                    <td className="p-2 max-w-[260px] truncate" title={r.user_agent ?? ""}>{r.user_agent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

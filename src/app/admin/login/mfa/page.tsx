import { MfaLoginForm } from "./MfaLoginForm";
import { safeAdminRedirect } from "@/lib/safeRedirect";

export const metadata = { title: "2단계 인증 // 방구석게이머", robots: { index: false } };

export default async function MfaLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <main className="flex-grow flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md bg-surface-container-low p-8 md:p-10 relative">
        <div aria-hidden="true" className="absolute top-0 left-0 w-[2px] h-full bg-primary" />
        <div className="mb-8">
          <div className="font-[family-name:var(--font-label)] text-[10px] text-primary tracking-[0.3em] uppercase mb-2">
            // SYS_AUTH · 2FA
          </div>
          <h1 className="font-[family-name:var(--font-headline)] text-2xl font-bold text-on-surface uppercase tracking-tight">
            2단계 인증
          </h1>
          <p className="font-[family-name:var(--font-body)] text-sm text-on-surface-variant mt-2">
            인증 앱(Google Authenticator 등)에 표시된 6자리 숫자를 입력하세요.
          </p>
        </div>
        <MfaLoginForm redirectTo={safeAdminRedirect(redirect)} />
      </div>
    </main>
  );
}

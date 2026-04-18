import { LoginForm } from "./LoginForm";

export const metadata = { title: "관리자 로그인 // SEONBI'S LAB" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect = "/admin" } = await searchParams;

  return (
    <main className="flex-grow flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md bg-surface-container-low p-8 md:p-10 relative">
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 w-[2px] h-full bg-primary"
        />
        <div className="mb-8">
          <div className="font-[family-name:var(--font-label)] text-[10px] text-primary tracking-[0.3em] uppercase mb-2">
            // SYS_AUTH
          </div>
          <h1 className="font-[family-name:var(--font-headline)] text-2xl font-bold text-on-surface uppercase tracking-tight">
            관리자 로그인
          </h1>
          <p className="font-[family-name:var(--font-body)] text-sm text-on-surface-variant mt-2">
            Supabase Auth 세션으로 보호된 구역입니다.
          </p>
        </div>

        <LoginForm redirectTo={redirect} />
      </div>
    </main>
  );
}

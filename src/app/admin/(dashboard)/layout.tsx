import Link from "next/link";
import { logoutAction } from "../actions";
import { getAdminUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="flex-grow flex flex-col pt-24">
      <div className="w-full bg-surface-container-high py-3 px-6 flex items-center justify-between text-[10px] font-[family-name:var(--font-label)] uppercase tracking-widest border-b border-surface-container-highest">
        <div className="flex items-center gap-6">
          <span className="text-primary">ADMIN_TERMINAL</span>
          <nav aria-label="관리자 메뉴" className="flex gap-6">
            <Link
              href="/admin"
              className="text-on-surface-variant hover:text-primary transition-colors min-h-[44px] flex items-center"
            >
              대시보드
            </Link>
            <Link
              href="/admin/projects"
              className="text-on-surface-variant hover:text-primary transition-colors min-h-[44px] flex items-center"
            >
              프로젝트
            </Link>
            <Link
              href="/admin/posts"
              className="text-on-surface-variant hover:text-primary transition-colors min-h-[44px] flex items-center"
            >
              뉴스
            </Link>
            <Link
              href="/admin/resources"
              className="text-on-surface-variant hover:text-primary transition-colors min-h-[44px] flex items-center"
            >
              자료실
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-on-surface-variant hidden md:inline normal-case">
            {user.email}
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-on-surface-variant hover:text-error transition-colors min-h-[44px]"
            >
              로그아웃
            </button>
          </form>
        </div>
      </div>
      <div className="flex-grow w-full max-w-[1400px] mx-auto px-6 py-10">
        {children}
      </div>
    </div>
  );
}

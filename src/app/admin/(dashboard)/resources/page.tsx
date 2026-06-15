import Link from "next/link";
import { listAllResources } from "@/lib/repositories/resources";

export const metadata = { title: "자료실 관리 // ADMIN" };

export default async function ResourcesListPage() {
  const resources = await listAllResources();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-[family-name:var(--font-label)] text-xs text-primary tracking-widest uppercase mb-2">
            /ADMIN/RESOURCES
          </div>
          <h1 className="font-[family-name:var(--font-headline)] text-3xl font-bold text-on-surface uppercase">
            자료실 관리
          </h1>
        </div>
        <Link
          href="/admin/resources/new"
          className="py-3 px-5 bg-primary text-on-primary font-[family-name:var(--font-label)] text-xs uppercase tracking-widest hover:bg-primary-dim transition-colors min-h-[44px] inline-flex items-center"
        >
          + 새 자료
        </Link>
      </div>

      {resources.length === 0 ? (
        <div className="bg-surface-container-low p-12 text-center">
          <p className="text-on-surface-variant font-[family-name:var(--font-body)]">
            등록된 자료가 없습니다.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-container-high text-on-surface-variant font-[family-name:var(--font-label)] text-[10px] uppercase tracking-widest">
                <th className="text-left px-4 py-3">제목</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Slug</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">링크/프롬프트</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">순서</th>
                <th className="text-left px-4 py-3">상태</th>
                <th className="text-right px-4 py-3">작업</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="font-[family-name:var(--font-headline)] text-on-surface">
                      {r.title}
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell font-[family-name:var(--font-label)] text-xs text-on-surface-variant">
                    {r.slug}
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell font-[family-name:var(--font-label)] text-xs text-on-surface-variant">
                    링크 {r.links?.length ?? 0} · 프롬프트 {r.prompts?.length ?? 0}
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell font-[family-name:var(--font-label)] text-xs text-on-surface-variant">
                    {r.sort_order}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/admin/resources/${r.id}`}
                      className="text-primary hover:text-primary-dim font-[family-name:var(--font-label)] text-xs uppercase tracking-widest"
                    >
                      편집 →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "published"
      ? "text-primary border-primary/40"
      : "text-tertiary border-tertiary/40";
  return (
    <span
      className={`inline-block px-2 py-0.5 border font-[family-name:var(--font-label)] text-[10px] uppercase tracking-widest ${color}`}
    >
      {status}
    </span>
  );
}

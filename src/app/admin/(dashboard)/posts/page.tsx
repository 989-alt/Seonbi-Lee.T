import Link from "next/link";
import { listAllPosts } from "@/lib/repositories/posts";

export const metadata = { title: "뉴스 관리 // ADMIN" };

export default async function PostsListPage() {
  const posts = await listAllPosts();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-[family-name:var(--font-label)] text-xs text-primary tracking-widest uppercase mb-2">
            /ADMIN/POSTS
          </div>
          <h1 className="font-[family-name:var(--font-headline)] text-3xl font-bold text-on-surface uppercase">
            뉴스 관리
          </h1>
        </div>
        <Link
          href="/admin/posts/new"
          className="py-3 px-5 bg-primary text-on-primary font-[family-name:var(--font-label)] text-xs uppercase tracking-widest hover:bg-primary-dim transition-colors min-h-[44px] inline-flex items-center"
        >
          + 새 글
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="bg-surface-container-low p-12 text-center">
          <p className="text-on-surface-variant font-[family-name:var(--font-body)]">
            등록된 글이 없습니다.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-container-high text-on-surface-variant font-[family-name:var(--font-label)] text-[10px] uppercase tracking-widest">
                <th className="text-left px-4 py-3">제목</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Slug</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">태그</th>
                <th className="text-left px-4 py-3">상태</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">게시일</th>
                <th className="text-right px-4 py-3">작업</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="font-[family-name:var(--font-headline)] text-on-surface">
                      {p.title}
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell font-[family-name:var(--font-label)] text-xs text-on-surface-variant">
                    {p.slug}
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell text-on-surface-variant">
                    {p.tags.slice(0, 3).join(", ")}
                    {p.tags.length > 3 && ` +${p.tags.length - 3}`}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell font-[family-name:var(--font-label)] text-xs text-on-surface-variant">
                    {p.published_at
                      ? new Date(p.published_at).toLocaleDateString("ko-KR")
                      : "—"}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/admin/posts/${p.id}`}
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

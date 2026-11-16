import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudentAwareLink } from "@/components/play/StudentAwareLink";
import { appShareMeta } from "@/lib/launcher/og";
import { toLauncherApp } from "@/lib/launcher/catalog";
import { listLauncherRows, publicThumbnailUrl } from "@/lib/repositories/projects";

async function findApp(slug: string) {
  const rows = await listLauncherRows();
  const row = rows.find((r) => r.slug === slug);
  const app = row ? toLauncherApp(row, publicThumbnailUrl) : null;
  return app && app.action.kind === "play" && app.action.embed ? { app, src: app.action.href } : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = await findApp(slug);
  if (!found) return {};
  return { ...appShareMeta(found.app, `/play/${slug}`), alternates: { canonical: `/play/${slug}` } };
}

/** 교실 놀이터 안에서 수록 앱을 실행하는 화면 */
export default async function PlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const [{ slug }, { from }] = await Promise.all([params, searchParams]);
  const fromStudents = from === "students";
  const found = await findApp(slug);
  if (!found) notFound();
  const { app, src } = found;

  return (
    <div className="flex h-[100dvh] flex-col bg-night">
      <header className="flex flex-none flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 text-[13px] text-lilac">
        <StudentAwareLink kind="back" slug={app.slug} fromStudents={fromStudents} className="font-pixel font-bold text-white hover:text-mint">
          ← 교실 놀이터
        </StudentAwareLink>
        <h1 className="m-0 min-w-0 flex-1 truncate font-pixel text-base font-bold text-white">{app.name}</h1>
        <a href={src} target="_blank" rel="noopener" className="hover:text-white">
          새 탭에서 열기 ↗
        </a>
        <StudentAwareLink kind="privacy" slug={app.slug} fromStudents={fromStudents} className="hover:text-white">
          개인정보처리방침
        </StudentAwareLink>
      </header>
      <iframe
        src={src}
        title={app.name}
        className="w-full flex-1 border-0 bg-white"
        allow="fullscreen; clipboard-read; clipboard-write; autoplay"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}

import type { Metadata } from "next";
import { Launcher } from "@/components/launcher/Launcher";
import { IntroOverlay } from "@/components/launcher/IntroOverlay";
import { toLauncherApp, type LauncherApp } from "@/lib/launcher/catalog";
import { listLauncherRows, publicThumbnailUrl } from "@/lib/repositories/projects";
import { getStats } from "@/lib/stats/server";
import { appShareMeta } from "@/lib/launcher/og";
import { DormsLibrary } from "@/components/dorms/DormsLibrary";
import { getDormsFeed } from "@/lib/dorms/feed";

/** ?app=슬러그 로 공유하면 그 앱의 제목·썸네일이 미리보기로 뜬다 */
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ app?: string | string[] }> }): Promise<Metadata> {
  const sp = await searchParams;
  const slug = typeof sp.app === "string" ? sp.app : null;
  const base: Metadata = { alternates: { canonical: "/" } };
  if (!slug) return base;
  const row = (await listLauncherRows()).find((r) => r.slug === slug);
  const app = row ? toLauncherApp(row, publicThumbnailUrl) : null;
  return app ? { ...appShareMeta(app, `/?app=${encodeURIComponent(slug)}`), ...base } : base;
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ app?: string | string[] }> }) {
  const [rows, stats, sp, dorms] = await Promise.all([listLauncherRows(), getStats(), searchParams, getDormsFeed()]);
  const apps = rows
    .map((r) => toLauncherApp(r, publicThumbnailUrl))
    .filter((a): a is LauncherApp => a !== null);
  const initial = typeof sp.app === "string" ? sp.app : null;
  return (
    <>
      <Launcher apps={apps} stats={stats} initialSlug={initial} />
      <section id="dorms" aria-labelledby="home-dorms-title" className="bg-surface px-6 py-14 md:px-12 lg:px-24">
        <div className="mx-auto w-full max-w-[1440px]">
          <p className="m-0 font-pixel text-[13px] tracking-[0.12em] text-primary">GUILD · 도름스 서재</p>
          <h2 id="home-dorms-title" className="m-0 mt-2 mb-8 font-pixel text-3xl font-bold text-on-surface">도름스에 올린 앱·글</h2>
          <DormsLibrary feed={dorms} />
        </div>
      </section>
      <IntroOverlay />
    </>
  );
}

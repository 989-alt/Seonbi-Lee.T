import type { Metadata } from "next";
import { Launcher } from "@/components/launcher/Launcher";
import { IntroOverlay } from "@/components/launcher/IntroOverlay";
import { toLauncherApp, type LauncherApp } from "@/lib/launcher/catalog";
import { listLauncherRows, publicThumbnailUrl } from "@/lib/repositories/projects";
import { getStats } from "@/lib/stats/server";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage({ searchParams }: { searchParams: Promise<{ app?: string | string[] }> }) {
  const [rows, stats, sp] = await Promise.all([listLauncherRows(), getStats(), searchParams]);
  const apps = rows
    .map((r) => toLauncherApp(r, publicThumbnailUrl))
    .filter((a): a is LauncherApp => a !== null);
  const initial = typeof sp.app === "string" ? sp.app : null;
  return (
    <>
      <Launcher apps={apps} stats={stats} initialSlug={initial} />
      <IntroOverlay />
    </>
  );
}

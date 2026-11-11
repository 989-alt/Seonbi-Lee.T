"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { groupForLibrary, pickSelected, type LauncherApp } from "@/lib/launcher/catalog";
import { topPlayed } from "@/lib/launcher/stats";
import { sendVisitOnce } from "@/lib/stats/client";
import { PORTAL_SLUG, type StatsResponse } from "@/lib/stats/track";
import { LauncherTopBar } from "./LauncherTopBar";
import { Library } from "./Library";
import { ServerStatus } from "./ServerStatus";
import { AppStage } from "./AppStage";
import { TopPlayed } from "./TopPlayed";
import { PlayerCard } from "./PlayerCard";
import { TeacherGuideCard } from "./TeacherGuideCard";

type Props = { apps: LauncherApp[]; stats: StatsResponse; initialSlug: string | null };

export function Launcher({ apps, stats, initialSlug }: Props) {
  const [q, setQ] = useState("");
  const [slug, setSlug] = useState<string | null>(() => pickSelected(apps, initialSlug)?.slug ?? null);
  const groups = useMemo(() => groupForLibrary(apps, q), [apps, q]);
  const current = useMemo(() => pickSelected(apps, slug), [apps, slug]);
  const top = useMemo(() => topPlayed(apps, stats), [apps, stats]);

  useEffect(() => { sendVisitOnce(PORTAL_SLUG); }, []);

  const pick = useCallback((s: string) => {
    setSlug(s);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("app", s);
      window.history.replaceState(null, "", url);
    } catch { /* noop */ }
    if (window.matchMedia("(max-width: 899px)").matches) {
      document.getElementById("bg-stage")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const openIntro = useCallback(() => window.dispatchEvent(new Event("bg:intro")), []);

  return (
    <div id="bg-root" className="flex min-h-screen flex-col bg-paper font-[family-name:var(--font-noto-kr)] text-night">
      <LauncherTopBar onIntro={openIntro} />
      <div className="flex flex-1 flex-wrap items-stretch">
        <aside aria-label="앱 라이브러리" className="order-2 flex max-w-full min-[900px]:order-1 flex-[1_1_300px] flex-col border-r border-paper-line bg-white min-[900px]:max-w-[340px]">
          <Library groups={groups} q={q} onQ={setQ} selected={current?.slug ?? null} onPick={pick} stats={stats} />
          <ServerStatus stats={stats} />
        </aside>
        <main id="bg-stage" className="order-1 flex min-w-0 min-[900px]:order-2 flex-[999_1_560px] flex-col">
          {current ? (
            <AppStage app={current} stats={stats} />
          ) : (
            <section className="flex min-h-[460px] items-center justify-center bg-night p-10 text-center font-pixel text-lilac">
              라이브러리를 준비하고 있어요. 곧 게임이 들어와요!
            </section>
          )}
          <div className="flex flex-wrap items-start gap-6 px-6 pt-7 pb-10 sm:px-10">
            {current?.guide && <TeacherGuideCard key={current.slug} guide={current.guide} appName={current.name} />}
            <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-6">
              <TopPlayed rows={top} onPick={pick} />
              <PlayerCard />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

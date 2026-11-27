import Link from "next/link";
import { hashSeed } from "@/lib/fortune/saju/luck";
import { seoulToday } from "@/lib/fortune/saju/core";
import { mulberry32, shuffle } from "@/lib/fortune/tarot/deck";
import { toLauncherApp, type LauncherApp } from "@/lib/launcher/catalog";
import { listLauncherRows, publicThumbnailUrl } from "@/lib/repositories/projects";

type Item = { href: string; title: string; desc: string; image: string | null };

const FALLBACK: Item[] = [
  { href: "/", title: "앱 라이브러리", desc: "수업 게임과 업무 도구를 한곳에서", image: "/launcher/char-pick.webp" },
  { href: "/learn", title: "배우기", desc: "교실에서 바로 쓰는 AI 활용법", image: "/launcher/char-learn.webp" },
  { href: "/news", title: "AI 소식", desc: "선생님이 알아 두면 좋은 새 소식", image: "/launcher/char-news.webp" },
];

/** 오늘 날짜로 고른 앱 2개 + 배우기. 앱 목록을 못 읽으면 고정 링크 */
export async function Recommended({ room }: { room: "saju" | "tarot" | "hub" }) {
  const d = seoulToday();
  const apps = (await listLauncherRows().catch(() => []))
    .map((r) => toLauncherApp(r, publicThumbnailUrl))
    .filter((a): a is LauncherApp => a !== null && a.action.kind === "play" && a.thumb !== null);
  const picks = shuffle(apps, mulberry32(hashSeed(`${room}${d.y}-${d.m}-${d.d}`))).slice(0, 2).map((a): Item => ({ href: `/?app=${a.slug}`, title: a.name, desc: a.desc, image: a.hero ?? a.thumb }));
  const items = picks.length === 2 ? [...picks, FALLBACK[1]] : FALLBACK;
  return (
    <section aria-labelledby="rec-title" className="fx-wrap mt-16">
      <h2 id="rec-title" className="fx-h2 mb-5">오늘 기운에 어울리는 교실 놀이터</h2>
      <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-3">
        {items.map((i) => (
          <li key={i.href}>
            <Link href={i.href} className="group flex h-full items-center gap-4 rounded-[16px] border border-[#4a3f80] bg-[#1e1739] p-4 transition-colors hover:border-mint">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {i.image && <img src={i.image} alt="" loading="lazy" className="h-[76px] w-[96px] flex-none rounded-[10px] object-cover" />}
              <span className="min-w-0">
                <span className="block font-pixel text-base font-bold text-white group-hover:text-mint">{i.title}</span>
                <span className="mt-1 line-clamp-2 text-[13.5px] leading-[1.55] text-lilac">{i.desc}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

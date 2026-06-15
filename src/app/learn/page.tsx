import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { LearnBrowser } from "@/components/learn/LearnBrowser";
import { listPublishedLessons, listPublishedGallery } from "@/lib/repositories/resources";
import { listPublishedPosts } from "@/lib/repositories/posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "배우기 // SEONBI'S LAB",
  description: "Claude를 A→Z로 — 단계별 길잡이·스킬·프롬프트 학습 허브",
};

export default async function LearnPage() {
  const [lessons, gallery, posts] = await Promise.all([
    listPublishedLessons(),
    listPublishedGallery(),
    listPublishedPosts(),
  ]);

  return (
    <main className="flex-grow pt-24 px-6 md:px-12 lg:px-24 pb-20 max-w-[1180px] mx-auto w-full">
      {/* HERO */}
      <section className="mt-8 mb-14">
        <div className="font-[family-name:var(--font-label)] text-xs text-primary tracking-[0.3em] uppercase mb-4">
          // MOTHER-DECK · LEARN CLAUDE A → Z
        </div>
        <h1 className="font-[family-name:var(--font-headline)] text-5xl md:text-7xl font-bold uppercase tracking-tighter text-on-surface leading-[1.02]">
          CLAUDE, <span className="hero-keyword">A to Z</span>
        </h1>
        <p className="mt-5 font-[family-name:var(--font-body)] text-on-surface-variant text-base md:text-lg max-w-2xl leading-relaxed">
          터미널이 처음인 비개발자도, 공문서·발표자료·멀티 에이전트까지. 단계별 길잡이와 바로 쓰는 자료·프롬프트를 한곳에서.
        </p>
      </section>

      {/* LEARNING PATH */}
      <section className="border-t border-outline-variant/30 pt-12">
        <div className="font-[family-name:var(--font-label)] text-xs text-primary tracking-widest uppercase mb-2">
          // LEARNING PATH
        </div>
        <h2 className="font-[family-name:var(--font-headline)] text-3xl md:text-4xl font-bold uppercase text-on-surface mb-8">
          단계별 학습
        </h2>
        <Reveal>
          <LearnBrowser lessons={lessons} />
        </Reveal>
      </section>

      {/* SKILLS GALLERY */}
      {gallery.length > 0 && (
        <section className="border-t border-outline-variant/30 pt-12 mt-14">
          <div className="font-[family-name:var(--font-label)] text-xs text-primary tracking-widest uppercase mb-2">
            // SKILLS &amp; TEMPLATES
          </div>
          <h2 className="font-[family-name:var(--font-headline)] text-3xl md:text-4xl font-bold uppercase text-on-surface mb-8">
            스킬 갤러리
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gallery.map((g) => {
              const url = g.links?.[0]?.url ?? "#";
              return (
                <a
                  key={g.id}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-surface-container-low border-t-2 border-secondary p-6 hover:bg-surface-container-high transition-colors"
                >
                  <h3 className="font-[family-name:var(--font-headline)] text-lg font-bold text-on-surface mb-2">
                    {g.title}
                  </h3>
                  <p className="text-on-surface-variant text-sm">{g.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {g.tags?.map((t) => (
                      <span
                        key={t}
                        className="font-[family-name:var(--font-label)] text-[10px] uppercase tracking-wider text-outline border border-outline-variant/30 px-2 py-0.5"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* ARTICLES */}
      {posts.length > 0 && (
        <section className="border-t border-outline-variant/30 pt-12 mt-14">
          <div className="font-[family-name:var(--font-label)] text-xs text-primary tracking-widest uppercase mb-2">
            // GUIDES &amp; ARTICLES
          </div>
          <h2 className="font-[family-name:var(--font-headline)] text-3xl md:text-4xl font-bold uppercase text-on-surface mb-8">
            가이드 &amp; 아티클
          </h2>
          <div className="flex flex-col">
            {posts.map((p) => (
              <Link
                key={p.id}
                href={`/news#${p.slug}`}
                className="flex items-center justify-between gap-4 py-4 border-b border-outline-variant/30 hover:pl-3 hover:text-primary transition-all"
              >
                <span className="font-[family-name:var(--font-headline)] font-semibold text-lg">
                  {p.title}
                </span>
                <span className="font-[family-name:var(--font-label)] text-[11px] text-outline uppercase shrink-0">
                  {p.tags?.[0] ?? "GUIDE"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

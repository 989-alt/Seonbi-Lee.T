import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { InteractiveCard } from "@/components/ui/InteractiveCard";
import { listPublishedPosts, publicHeroUrl } from "@/lib/repositories/posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 뉴스 // SEONBI'S LAB",
  description: "AI·에듀테크 관련 소식과 작업 로그",
};

const ACCENT_BORDER: Record<string, string> = {
  primary: "border-primary",
  secondary: "border-secondary",
  tertiary: "border-tertiary",
};

const ACCENT_TEXT: Record<string, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  tertiary: "text-tertiary",
};

const ACCENT_BG_SOFT: Record<string, string> = {
  primary: "bg-primary/10",
  secondary: "bg-secondary/10",
  tertiary: "bg-tertiary/10",
};

export default async function NewsPage() {
  const posts = await listPublishedPosts();

  const tagCount: Record<string, number> = {};
  posts.forEach((p) => {
    p.tags.forEach((t) => {
      tagCount[t] = (tagCount[t] ?? 0) + 1;
    });
  });

  return (
    <main className="flex-grow pt-24 px-6 md:px-12 lg:px-24 pb-20 max-w-[1440px] mx-auto w-full">
      <div className="mb-16 mt-8 stagger stagger-2">
        <h1 className="font-[family-name:var(--font-headline)] text-5xl md:text-7xl font-bold uppercase tracking-tighter text-on-surface">
          AI <span className="hero-keyword">뉴스</span>
        </h1>
      </div>

      {posts.length === 0 ? (
        <div className="mt-20 mx-auto max-w-xl bg-surface-container-low p-12 border-l-2 border-primary text-center">
          <div className="font-[family-name:var(--font-label)] text-xs text-primary tracking-[0.3em] uppercase mb-3">
            // EMPTY_FEED
          </div>
          <p className="text-on-surface-variant font-[family-name:var(--font-body)] mb-4">
            아직 공개된 글이 없습니다.
          </p>
          <Link
            href="/admin/posts/new"
            className="inline-block font-[family-name:var(--font-label)] text-xs text-primary border border-primary/40 px-4 py-2 tracking-widest uppercase hover:bg-primary/10 transition-colors"
          >
            + 새 글 작성
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          <div className="lg:col-span-8 flex flex-col space-y-12">
            {posts.map((post, i) => {
              const hero = publicHeroUrl(post.hero_image_path);
              return (
                <Reveal key={post.id} delay={(i % 4) * 0.1}>
                  <InteractiveCard
                    className={`group relative bg-surface-container-low border-t-[2px] ${ACCENT_BORDER[post.accent]} hover:bg-surface-container-high overflow-hidden`}
                  >
                    <article id={post.slug}>
                      {hero && (
                        <div className="relative w-full aspect-[16/7] bg-surface-container-highest overflow-hidden">
                          <Image
                            src={hero}
                            alt=""
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            sizes="(max-width: 1024px) 100vw, 66vw"
                            unoptimized
                          />
                        </div>
                      )}
                      <div className="p-8 relative">
                        <header className="mb-6 flex flex-col md:flex-row md:items-baseline md:justify-between gap-4">
                          <time
                            className={`font-[family-name:var(--font-label)] text-sm ${ACCENT_TEXT[post.accent]} tracking-widest ${ACCENT_BG_SOFT[post.accent]} px-2 py-1 inline-block w-max`}
                          >
                            {post.published_at
                              ? new Date(post.published_at).toLocaleDateString("ko-KR")
                              : new Date(post.created_at).toLocaleDateString("ko-KR")}
                          </time>
                          <div className="flex gap-3 flex-wrap">
                            {post.tags.map((tag) => (
                              <span
                                key={tag}
                                className="font-[family-name:var(--font-label)] text-xs text-outline tracking-wider border border-outline/20 px-2 py-0.5 uppercase"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </header>
                        <h2
                          className={`font-[family-name:var(--font-headline)] text-2xl md:text-3xl font-bold mb-4 ${ACCENT_TEXT[post.accent]}`}
                        >
                          {post.title}
                        </h2>
                        <p className="font-[family-name:var(--font-body)] text-on-surface-variant text-base md:text-lg leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>
                    </article>
                  </InteractiveCard>
                </Reveal>
              );
            })}
          </div>

          <aside className="lg:col-span-4 flex flex-col space-y-12">
            <Reveal>
              <div className="bg-surface-container-highest p-6 relative">
                <h3 className="font-[family-name:var(--font-headline)] text-sm text-outline tracking-widest uppercase mb-4">
                  데이터베이스 쿼리
                </h3>
                <form role="search" aria-label="뉴스 검색">
                  <label htmlFor="news-search" className="sr-only">
                    로그 검색
                  </label>
                  <input
                    id="news-search"
                    type="search"
                    placeholder="로그 검색..."
                    className="w-full bg-surface-container-low border-0 border-b border-primary/40 focus:border-primary focus:border-b-2 focus:ring-0 focus:outline-none text-on-surface font-[family-name:var(--font-label)] text-sm py-3 px-0 placeholder:text-outline-variant transition-all"
                  />
                </form>
              </div>
            </Reveal>

            {Object.keys(tagCount).length > 0 && (
              <Reveal delay={0.15}>
                <div className="bg-surface-container-highest p-6 relative">
                  <h3 className="font-[family-name:var(--font-headline)] text-sm text-outline tracking-widest uppercase mb-6">
                    인덱싱된 태그
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(tagCount).map(([tag, count]) => (
                      <span
                        key={tag}
                        className="font-[family-name:var(--font-label)] text-xs text-outline border border-outline/30 px-3 py-1.5 uppercase hover:border-primary hover:text-primary transition-colors cursor-default"
                      >
                        {tag} ({count})
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}

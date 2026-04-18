import Link from "next/link";
import { ParticleBackground } from "@/components/layout/ParticleBackground";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { InteractiveCard } from "@/components/ui/InteractiveCard";
import { listPublishedProjects } from "@/lib/repositories/projects";
import { listPublishedPosts } from "@/lib/repositories/posts";
import { CATEGORY_LABEL } from "@/lib/repositories/types";

const ACCENT_BG: Record<string, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  tertiary: "bg-tertiary",
  "on-surface": "bg-on-surface",
};

const ACCENT_TEXT: Record<string, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  tertiary: "text-tertiary",
  "on-surface": "text-on-surface",
};

export default async function HomePage() {
  const [projects, posts] = await Promise.all([
    listPublishedProjects(),
    listPublishedPosts(),
  ]);

  const featured = projects.slice(0, 3);
  const recentPosts = posts.slice(0, 2);

  return (
    <>
      <ParticleBackground />
      <main className="flex-grow flex flex-col items-center w-full max-w-[1440px] mx-auto px-6 pb-24 pt-20 relative z-10">
        <section className="w-full flex flex-col items-center justify-center text-center min-h-[60vh] py-16">
          <div className="stagger stagger-2 space-y-6 flex flex-col items-center max-w-4xl">
            <h1 className="font-[family-name:var(--font-headline)] text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-on-surface leading-tight drop-shadow-lg">
              교육과 기술의 <br />
              <span className="hero-keyword">가교</span>
            </h1>
            <div className="font-[family-name:var(--font-body)] text-lg md:text-xl text-on-surface-variant max-w-3xl leading-relaxed mt-8 drop-shadow-md font-medium space-y-2">
              <p>
                AI를 활용해 수업과 학급 운영에 도움이 되는 여러 프로그램을 만드는
                교사 이선학입니다.
              </p>
              <p>콘텐츠 제안은 언제나 환영, 피드백은 최대한 빠르게 반영하겠습니다.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-12 justify-center">
              <Link
                href="/projects"
                className="bg-primary text-on-primary font-[family-name:var(--font-headline)] text-sm uppercase px-8 py-4 hover:bg-primary-dim hover:shadow-[0_0_15px_#8ff5ff] transition-all inline-flex items-center justify-center gap-2 min-h-[44px]"
              >
                프로젝트 탐색 <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/news"
                className="border border-outline/30 bg-[#0e0e0f]/60 backdrop-blur-md text-primary font-[family-name:var(--font-headline)] text-sm uppercase px-8 py-4 hover:bg-surface-container-high hover:border-primary/50 transition-all inline-flex items-center justify-center min-h-[44px]"
              >
                AI 뉴스
              </Link>
            </div>
          </div>
        </section>

        {featured.length > 0 && (
          <section className="w-full mb-32 section-scan">
            <Reveal>
              <SectionHeading accent="secondary">주요 모듈</SectionHeading>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featured.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.1}>
                  <InteractiveCard className="bg-surface-container-low p-8 relative overflow-hidden hover:bg-surface-container-high h-full flex flex-col">
                    <div
                      aria-hidden="true"
                      className={`absolute top-0 left-0 w-full h-[2px] ${ACCENT_BG[p.accent]}`}
                    />
                    <div className="flex justify-between items-start mb-8 relative">
                      <span
                        className={`font-[family-name:var(--font-label)] text-[10px] tracking-widest uppercase px-2 py-0.5 border border-outline-variant/25 ${ACCENT_TEXT[p.accent]}`}
                      >
                        {CATEGORY_LABEL[p.category]}
                      </span>
                      {p.version && (
                        <span className="font-[family-name:var(--font-label)] text-xs text-on-surface-variant">
                          {p.version}
                        </span>
                      )}
                    </div>
                    <h3 className="font-[family-name:var(--font-headline)] text-xl text-on-surface mb-3 uppercase relative">
                      {p.title_ko}
                    </h3>
                    <p className="font-[family-name:var(--font-body)] text-sm text-on-surface-variant mb-8 line-clamp-3 relative flex-grow">
                      {p.description}
                    </p>
                    <Link
                      href={`/projects#${p.slug}`}
                      className={`font-[family-name:var(--font-label)] text-xs uppercase tracking-widest inline-flex items-center gap-1 ${ACCENT_TEXT[p.accent]} hover:opacity-80 transition-opacity relative`}
                    >
                      자세히 보기 <span aria-hidden="true">→</span>
                    </Link>
                  </InteractiveCard>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {recentPosts.length > 0 && (
          <section className="w-full">
            <Reveal>
              <SectionHeading accent="primary">최근 뉴스</SectionHeading>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentPosts.map((post, i) => (
                <Reveal key={post.id} delay={i * 0.1}>
                  <InteractiveCard className="bg-surface-container-low p-8 relative overflow-hidden hover:bg-surface-container-high h-full flex flex-col">
                    <div
                      aria-hidden="true"
                      className={`absolute top-0 left-0 w-full h-[2px] ${ACCENT_BG[post.accent]}`}
                    />
                    <time className="font-[family-name:var(--font-label)] text-xs text-on-surface-variant tracking-widest relative">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString("ko-KR")
                        : new Date(post.created_at).toLocaleDateString("ko-KR")}
                    </time>
                    <h3 className="font-[family-name:var(--font-headline)] text-xl text-on-surface mt-3 mb-3 relative">
                      {post.title}
                    </h3>
                    <p className="font-[family-name:var(--font-body)] text-sm text-on-surface-variant mb-4 line-clamp-2 relative flex-grow">
                      {post.excerpt}
                    </p>
                    <Link
                      href={`/news#${post.slug}`}
                      className={`font-[family-name:var(--font-label)] text-xs uppercase tracking-widest inline-flex items-center gap-1 ${ACCENT_TEXT[post.accent]} hover:opacity-80 transition-opacity relative`}
                    >
                      읽기 <span aria-hidden="true">→</span>
                    </Link>
                  </InteractiveCard>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {featured.length === 0 && recentPosts.length === 0 && (
          <section className="w-full mt-20 text-center bg-surface-container-low p-12 border-l-2 border-primary">
            <div className="font-[family-name:var(--font-label)] text-xs text-primary tracking-[0.3em] uppercase mb-3">
              // NO_DATA
            </div>
            <p className="text-on-surface-variant font-[family-name:var(--font-body)] mb-4">
              아직 공개된 콘텐츠가 없습니다.
            </p>
            <Link
              href="/admin"
              className="inline-block mt-2 font-[family-name:var(--font-label)] text-xs text-primary border border-primary/40 px-4 py-2 tracking-widest uppercase hover:bg-primary/10 transition-colors"
            >
              관리자 페이지로 →
            </Link>
          </section>
        )}
      </main>
    </>
  );
}

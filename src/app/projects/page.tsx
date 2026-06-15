import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { InteractiveCard } from "@/components/ui/InteractiveCard";
import { listPublishedProjects, publicThumbnailUrl } from "@/lib/repositories/projects";
import { CATEGORY_LABEL } from "@/lib/repositories/types";
import { getAdminUser } from "@/lib/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "프로젝트 아카이브 // SEONBI'S LAB",
  description: "수업과 학급 운영을 돕는 다양한 프로그램 및 교육 자료 모음",
};

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

export default async function ProjectsPage() {
  const [projects, isAdmin] = await Promise.all([
    listPublishedProjects(),
    getAdminUser().then(Boolean),
  ]);

  return (
    <main className="flex-grow flex flex-col w-full px-6 py-12 max-w-[1600px] mx-auto z-10 pt-24">
      <div className="mb-12 mt-8 stagger stagger-2">
        <div className="flex items-end justify-between gap-6 flex-wrap mb-4">
          <h1 className="font-[family-name:var(--font-headline)] text-5xl md:text-7xl font-bold tracking-tighter uppercase text-on-surface">
            프로젝트 <span className="hero-keyword">아카이브</span>
          </h1>
          {isAdmin && (
            <Link
              href="/admin/projects/new"
              className="inline-block font-[family-name:var(--font-label)] text-xs text-primary border border-primary/40 px-4 py-2 tracking-widest uppercase hover:bg-primary/10 transition-colors"
            >
              + 새 프로젝트
            </Link>
          )}
        </div>
        <p className="font-[family-name:var(--font-label)] text-sm text-on-surface-variant max-w-2xl tracking-widest uppercase">
          수업과 학급 운영을 돕는 다양한 프로그램 및 교육 자료 모음입니다.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="mt-20 mx-auto max-w-xl bg-surface-container-low p-12 border-l-2 border-primary text-center">
          <div className="font-[family-name:var(--font-label)] text-xs text-primary tracking-[0.3em] uppercase mb-3">
            // EMPTY_RECORD
          </div>
          <p className="text-on-surface-variant font-[family-name:var(--font-body)] mb-4">
            아직 공개된 프로젝트가 없습니다.
          </p>
          <Link
            href="/admin/projects/new"
            className="inline-block font-[family-name:var(--font-label)] text-xs text-primary border border-primary/40 px-4 py-2 tracking-widest uppercase hover:bg-primary/10 transition-colors"
          >
            + 새 프로젝트 등록
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, i) => {
            const thumb = publicThumbnailUrl(p.thumbnail_path);
            return (
              <Reveal key={p.id} delay={(i % 6) * 0.08}>
                <InteractiveCard
                  className="group flex flex-col bg-surface-container-low hover:bg-surface-container-high relative overflow-hidden h-full"
                >
                  <article id={p.slug} className="flex flex-col h-full">
                    <div
                      aria-hidden="true"
                      className={`h-[2px] w-full absolute top-0 left-0 z-10 ${ACCENT_BG[p.accent]}`}
                    />
                    {thumb && (
                      <div className="relative w-full aspect-[16/9] bg-surface-container-highest overflow-hidden">
                        <Image
                          src={thumb}
                          alt=""
                          fill
                          className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-grow relative">
                      <div className="flex justify-between items-start mb-4">
                        <span
                          className={`font-[family-name:var(--font-label)] text-[10px] tracking-widest px-2 py-0.5 border border-outline-variant/25 ${ACCENT_TEXT[p.accent]}`}
                        >
                          {CATEGORY_LABEL[p.category]}
                        </span>
                        {p.version && (
                          <span className="font-[family-name:var(--font-label)] text-[10px] text-on-surface-variant">
                            {p.version}
                          </span>
                        )}
                      </div>
                      <h2 className="font-[family-name:var(--font-headline)] text-xl text-on-surface uppercase tracking-wide mb-3">
                        {p.title_ko}
                      </h2>
                      {p.title_en && (
                        <div className="font-[family-name:var(--font-label)] text-[11px] text-on-surface-variant tracking-widest mb-3">
                          {p.title_en}
                        </div>
                      )}
                      <p className="font-[family-name:var(--font-body)] text-sm text-on-surface-variant line-clamp-4 flex-grow">
                        {p.description}
                      </p>
                      <div className="mt-6 pt-4 flex items-center justify-between border-t border-outline-variant/10">
                        <span className="font-[family-name:var(--font-label)] text-[10px] text-on-surface-variant uppercase tracking-wider">
                          {p.tech_stack.join(" // ")}
                        </span>
                        {p.external_url && (
                          <Link
                            href={p.external_url}
                            target="_blank"
                            rel="noreferrer"
                            className={`font-[family-name:var(--font-label)] text-xs ${ACCENT_TEXT[p.accent]} translate-x-0 group-hover:translate-x-1 transition-transform duration-300 inline-flex items-center gap-1`}
                          >
                            접속 <span aria-hidden="true">›</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                </InteractiveCard>
              </Reveal>
            );
          })}
        </div>
      )}
    </main>
  );
}

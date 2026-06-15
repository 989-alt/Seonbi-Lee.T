import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { ResourceAccordion } from "@/components/resources/ResourceAccordion";
import { listPublishedResources } from "@/lib/repositories/resources";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "자료실 // SEONBI'S LAB",
  description: "강의자료 · 추천 repo · 프롬프트 모음 — 연수 수강생용 자료실",
};

export default async function ResourcesPage() {
  const resources = await listPublishedResources();

  return (
    <main className="flex-grow pt-24 px-6 md:px-12 lg:px-24 pb-20 max-w-[1100px] mx-auto w-full">
      <div className="mb-12 mt-8 stagger stagger-2">
        <h1 className="font-[family-name:var(--font-headline)] text-5xl md:text-7xl font-bold uppercase tracking-tighter text-on-surface">
          자<span className="hero-keyword">료실</span>
        </h1>
        <p className="mt-5 font-[family-name:var(--font-body)] text-on-surface-variant text-base md:text-lg max-w-2xl leading-relaxed">
          강의자료·추천 repo·프롬프트를 한곳에. 항목을 펼쳐 다운로드·링크로 받고, 프롬프트는 복사해 바로 사용하세요.
        </p>
      </div>

      {resources.length === 0 ? (
        <div className="mt-16 mx-auto max-w-xl bg-surface-container-low p-12 border-l-2 border-primary text-center">
          <div className="font-[family-name:var(--font-label)] text-xs text-primary tracking-[0.3em] uppercase mb-3">
            // EMPTY_ARCHIVE
          </div>
          <p className="text-on-surface-variant font-[family-name:var(--font-body)] mb-4">
            아직 공개된 자료가 없습니다.
          </p>
          <Link
            href="/admin/resources/new"
            className="inline-block font-[family-name:var(--font-label)] text-xs text-primary border border-primary/40 px-4 py-2 tracking-widest uppercase hover:bg-primary/10 transition-colors"
          >
            + 새 자료 등록
          </Link>
        </div>
      ) : (
        <Reveal>
          <ResourceAccordion resources={resources} />
        </Reveal>
      )}
    </main>
  );
}

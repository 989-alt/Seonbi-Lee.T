import type { ReactNode } from "react";
import { PageHero } from "@/components/ui/PageHero";

export function LegalPage({ label, title, desc, children }: { label: string; title: string; desc: ReactNode; children: ReactNode }) {
  return (
    <main className="flex-grow flex flex-col items-center px-6 pb-16 lg:px-8 pt-28">
      <div className="w-full max-w-3xl">
        <div className="mb-10">
          <PageHero label={label} title={title} desc={desc} />
        </div>
        <article className="space-y-8 text-[15px] leading-[1.8] text-on-surface">{children}</article>
      </div>
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-[family-name:var(--font-headline)] text-xl font-bold text-on-surface">{title}</h2>
      <div className="space-y-2 overflow-x-auto text-on-surface-variant [&_li]:ml-5 [&_li]:list-disc [&_table]:w-full [&_table]:min-w-[520px] [&_table]:border-collapse [&_td]:border [&_td]:border-outline-variant [&_td]:p-2 [&_td]:align-top [&_th]:border [&_th]:border-outline-variant [&_th]:p-2 [&_th]:text-left">
        {children}
      </div>
    </section>
  );
}

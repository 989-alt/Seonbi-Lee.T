import type { ReactNode } from "react";

export function FortuneHero({ image, title, desc, children }: { image: "hub" | "saju" | "tarot"; title: ReactNode; desc: string; children?: ReactNode }) {
  return (
    <section className="fx-hero">
      <picture>
        <source media="(max-width: 767px)" srcSet={`/fortune/hero-${image}-m.webp`} />
        <img src={`/fortune/hero-${image}.webp`} alt="" fetchPriority="high" />
      </picture>
      <div className="fx-hero-inner">
        <h1>{title}</h1>
        <p>{desc}</p>
        {children && <div className="mt-7 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  );
}

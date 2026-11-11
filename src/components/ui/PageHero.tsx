import type { ReactNode } from "react";

/** 방구석게이머 공용 페이지 머리: 밤의 방 배너 + 픽셀 라벨 */
export function PageHero({ label, title, desc, action, image }: { label: string; title: ReactNode; desc?: ReactNode; action?: ReactNode; image?: { src: string; alt: string } }) {
  return (
    <section className="relative overflow-hidden rounded-[18px] bg-night px-6 py-10 text-white sm:px-10 sm:py-12">
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(rgba(91,224,138,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(91,224,138,0.06)_1px,transparent_1px)] bg-[size:24px_24px]"
      />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 max-w-3xl flex-1 flex-col gap-3">
          <span className="font-pixel text-[13px] tracking-[0.12em] text-mint">{label}</span>
          <h1 className="m-0 font-pixel text-[34px] leading-[1.25] font-bold text-white sm:text-[44px]">{title}</h1>
          {desc && <p className="m-0 text-[16px] leading-[1.7] text-lilac sm:text-[17px]">{desc}</p>}
        </div>
        <div className="flex flex-none items-end gap-4">
          {action}
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image.src} alt={image.alt} width={180} height={180} className="hidden h-[150px] w-[150px] object-contain sm:block lg:h-[180px] lg:w-[180px]" />
          )}
        </div>
      </div>
    </section>
  );
}

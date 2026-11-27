import Link from "next/link";

/** 홈 화면의 사주방·타로방 입구 */
export function FortuneCard() {
  return (
    <section aria-labelledby="fortune-card-title" className="relative isolate min-w-0 overflow-hidden rounded-[12px] bg-night-deep text-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/fortune/hero-hub-m.webp" alt="" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover object-[60%_0%]" />
      <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-night-deep via-night-deep/75 to-transparent" />
      <div className="px-[22px] pt-[190px] pb-5">
        <h2 id="fortune-card-title" className="m-0 font-pixel text-lg font-bold">쉬는 시간, 운세 한 판</h2>
        <p className="m-0 mt-1 text-sm leading-[1.6] text-lilac">78장을 직접 섞는 타로방, 여덟 글자로 보는 사주방. 저장 없이 재미로만.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/fortune/tarot" className="inline-flex min-h-[44px] items-center rounded-[8px] bg-mint px-4 text-sm font-bold text-night hover:brightness-110">타로방</Link>
          <Link href="/fortune/saju" className="inline-flex min-h-[44px] items-center rounded-[8px] border border-lilac px-4 text-sm font-bold text-white hover:border-mint hover:text-mint">사주방</Link>
          <Link href="/fortune" className="inline-flex min-h-[44px] items-center px-2 text-sm font-bold text-mint hover:underline">오늘의 카드 뒤집기</Link>
        </div>
      </div>
    </section>
  );
}

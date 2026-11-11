import Link from "next/link";

export function PlayerCard() {
  return (
    <section aria-label="만든 사람" className="flex min-w-0 flex-[1_1_300px] items-center gap-4 rounded-[12px] bg-night px-[22px] py-5 text-[#edeaf7]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/launcher/char-pick.webp" alt="손가락으로 가리키며 윙크하는 방구석게이머 캐릭터" width={110} height={110} className="h-[110px] w-[110px] flex-none object-contain" />
      <div className="flex flex-col gap-[6px]">
        <span className="font-pixel text-xs text-mint">PLAYER 1</span>
        <span className="font-pixel text-lg font-bold">방구석게이머</span>
        <span className="text-sm leading-[1.6] text-lilac">초등교사. 방구석에서 수업용 게임과 업무 도구를 만들어요.</span>
        <div className="mt-1 flex flex-wrap gap-4">
          <Link href="/about" className="text-sm font-bold text-mint">프로필 보기 →</Link>
          <Link href="/contact" className="text-sm font-bold text-lilac hover:text-white">앱 제안하기 →</Link>
        </div>
      </div>
    </section>
  );
}

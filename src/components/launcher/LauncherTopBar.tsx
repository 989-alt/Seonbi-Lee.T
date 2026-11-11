import Link from "next/link";

export function LauncherTopBar({ onIntro }: { onIntro?: () => void }) {
  return (
    <header className="bg-night text-[#edeaf7]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
        <Link href="/" className="flex items-center gap-[10px] text-[#edeaf7]">
          <span aria-hidden className="flex h-[30px] w-[30px] items-center justify-center rounded-[4px] bg-mint font-pixel font-bold text-night">▣</span>
          <span className="font-pixel text-lg font-bold">방구석게이머</span>
          <span className="ml-1 hidden font-pixel text-xs text-[#a99fc9] sm:inline">CLASSROOM LAUNCHER</span>
        </Link>
        <nav aria-label="상단 메뉴" className="flex flex-wrap gap-1 text-sm">
          <Link href="/" className="border-b-2 border-mint px-3 py-2 font-bold text-white">라이브러리</Link>
          <Link href="/news" className="px-3 py-2 text-lilac hover:text-white">AI 뉴스</Link>
          <Link href="/learn" className="px-3 py-2 text-lilac hover:text-white">배우기</Link>
          <Link href="/contact" className="px-3 py-2 text-lilac hover:text-white">앱 제안·문의</Link>
          {onIntro && (
            <button type="button" onClick={onIntro} className="px-3 py-2 text-lilac hover:text-white">↺ 인트로</button>
          )}
        </nav>
      </div>
    </header>
  );
}

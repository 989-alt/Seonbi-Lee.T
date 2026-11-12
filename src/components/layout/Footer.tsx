import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full py-8 px-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-night border-t border-night-line relative z-10 mt-auto">
      <div className="font-[family-name:var(--font-label)] text-[11px] tracking-widest text-lilac">
        © {year} 이선학(방구석게이머) · All rights reserved
      </div>
      <div className="flex gap-6 font-[family-name:var(--font-label)] text-[11px] tracking-widest uppercase text-[#a99fc9]">
        <Link href="/privacy" className="font-bold hover:text-mint transition-colors">
          개인정보처리방침
        </Link>
        <Link href="/terms" className="hover:text-mint transition-colors">
          이용약관
        </Link>
        <Link
          href="/admin"
          className="hover:text-mint transition-colors"
          aria-label="관리자 페이지"
        >
          ADMIN
        </Link>
      </div>
    </footer>
  );
}

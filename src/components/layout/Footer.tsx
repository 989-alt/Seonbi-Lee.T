import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full py-8 px-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-black border-t border-neutral-900 relative z-10 mt-auto">
      <div className="font-[family-name:var(--font-label)] text-[10px] tracking-widest uppercase text-primary">
        © {year} SEONBI&apos;S LAB // ALL RIGHTS RESERVED
      </div>
      <div className="flex gap-6 font-[family-name:var(--font-label)] text-[10px] tracking-widest uppercase text-neutral-600">
        <span>STATUS: ACTIVE</span>
        <span>PORT: 8080</span>
        <Link
          href="/admin"
          className="hover:text-primary transition-colors"
          aria-label="관리자 페이지"
        >
          ADMIN
        </Link>
      </div>
    </footer>
  );
}

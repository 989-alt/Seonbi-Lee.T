"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/projects", label: "프로젝트" },
  { href: "/news", label: "AI 뉴스" },
  { href: "/resources", label: "자료실" },
  { href: "/about", label: "소개" },
  { href: "/contact", label: "연락" },
];

export function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="stagger stagger-1 fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-[#0e0e0f]/80 backdrop-blur-2xl border-b border-white/5">
        <Link
          href="/"
          className="font-[family-name:var(--font-headline)] text-xl font-bold tracking-tighter text-primary drop-shadow-[0_0_10px_#8ff5ff] min-h-[44px] flex items-center"
        >
          SEONBI&apos;S LAB
        </Link>

        <nav className="hidden md:flex gap-8" aria-label="주요 탐색">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-[family-name:var(--font-label)] tracking-widest uppercase text-xs pb-1 min-h-[44px] flex items-center transition-colors ${
                  active
                    ? "text-primary border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 text-primary"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <span
            aria-hidden="true"
            className={`block w-6 h-[2px] bg-current transition-transform duration-300 ${
              open ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            aria-hidden="true"
            className={`block w-6 h-[2px] bg-current transition-opacity duration-200 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            aria-hidden="true"
            className={`block w-6 h-[2px] bg-current transition-transform duration-300 ${
              open ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>

        <div
          aria-hidden="true"
          className="bg-gradient-to-r from-transparent via-cyan-900/20 to-transparent h-[1px] w-full absolute bottom-0 left-0"
        />
      </header>

      {/* Mobile menu — rendered as sibling of header to escape backdrop-filter containing block */}
      <div
        id="mobile-menu"
        style={{ backgroundColor: "#0e0e0f" }}
        className={`md:hidden fixed top-[72px] left-0 right-0 bottom-0 z-40 flex flex-col transition-opacity duration-200 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <nav className="flex flex-col px-6 py-6 gap-2" aria-label="모바일 탐색">
          {NAV_ITEMS.map((item, idx) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-[family-name:var(--font-label)] tracking-widest uppercase text-sm py-4 border-b border-outline-variant/20 transition-colors ${
                  active ? "text-primary" : "text-on-surface"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span className="text-primary/40 mr-3">
                  {String(idx + 1).padStart(3, "0")}//
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

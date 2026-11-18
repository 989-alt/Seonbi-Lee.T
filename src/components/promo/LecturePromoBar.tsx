"use client";

import { useEffect, useState } from "react";
import { LECTURE, closePromo, isPromoClosed } from "@/lib/promo/lecture";

function store(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** 첫 화면 맨 위 강의 공지 띠(A1). ✕로 닫으면 이 강의에 대해서는 다시 뜨지 않는다. */
export function LecturePromoBar() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!isPromoClosed(store())) setShow(true);
  }, []);
  if (!show) return null;
  return (
    <aside aria-label="강의 소식" data-lecture-promo className="bg-mint text-night">
      <div className="flex items-center gap-3 px-4 py-2 sm:gap-4 sm:px-6">
        <span className="hidden flex-none rounded-[4px] bg-night px-2 py-1 font-pixel text-[11px] font-bold tracking-[0.1em] text-mint sm:inline">
          NEW QUEST
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-pixel text-[13px] font-bold sm:text-[15px]">
            비바샘 연수 「{LECTURE.title}」
          </span>
          <span className="truncate text-[11px] text-[#1f5a37] sm:text-xs">
            {LECTURE.meta} | {LECTURE.summary}
          </span>
        </span>
        <a
          href={LECTURE.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-none rounded-[6px] bg-night px-3 py-2 font-pixel text-[13px] font-bold whitespace-nowrap text-white hover:brightness-110 sm:px-4"
        >
          강의 보러 가기 ▶
        </a>
        <button
          type="button"
          aria-label="강의 소식 닫기"
          onClick={() => {
            closePromo(store());
            setShow(false);
          }}
          className="flex h-9 w-9 flex-none items-center justify-center rounded-[6px] text-lg text-night hover:bg-night/10"
        >
          ✕
        </button>
      </div>
    </aside>
  );
}

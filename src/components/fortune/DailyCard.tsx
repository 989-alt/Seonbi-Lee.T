"use client";

import { useState } from "react";
import Link from "next/link";
import { cardById, CARD_BACK, type TarotCard } from "@/data/fortune/tarot-cards";
import { dailyCardId } from "@/lib/fortune/tarot/deck";
import { CardFace } from "./CardFace";

/** 이 기기에서만 쓰는 무작위 ID. 저장소가 막혀 있으면 오늘 하루 모두 같은 카드 */
function deviceId(): string {
  try {
    const k = "bg_fortune_id";
    let v = localStorage.getItem(k);
    if (!v) localStorage.setItem(k, (v = crypto.randomUUID()));
    return v;
  } catch {
    return "guest";
  }
}

export function DailyCard({ day }: { day: string }) {
  const [card, setCard] = useState<TarotCard | null>(null);
  const [open, setOpen] = useState(false);

  const reveal = () => {
    if (open) return;
    const c = cardById(dailyCardId(deviceId(), day));
    setCard(c);
    // 앞면 그림을 먼저 받아 둔 뒤 뒤집는다
    const img = new Image();
    img.onload = img.onerror = () => setOpen(true);
    img.src = c.front;
  };

  return (
    <section aria-labelledby="daily-title" className="fx-wrap mt-12 grid items-center gap-10 md:grid-cols-[auto_1fr] md:gap-16">
      <button type="button" className="fx-daily mx-auto" onClick={reveal} aria-disabled={open} aria-label={open && card ? `오늘의 카드: ${card.nameKo}` : "오늘의 카드 뒤집기"}>
        <span className="fx-flip" data-open={open}>
          <span className="fx-side fx-back">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={CARD_BACK} alt="" draggable={false} />
          </span>
          <span className="fx-side fx-front">{card && <CardFace card={card} reversed={false} />}</span>
        </span>
      </button>
      <div aria-live="polite">
        <h2 id="daily-title" className="fx-h2">{open && card ? `오늘은 ‘${card.nameKo}’ 카드` : "하루 한 번, 오늘의 카드"}</h2>
        {open && card ? (
          <div className="fx-reading mt-4 flex flex-col gap-4">
            <p className="m-0 text-[14px] font-bold text-[#e8c77a]">{card.keywords}</p>
            <p className="fx-body">{card.upright}</p>
            <p className="fx-body"><strong className="text-mint">오늘 해 볼 일</strong> {card.doUpright}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/fortune/tarot" className="fx-btn fx-btn-line">78장으로 더 물어보기</Link>
            </div>
          </div>
        ) : (
          <p className="fx-body mt-4">카드를 누르면 뒤집혀요. 같은 기기에서는 오늘 하루 같은 카드가 나와요. 수업 시작 전, 숨 한 번 고르고 열어 보세요.</p>
        )}
      </div>
    </section>
  );
}

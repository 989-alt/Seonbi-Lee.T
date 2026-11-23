import type { Metadata } from "next";
import Link from "next/link";
import { DailyCard } from "@/components/fortune/DailyCard";
import { FortuneHero } from "@/components/fortune/FortuneHero";
import { Notice } from "@/components/fortune/Notice";
import { Recommended } from "@/components/fortune/Recommended";
import { seoulToday } from "@/lib/fortune/saju/core";

const title = "오늘의 운세 // 방구석게이머 교실 놀이터";
const description = "쉬는 시간에 재미로 보는 사주방과 78장 타로방";
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/fortune" },
  openGraph: { title, description, url: "/fortune", images: [{ url: "/fortune/og.jpg", width: 1200, height: 630, alt: "타로 카드를 든 방구석게이머 캐릭터" }] },
};

export default function FortunePage() {
  const d = seoulToday();
  return (
    <>
      <FortuneHero image="hub" title={<>쉬는 시간,<br />운세 한 판</>} desc="사주방에서 나를 읽고, 타로방에서 오늘을 물어보세요. 가입도 저장도 없이 바로 시작해요.">
        <Link href="/fortune/tarot" className="fx-btn fx-btn-main">타로방 들어가기</Link>
        <Link href="/fortune/saju" className="fx-btn fx-btn-line">사주방 들어가기</Link>
      </FortuneHero>
      <DailyCard day={`${d.y}-${d.m}-${d.d}`} />
      <section aria-label="운세 방" className="fx-wrap mt-16 grid gap-5 md:grid-cols-[1.25fr_1fr]">
        <Link href="/fortune/tarot" className="fx-door">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fortune/hero-tarot-m.webp" alt="" loading="lazy" />
          <h2 className="fx-h2">타로방</h2>
          <p className="m-0 mt-2 max-w-[34em] text-[15.5px] leading-[1.7] text-[#e4dff4]">78장을 직접 섞고 펼쳐서, 끌리는 카드를 고르세요. 과거·현재·미래부터 켈틱 크로스까지.</p>
        </Link>
        <Link href="/fortune/saju" className="fx-door">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fortune/hero-saju-m.webp" alt="" loading="lazy" />
          <h2 className="fx-h2">사주방</h2>
          <p className="m-0 mt-2 text-[15.5px] leading-[1.7] text-[#e4dff4]">생년월일로 여덟 글자를 펼치고 성향, 오늘의 운, 잘 맞는 사람까지 살펴보세요.</p>
        </Link>
      </section>
      <Recommended room="hub" />
      <Notice />
    </>
  );
}

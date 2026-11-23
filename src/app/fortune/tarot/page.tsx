import type { Metadata } from "next";
import { FortuneHero } from "@/components/fortune/FortuneHero";
import { Notice } from "@/components/fortune/Notice";
import { Recommended } from "@/components/fortune/Recommended";
import { TarotRoom } from "@/components/fortune/TarotRoom";

const title = "타로방 // 방구석게이머 교실 놀이터";
const description = "78장을 직접 섞고 펼쳐 고르는 타로 리딩";
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/fortune/tarot" },
  openGraph: { title, description, url: "/fortune/tarot", images: [{ url: "/fortune/og.jpg", width: 1200, height: 630, alt: "타로 카드를 든 방구석게이머 캐릭터" }] },
};

export default function TarotPage() {
  return (
    <>
      <FortuneHero image="tarot" title="타로방" desc="마음속에 질문 하나를 떠올리고, 78장 가운데 손이 가는 카드를 골라 보세요.">
        <a href="#tarot-room" className="fx-btn fx-btn-main">카드 펼치러 가기</a>
      </FortuneHero>
      <TarotRoom />
      <Recommended room="tarot" />
      <Notice />
    </>
  );
}

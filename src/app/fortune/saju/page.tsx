import type { Metadata } from "next";
import { FortuneHero } from "@/components/fortune/FortuneHero";
import { Notice } from "@/components/fortune/Notice";
import { Recommended } from "@/components/fortune/Recommended";
import { SajuRoom } from "@/components/fortune/SajuRoom";
import { seoulToday } from "@/lib/fortune/saju/core";

const title = "사주방 // 방구석게이머 교실 놀이터";
const description = "생년월일로 보는 성향, 오늘의 운, 나와 잘 맞는 사람";
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/fortune/saju" },
  openGraph: { title, description, url: "/fortune/saju", images: [{ url: "/fortune/og.jpg", width: 1200, height: 630, alt: "타로 카드를 든 방구석게이머 캐릭터" }] },
};

export default function SajuPage() {
  return (
    <>
      <FortuneHero image="saju" title={<>방구석게이머의<br />사주방</>} desc="태어난 날의 여덟 글자에 담긴 성향과 흐름, 그리고 잘 맞는 사람의 힌트를 찾아보세요.">
        <a href="#saju-form" className="fx-btn fx-btn-main">사주 펼쳐 보기</a>
      </FortuneHero>
      <SajuRoom today={seoulToday()} />
      <Recommended room="saju" />
      <Notice />
    </>
  );
}

import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { DormsLibrary } from "@/components/dorms/DormsLibrary";
import { getDormsFeed } from "@/lib/dorms/feed";

export const metadata: Metadata = {
  title: "도름스 서재 // 방구석게이머",
  description: "교사 커뮤니티 도름스(dorms.school)에 올린 앱·게임·글·자료",
  alternates: { canonical: "/dorms" },
};

export default async function DormsPage() {
  const feed = await getDormsFeed();
  return (
    <main className="flex-grow pt-24 px-6 md:px-12 lg:px-24 pb-20 max-w-[1440px] mx-auto w-full">
      <div className="mb-12 mt-6">
        <PageHero
          label="GUILD · 도름스 서재"
          title="도름스 서재"
          desc="교사 커뮤니티 도름스(dorms.school)에 올린 앱·게임·글·자료를 모았어요. 누르면 도름스에서 열려요."
          image={{ src: "/launcher/char-pick.webp", alt: "손가락으로 가리키는 방구석게이머" }}
        />
      </div>
      <DormsLibrary feed={feed} />
    </main>
  );
}

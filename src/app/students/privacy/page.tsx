import type { Metadata } from "next";
import Link from "next/link";
import { PrivacyContent } from "@/components/legal/PrivacyContent";
import { StudentModeMark } from "@/components/students/StudentModeMark";

export const metadata: Metadata = {
  title: "개인정보처리방침 // 방구석게이머 교실 놀이터",
  alternates: { canonical: "/privacy" },
  robots: { index: false },
};

/** 학생 화면에서 연 개인정보처리방침: 공용 메뉴 없이 학생 목록으로만 돌아간다 */
export default function StudentPrivacyPage() {
  return (
    <div className="min-h-[100dvh] bg-surface">
      <StudentModeMark />
      <header className="bg-night px-6 py-3 sm:px-10">
        <Link href="/students" className="font-pixel text-sm font-bold text-white hover:text-mint">
          ← 교실 놀이터로 돌아가기
        </Link>
      </header>
      <PrivacyContent student />
    </div>
  );
}

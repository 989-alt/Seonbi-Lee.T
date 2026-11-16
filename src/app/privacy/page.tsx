import type { Metadata } from "next";
import { PrivacyContent } from "@/components/legal/PrivacyContent";

export const metadata: Metadata = {
  title: "개인정보처리방침 // 방구석게이머",
  description: "방구석게이머 교실 놀이터(s-edu.ai.kr)가 처리하는 개인정보의 항목, 목적, 보관 기간과 이용자의 권리",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}

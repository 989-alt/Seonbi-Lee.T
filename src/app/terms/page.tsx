import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { OPERATOR } from "@/lib/site";

export const metadata: Metadata = {
  title: "이용약관 // 방구석게이머",
  description: "방구석게이머(s-edu.ai.kr) 이용 조건",
  alternates: { canonical: "/terms" },
};

const EFFECTIVE = "2026년 11월 12일";

export default function TermsPage() {
  return (
    <LegalPage label="TERMS · 이용약관" title="이용약관" desc={`방구석게이머(s-edu.ai.kr) 이용 조건입니다. 시행일: ${EFFECTIVE}`}>
      <LegalSection title="1. 목적">
        <p>이 약관은 {OPERATOR}(이하 운영자)이 제공하는 방구석게이머 웹사이트와, 여기에 연결된 교실 게임·업무 도구·학습 자료(이하 서비스)의 이용 조건을 정합니다.</p>
      </LegalSection>
      <LegalSection title="2. 서비스 이용">
        <ul>
          <li>서비스는 회원가입 없이 무료로 이용할 수 있습니다.</li>
          <li>교실 수업, 연수, 개인 학습 같은 비영리 교육 목적이면 자유롭게 이용할 수 있습니다.</li>
          <li>운영자는 미리 알린 뒤 서비스 내용을 바꾸거나 중단할 수 있습니다. 긴급한 경우에는 나중에 알릴 수 있습니다.</li>
        </ul>
      </LegalSection>
      <LegalSection title="3. 저작권">
        <ul>
          <li>사이트의 글, 그림, 캐릭터, 교안 등 저작물의 권리는 운영자 또는 각 원저작자에게 있습니다.</li>
          <li>교육 목적의 수업 활용은 허용합니다. 재배포, 판매, 출처를 지운 게시는 운영자의 허락을 받아야 합니다.</li>
          <li>외부 사이트로 연결되는 앱과 자료는 해당 사이트의 약관을 따릅니다.</li>
        </ul>
      </LegalSection>
      <LegalSection title="4. 금지 행위">
        <ul>
          <li>서비스에 과도한 요청을 보내거나 보안 장치를 우회하는 행위</li>
          <li>제보함에 다른 사람의 개인정보, 욕설, 광고, 불법 정보를 보내는 행위</li>
          <li>운영자의 허락 없이 서비스를 상업적으로 이용하는 행위</li>
        </ul>
      </LegalSection>
      <LegalSection title="5. 책임의 한계">
        <p>운영자는 서비스를 안정적으로 제공하려고 노력합니다. 다만 무료 서비스이므로 오류가 없거나 항상 이용할 수 있다고 보장하지 않습니다. 운영자의 고의나 중대한 과실이 없는 손해에는 책임을 지지 않습니다.</p>
      </LegalSection>
      <LegalSection title="6. 개인정보">
        <p>
          개인정보 처리는 <Link href="/privacy" className="text-primary underline">개인정보처리방침</Link>을 따릅니다.
        </p>
      </LegalSection>
      <LegalSection title="7. 문의와 분쟁">
        <p>
          서비스 관련 문의는 <Link href="/contact" className="text-primary underline">제보함</Link>으로 보내 주세요. 이 약관은 대한민국 법을 따릅니다.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

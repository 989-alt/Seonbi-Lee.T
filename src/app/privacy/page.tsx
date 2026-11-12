import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { OPERATOR } from "@/lib/site";

export const metadata: Metadata = {
  title: "개인정보처리방침 // 방구석게이머",
  description: "방구석게이머(s-edu.ai.kr)가 처리하는 개인정보의 항목, 목적, 보관 기간과 이용자의 권리",
  alternates: { canonical: "/privacy" },
};

const EFFECTIVE = "2026년 11월 12일";

export default function PrivacyPage() {
  return (
    <LegalPage
      label="PRIVACY · 개인정보처리방침"
      title="개인정보처리방침"
      desc={`${OPERATOR}이 운영하는 방구석게이머(s-edu.ai.kr)는 「개인정보 보호법」에 따라 이용자의 개인정보를 보호합니다. 시행일: ${EFFECTIVE}`}
    >
      <LegalSection title="1. 회원가입 없이 이용합니다">
        <p>이 사이트에는 회원가입 기능이 없습니다. 게임·도구·자료는 로그인 없이 이용할 수 있고, 관리자 계정은 운영자 1인만 사용합니다.</p>
      </LegalSection>

      <LegalSection title="2. 처리하는 개인정보와 목적, 보관 기간">
        <table>
          <thead>
            <tr><th>구분</th><th>항목</th><th>목적</th><th>보관 기간</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>제보함 문의</td>
              <td>제목, 문의 내용, 회신 이메일(선택)</td>
              <td>문의 확인과 답변</td>
              <td>답변을 마친 뒤 1년 이내 파기</td>
            </tr>
            <tr>
              <td>방문 집계</td>
              <td>브라우저에서 만든 무작위 식별값, 방문한 앱 이름, 방문 날짜</td>
              <td>앱별 방문자 수 통계</td>
              <td>통계를 제공하는 동안 보관, 서비스 종료 시 파기</td>
            </tr>
            <tr>
              <td>관리자 접속 기록</td>
              <td>관리자 계정 이메일, 접속 일시, IP 주소, 브라우저 정보, 수행한 작업</td>
              <td>관리자 계정 보호와 사고 조사</td>
              <td>1년</td>
            </tr>
            <tr>
              <td>사이트 접속 로그</td>
              <td>IP 주소, 접속 일시, 요청한 주소, 브라우저 정보(호스팅 업체가 자동 생성)</td>
              <td>보안 사고 대응과 장애 확인</td>
              <td>호스팅 업체(Vercel)의 보관 정책에 따라 자동 삭제</td>
            </tr>
          </tbody>
        </table>
        <p>방문 집계용 무작위 식별값은 이름·이메일 같은 정보와 연결하지 않습니다. 과도한 요청을 막으려고 IP 주소를 서버 메모리에서 잠시 쓰지만 저장하지 않습니다.</p>
      </LegalSection>

      <LegalSection title="3. 제3자 제공">
        <p>개인정보를 제3자에게 제공하지 않습니다. 법령에 특별한 규정이 있거나 수사기관이 법에 따라 요구하는 경우에만 예외로 합니다.</p>
      </LegalSection>

      <LegalSection title="4. 처리 위탁과 국외 이전">
        <p>서비스 운영에 아래 업체의 시스템을 사용합니다. 각 업체는 맡은 업무 외에 개인정보를 이용하지 않습니다.</p>
        <table>
          <thead>
            <tr><th>업체</th><th>업무</th><th>저장 위치</th></tr>
          </thead>
          <tbody>
            <tr><td>Vercel Inc.</td><td>웹사이트 호스팅, 접속 로그</td><td>일본(도쿄)·미국 등 Vercel 데이터센터</td></tr>
            <tr><td>Supabase Inc.</td><td>데이터베이스(방문 집계, 관리자 접속 기록), 파일 저장</td><td>일본(도쿄)</td></tr>
            <tr><td>네이버(주)</td><td>제보함 문의 메일 전송·보관</td><td>대한민국</td></tr>
          </tbody>
        </table>
        <p>국외 이전은 이용자가 사이트에 접속하거나 문의를 보낼 때 네트워크로 이루어집니다. 원하지 않으면 제보함을 쓰지 않거나 브라우저 저장소를 차단할 수 있습니다. 이때 방문 집계에서만 빠지고 사이트 이용은 그대로 할 수 있습니다.</p>
      </LegalSection>

      <LegalSection title="5. 브라우저 저장소와 쿠키">
        <ul>
          <li>방문 집계와 인트로 표시 여부를 기억하려고 브라우저 localStorage를 사용합니다. 브라우저 설정에서 언제든 지울 수 있습니다.</li>
          <li>광고·추적용 쿠키는 쓰지 않습니다. 로그인 유지용 쿠키는 관리자에게만 설정됩니다.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. 파기 절차와 방법">
        <p>보관 기간이 지나거나 목적을 이룬 개인정보는 지체 없이 파기합니다. 전자 파일은 복구할 수 없는 방법으로 삭제합니다.</p>
      </LegalSection>

      <LegalSection title="7. 이용자의 권리">
        <p>
          이용자는 자신의 개인정보를 열람, 정정, 삭제하거나 처리 정지를 요구할 수 있습니다.{" "}
          <Link href="/contact" className="text-primary underline">제보함</Link>으로 요청하면 본인 확인 뒤 요청받은 날부터 10일 이내에 처리하고 결과를 알려 드립니다. 거절하거나 늦어지면 그 이유를 알려 드립니다. 만 14세 미만 아동은 보호자의 동의를 받아 제보함을 이용해 주세요.
        </p>
      </LegalSection>

      <LegalSection title="8. 안전성 확보 조치">
        <ul>
          <li>모든 통신은 HTTPS(TLS 1.2 이상)로 암호화합니다.</li>
          <li>데이터베이스는 행 단위 접근 제어(RLS)로 공개 자료만 읽을 수 있게 막습니다.</li>
          <li>관리자 로그인에는 실패 횟수 제한, 2단계 인증, 미사용 시 자동 로그아웃을 적용하고 접속 기록을 보관합니다.</li>
        </ul>
      </LegalSection>

      <LegalSection title="9. 개인정보 보호책임자">
        <p>
          책임자: {OPERATOR} · 연락: <Link href="/contact" className="text-primary underline">제보함</Link>
        </p>
        <p>개인정보 침해 신고·상담: 개인정보침해신고센터(privacy.kisa.or.kr, 국번 없이 118), 개인정보분쟁조정위원회(kopico.go.kr, 1833-6972)</p>
      </LegalSection>

      <LegalSection title="10. 방침 변경">
        <p>이 방침을 바꾸면 시행 7일 전에 이 페이지에 알립니다. 시행일: {EFFECTIVE}</p>
      </LegalSection>
    </LegalPage>
  );
}

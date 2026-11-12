import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { OPERATOR, PRIVACY_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "개인정보처리방침 // 방구석게이머",
  description: "방구석게이머 교실 놀이터(s-edu.ai.kr)가 처리하는 개인정보의 항목, 목적, 보관 기간과 이용자의 권리",
  alternates: { canonical: "/privacy" },
};

const EFFECTIVE = "2026년 11월 12일";

export default function PrivacyPage() {
  return (
    <LegalPage
      label="PRIVACY · 개인정보처리방침"
      title="개인정보처리방침"
      desc={`${OPERATOR}이 운영하는 방구석게이머 교실 놀이터(s-edu.ai.kr)는 「개인정보 보호법」에 따라 이용자의 개인정보를 보호합니다. 이 방침은 놀이터와 놀이터에 수록한 앱 전체에 적용됩니다. 시행일: ${EFFECTIVE}`}
    >
      <LegalSection title="1. 서비스 구성과 회원가입">
        <p>교실 놀이터에는 회원가입 기능이 없습니다. 모든 앱은 로그인 없이 이용하며, 관리자 계정은 운영자 1인만 사용합니다. 수록 앱은 이용 대상에 따라 둘로 나눕니다.</p>
        <table>
          <thead>
            <tr><th>구분</th><th>수록 앱</th><th>개인정보 원칙</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>학생용 앱</td>
              <td>원의 넓이 탐험대, 말빛 한울, 천체 시뮬레이터 COSMIC-EDU, 한 판! 돌리고 뒤집기, 국기 따라 그리기, 숫자야구</td>
              <td>학생 이름·연락처 등 학생을 알아볼 수 있는 정보를 받지 않습니다. 외부 AI로 정보를 보내지 않습니다.</td>
            </tr>
            <tr>
              <td>교사용 도구</td>
              <td>자리바꾸기 프로그램, 전담 시간표 편성 도구, AI 평어·행발 생성 도구, AI 미술 도안 워크스페이스, CineEdu 영화 학습지, 퀴즈 생성기</td>
              <td>교사가 수업 준비·업무에 쓰는 도구입니다. AI 기능은 교사가 입력한 내용만 교사가 고른 AI 서비스로 보내며, 학생 이름은 입력하지 않도록 안내합니다.</td>
            </tr>
          </tbody>
        </table>
        <p>놀이터에 함께 소개하는 아이스크림(i-scream) 제공 앱은 아이스크림 서비스로 연결되며, 그 앱의 개인정보 처리는 아이스크림의 개인정보처리방침을 따릅니다.</p>
        <p><b>앞으로 추가하는 모든 수록 앱에도 이 방침과 같은 기준을 적용합니다. 학생용 앱은 학생을 알아볼 수 있는 정보를 받지 않고 외부 AI로 정보를 보내지 않으며, 교사용 도구는 학생 이름을 입력받지 않습니다. 모든 앱은 수록 전에 보안 점검을 거칩니다. 이 기준을 벗어나는 앱은 방침을 먼저 고치고 시행 7일 전에 알린 뒤 수록합니다.</b></p>
      </LegalSection>

      <LegalSection title="2. 처리하는 개인정보와 목적, 보관 기간">
        <p><b>가. 놀이터 공통</b></p>
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
              <td>호스팅 업체의 보관 정책에 따라 자동 삭제</td>
            </tr>
          </tbody>
        </table>
        <p><b>나. 학생용 앱</b></p>
        <table>
          <thead>
            <tr><th>앱</th><th>항목</th><th>목적</th><th>보관 기간</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>숫자야구</td>
              <td>서버가 자동으로 붙인 별명(예: 용감한 타자 42), 고른 캐릭터, 게임 방 코드, 추측 기록</td>
              <td>여러 명이 함께하는 게임 진행</td>
              <td>게임 방이 끝나면 자동 삭제</td>
            </tr>
            <tr>
              <td>그 밖의 학생용 앱</td>
              <td>게임 진행 상황(브라우저에만 저장)</td>
              <td>이어서 하기</td>
              <td>이용자가 브라우저 저장소를 지울 때까지</td>
            </tr>
          </tbody>
        </table>
        <p><b>다. 교사용 도구</b></p>
        <table>
          <thead>
            <tr><th>도구</th><th>외부로 보내는 내용</th><th>보내는 곳</th><th>보관</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>AI 평어·행발 생성 도구</td>
              <td>평가계획 문서(학교명·학년 포함 가능), 출석번호별 성취수준, 교사가 고른 특성 항목, 교사가 쓴 활동 문장</td>
              <td>교사가 고른 AI 서비스(교사 본인 API 키)</td>
              <td>결과는 교사 브라우저에만 저장</td>
            </tr>
            <tr>
              <td>AI 미술 도안 워크스페이스</td>
              <td>교사가 쓴 도안 설명</td>
              <td>Google Gemini(교사 본인 API 키)</td>
              <td>교사 브라우저에만 저장</td>
            </tr>
            <tr>
              <td>CineEdu 영화 학습지</td>
              <td>교사가 고른 영화 제목·단원 정보</td>
              <td>Google Gemini, TMDB(운영자 API 키)</td>
              <td>운영자 서버에 저장하지 않음</td>
            </tr>
            <tr>
              <td>퀴즈 생성기</td>
              <td>교사가 올린 학습 자료(문서·영상) 또는 영상 주소</td>
              <td>Google Gemini(교사 본인 API 키), 분석 서버(Render)</td>
              <td>분석 후 서버에 남기지 않음</td>
            </tr>
            <tr>
              <td>자리바꾸기·전담 시간표</td>
              <td>외부로 보내지 않음(학생 이름 등은 교사 브라우저에만 저장)</td>
              <td>없음</td>
              <td>교사 브라우저에만 저장</td>
            </tr>
          </tbody>
        </table>
        <p>교사용 도구에는 학생 이름, 학생이 나오는 사진·영상 등 학생을 알아볼 수 있는 정보를 입력하지 마세요. 교사 본인 API 키로 보낸 내용은 교사가 가입한 AI 서비스의 약관에 따라 처리됩니다.</p>
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
            <tr><td>Vercel Inc.</td><td>놀이터와 일부 앱 호스팅, 접속 로그</td><td>일본(도쿄)·미국 등 Vercel 데이터센터</td></tr>
            <tr><td>GitHub, Inc.</td><td>일부 앱 호스팅(GitHub Pages), 접속 로그</td><td>미국 등</td></tr>
            <tr><td>Cloudflare, Inc.</td><td>숫자야구 게임 서버</td><td>Cloudflare 데이터센터(이용자와 가까운 지역)</td></tr>
            <tr><td>Supabase Inc.</td><td>데이터베이스(방문 집계, 관리자 접속 기록), 파일 저장</td><td>일본(도쿄)</td></tr>
            <tr><td>Render Services, Inc.</td><td>퀴즈 생성기 분석 서버</td><td>미국</td></tr>
            <tr><td>Google LLC</td><td>교사용 도구의 AI 기능(Gemini)</td><td>미국 등</td></tr>
            <tr><td>Anthropic PBC, OpenAI, L.L.C.</td><td>AI 평어·행발 생성 도구에서 교사가 고른 경우의 AI 기능</td><td>미국</td></tr>
            <tr><td>TMDB(The Movie Database)</td><td>CineEdu 영화 정보 검색(개인정보 전송 없음)</td><td>미국</td></tr>
            <tr><td>네이버(주)</td><td>제보함 문의 메일 전송·보관</td><td>대한민국</td></tr>
          </tbody>
        </table>
        <p>국외 이전은 이용자가 사이트·앱에 접속하거나 문의를 보내거나 교사가 AI 기능을 실행할 때 네트워크로 이루어집니다. 원하지 않으면 제보함과 교사용 AI 기능을 쓰지 않거나 브라우저 저장소를 차단할 수 있으며, 학생용 앱 이용에는 지장이 없습니다. 학생용 앱은 외부 AI 서비스로 어떤 정보도 보내지 않습니다.</p>
      </LegalSection>

      <LegalSection title="5. 브라우저 저장소와 쿠키">
        <ul>
          <li>방문 집계, 인트로 표시 여부, 게임 진행 상황, 교사용 도구의 설정과 결과를 기억하려고 브라우저 저장소(localStorage·sessionStorage)를 사용합니다. 브라우저 설정에서 언제든 지울 수 있습니다.</li>
          <li>교사용 도구에 넣은 API 키는 교사 브라우저에만 저장하며 운영자 서버로 보내지 않습니다.</li>
          <li>광고·추적용 쿠키는 쓰지 않습니다. 로그인 유지용 쿠키는 관리자에게만 설정됩니다.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. 파기 절차와 방법">
        <p>보관 기간이 지나거나 목적을 이룬 개인정보는 지체 없이 파기합니다. 전자 파일은 복구할 수 없는 방법으로 삭제합니다. 관리자 접속 기록은 매일 자동 작업으로 1년이 지난 기록을 삭제하고, 숫자야구 게임 기록은 방이 끝나면 자동으로 삭제합니다.</p>
      </LegalSection>

      <LegalSection title="7. 이용자의 권리">
        <p>
          이용자는 자신의 개인정보를 열람, 정정, 삭제하거나 처리 정지를 요구할 수 있습니다.{" "}
          보호책임자 이메일이나 <Link href="/contact" className="text-primary underline">제보함</Link>으로 요청하면 본인 확인 뒤 요청받은 날부터 10일 이내에 처리하고 결과를 알려 드립니다. 거절하거나 늦어지면 그 이유를 알려 드립니다. 학생용 앱은 학생을 알아볼 수 있는 정보를 받지 않습니다. 만 14세 미만 아동은 보호자의 동의를 받아 제보함을 이용해 주세요.
        </p>
      </LegalSection>

      <LegalSection title="8. 안전성 확보 조치">
        <ul>
          <li>모든 통신은 HTTPS(TLS 1.2 이상)로 암호화합니다.</li>
          <li>데이터베이스는 행 단위 접근 제어(RLS)로 공개 자료만 읽을 수 있게 막습니다.</li>
          <li>관리자 로그인에는 실패 횟수 제한, 2단계 인증, 미사용 시 자동 로그아웃을 적용하고 접속 기록을 보관합니다.</li>
          <li>새 앱은 학생 정보를 받지 않는지, 외부 전송이 있는지 보안 점검을 거친 뒤 수록합니다.</li>
        </ul>
      </LegalSection>

      <LegalSection title="9. 개인정보 보호책임자">
        <p>
          책임자: {OPERATOR} · 이메일: <a href={`mailto:${PRIVACY_EMAIL}`} className="text-primary underline">{PRIVACY_EMAIL}</a> · 또는 <Link href="/contact" className="text-primary underline">제보함</Link>
        </p>
        <p>개인정보 침해 신고·상담: 개인정보침해신고센터(privacy.kisa.or.kr, 국번 없이 118), 개인정보분쟁조정위원회(kopico.go.kr, 1833-6972)</p>
      </LegalSection>

      <LegalSection title="10. 방침 변경">
        <p>이 방침을 바꾸면 시행 7일 전에 이 페이지에 알립니다. 수록 앱을 추가해도 위 원칙을 따르는 경우에는 제1조의 앱 목록만 고칩니다. 시행일: {EFFECTIVE}</p>
      </LegalSection>
    </LegalPage>
  );
}

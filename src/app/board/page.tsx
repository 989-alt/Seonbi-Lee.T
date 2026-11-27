import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { BOARD_HOME, formatSize, getLatestRelease, type BoardRelease } from "@/lib/board/release";

const DESC = "바탕화면에 캘린더·시간표·급식·D-day를 띄우고, 메신저 쪽지에서 일정을 찾아 주는 교사용 Windows 프로그램 교실 위젯(보드) 소개와 설치 파일 내려받기";

export const metadata: Metadata = {
  title: "교실 보드 // 방구석게이머",
  description: DESC,
  alternates: { canonical: "/board" },
  openGraph: { title: "교실 보드 // 방구석게이머", description: DESC, url: "/board" },
};

/** 화면에 나오는 단추 글자 */
function Key({ children }: { children: ReactNode }) {
  return (
    <kbd className="mx-[2px] inline-block whitespace-nowrap rounded-[6px] border border-b-[3px] border-outline bg-white px-[7px] py-[1px] font-sans text-[0.92em] font-bold text-on-surface">
      {children}
    </kbd>
  );
}

function Download({ release }: { release: BoardRelease | null }) {
  if (!release) {
    return (
      <div className="flex flex-col gap-2">
        <a href={BOARD_HOME} className="rounded-[8px] bg-mint px-5 py-3 text-center font-pixel text-base font-bold text-night">
          ▼ 설치 파일 받기
        </a>
        <span className="text-center text-[13px] text-lilac">내려받기 페이지에서 받아요</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <a href={release.url} className="rounded-[8px] bg-mint px-5 py-3 text-center font-pixel text-base font-bold text-night">
        ▼ 설치 파일 받기
      </a>
      <span className="text-center text-[13px] text-lilac">
        v{release.version}
        {release.size ? ` · ${formatSize(release.size)}` : ""} · Windows
      </span>
    </div>
  );
}

const FEATURES: { tag: string; title: string; body: ReactNode }[] = [
  {
    tag: "BOARD",
    title: "바탕화면 보드",
    body: "캘린더, 다가오는 일정·마감, D-day, 메모, 시간표, 오늘의 급식, 알레르기 알림, 날씨·미세먼지, 바로가기, 시계, 뉴스, 환율·증시 가운데 쓸 것만 골라 바탕화면에 놓아요. 급식과 학교 행사는 학교를 고르면 나이스에서 받아 와요.",
  },
  {
    tag: "MESSENGER",
    title: "쪽지에서 일정 찾기",
    body: "선생님이 연 메신저 쪽지에서 날짜와 시각이 있는 일정을 찾아, 저장할지 확인 카드로 물어요. 방해 금지를 켜면 카드 없이 대기함에만 쌓여요.",
  },
  {
    tag: "TOOLS",
    title: "수업 도구 띠",
    body: "보드 위 한 줄 띠에 타이머, 뽑기(이름 없이 번호만), 알림장, 자리바꾸기, 3D 뽑기 단추가 놓여요. 도구 창은 작게·크게·화면 가득으로 바꿀 수 있어요.",
  },
  {
    tag: "TV",
    title: "TV 화면 · 수업 중 보호",
    body: "TV로 쓰는 화면을 정해 두면 그 화면에는 카드를 띄우지 않아요. 화면을 복제해 수업할 때는 일정·메모 같은 칸을 가려요. HDMI 분배기로 연결한 TV는 알아챌 수 없으니 수업 중에는 방해 금지를 켜 주세요.",
  },
  {
    tag: "LOOK",
    title: "꾸미기",
    body: "템플릿, 투명도, 밝기, 색, 배경 그림, 카드 모서리 둥글기(각지게부터 아주 둥글게까지)를 골라요. 위젯은 크기를 고르고 끌어서 자리를 옮겨요.",
  },
  {
    tag: "LIGHT",
    title: "가벼움",
    body: "켜 두고 잊어도 되도록 CPU 사용과 메모리를 줄였어요. 새 판이 나오면 알려 주고, 누르면 받아서 설치해요.",
  },
];

const PRIVACY: ReactNode[] = [
  <>메신저를 <b>조작하지 않아요</b>. 누르거나 보내지 않고, 선생님이 연 쪽지를 읽기만 해요.</>,
  <>쪽지와 학생 정보는 <b>PC 밖으로 나가지 않아요</b>.</>,
  <>인터넷을 쓰는 곳은 급식·학사일정(학교 이름 검색어, 학교 코드, 날짜), 날씨(좌표만), 환율·뉴스(뉴스 검색어만), 새 판 확인과 내려받기(보내는 값 없음), 바로가기 사이트의 아이콘 받기, 선생님이 직접 보내는 요청뿐이에요.</>,
  <>일정과 설정은 이 PC의 <code className="rounded bg-surface-container-high px-1">%LOCALAPPDATA%\교실위젯</code> 폴더에 저장돼요. 메모와 알림장도 이 PC에만 남아요.</>,
];

const STEPS: { title: string; screen?: string; items: ReactNode[] }[] = [
  {
    title: "설치 파일 받기",
    items: [
      <>이 페이지의 <Key>설치 파일 받기</Key>를 눌러요. 브라우저가 <code>teacher-widget-setup-버전.exe</code>를 내려받아요.</>,
      <><b>Edge</b>가 “일반적으로 다운로드되지 않습니다”라며 막으면: 다운로드 목록에서 그 파일의 <Key>…</Key> → <Key>유지</Key> → <Key>자세히 표시</Key> → <Key>그래도 계속</Key>.</>,
      <><b>Chrome</b>이 막으면: 다운로드 목록에서 그 파일 옆의 유지(또는 계속) 단추를 눌러요.</>,
    ],
  },
  {
    title: "설치 파일 열기",
    items: [<>내려받은 <code>teacher-widget-setup-버전.exe</code>를 두 번 눌러 열어요.</>],
  },
  {
    title: "Windows의 PC 보호",
    screen: "파란 창",
    items: [
      <>설치 파일에 코드 서명이 없어 Windows가 “알 수 없는 게시자”로 보고 이 창을 띄워요.</>,
      <><Key>추가 정보</Key>를 누르고, 아래에 나온 <Key>실행</Key>을 눌러요.</>,
    ],
  },
  {
    title: "사용자 계정 컨트롤",
    items: [
      <>관리자 권한 없이 내 계정에만 설치되도록 만들어져 보통은 이 창이 뜨지 않아요.</>,
      <>학교 PC 설정 때문에 뜨면 <Key>예</Key>를 눌러요.</>,
    ],
  },
  {
    title: "설치 마법사",
    screen: "설치 - 교실 위젯",
    items: [
      <><b>추가 작업 선택</b>: “윈도우를 켤 때 자동으로 시작”이 켜져 있어요. 원하지 않으면 끄고 <Key>다음(N) &gt;</Key>. 나중에 트레이 메뉴에서도 바꿀 수 있어요.</>,
      <><b>설치 준비 완료</b>: <Key>설치(I)</Key>.</>,
      <><b>설치 중</b>: 끝나면 교실 위젯이 바로 켜져요.</>,
      <><b>교실 위젯 설치 마법사 완료</b>: <Key>마침(F)</Key>.</>,
      <>설치 위치는 묻지 않아요. 내 계정의 프로그램 폴더에 들어가요.</>,
    ],
  },
  {
    title: "처음 켰을 때",
    items: [
      <>화면 오른쪽 아래 시계 옆(트레이)에 아이콘이 생겨요. 메뉴는 이 아이콘을 오른쪽 클릭해서 열어요.</>,
      <><b>교실 위젯 시작하기</b> 창에서 바탕화면에 올릴 위젯과 바로가기를 고르고(급식을 보려면 학교도 골라요) <Key>시작하기</Key>.</>,
      <>보드가 뜨고 사용법 안내가 한 곳씩 설명해요. <Key>다음</Key>·<Key>이전</Key>·<Key>건너뛰기</Key>로 넘겨요.</>,
      <>교실 TV를 연결해 쓰면 트레이 메뉴의 <b>TV로 쓰는 화면</b>에서 TV를 골라 두세요.</>,
      <>위젯은 <b>위젯 편집</b>, 모양은 <b>배경·색 바꾸기</b>에서 바꿔요.</>,
      <>업데이트는 하루 한 번 스스로 확인해요. 새 판 카드에서 <Key>지금 업데이트</Key>를 누르면 받아서 설치하고 다시 켜요.</>,
    ],
  },
  {
    title: "지우기",
    items: [
      <>Windows <b>설정</b> → <b>앱</b> → <b>설치된 앱</b>에서 <b>교실 위젯</b>을 찾아 제거해요.</>,
      <>일정·설정이 든 <code>%LOCALAPPDATA%\교실위젯</code> 폴더는 지우지 않고 남겨 둬요.</>,
    ],
  },
];

const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: "다운로드가 막혀요",
    a: <>위 1단계처럼 브라우저 다운로드 목록에서 <Key>유지</Key>를 눌러요. 그래도 안 되면 <a className="text-primary underline" href={BOARD_HOME}>내려받기 페이지</a>에서 받아 보세요. 학교 인터넷에서 열리는 주소예요.</>,
  },
  {
    q: "“Windows의 PC 보호” 경고가 떠요",
    a: <>코드 서명이 없는 설치 파일이라 처음 설치할 때 떠요. <Key>추가 정보</Key> → <Key>실행</Key>을 눌러요.</>,
  },
  {
    q: "학교 PC에 관리자 권한이 없어요",
    a: <>관리자 권한 없이 설치되도록 만들어져 있어요. 프로그램은 내 계정 폴더에 들어가고, 시작 프로그램 등록도 내 계정에만 해요.</>,
  },
  {
    q: "보드가 안 보여요",
    a: <>트레이 아이콘을 오른쪽 클릭해 <b>보드 열기</b>를 눌러요. 모니터를 바꿨거나 TV만 켠 채 처음 실행했다면 <b>지금 주 모니터를 내 화면으로 지정</b>을 눌러요. 화면을 복제해 수업하는 중에는 일정·메모 같은 칸이 일부러 가려져요.</>,
  },
];

export default async function BoardPage() {
  const release = await getLatestRelease();
  const notes = release ? [...release.added, ...release.improved] : [];

  return (
    <main className="flex-grow pt-24 px-6 md:px-12 lg:px-20 pb-20 max-w-[1280px] mx-auto w-full">
      <div className="mt-6 mb-10">
        <PageHero
          label="CLASSROOM BOARD · 교실 위젯"
          title={<>교실 <span className="text-mint">보드</span></>}
          desc="바탕화면에 캘린더·시간표·급식·D-day를 띄우고, 메신저 쪽지에서 일정을 찾아 주는 선생님용 Windows 프로그램이에요."
          action={<Download release={release} />}
        />
      </div>

      <Reveal>
        <figure className="m-0 overflow-hidden rounded-[14px] border border-outline-variant bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/board/board.webp" alt="교실 위젯 보드 화면: 수업 도구 띠, D-day, 메모, 오늘의 급식, 캘린더, 다가오는 일정·마감, 시간표" width={1920} height={1080} className="block h-auto w-full" />
          <figcaption className="px-5 py-3 text-[13px] text-on-surface-variant">지어낸 예시 데이터로 그린 보드 화면이에요.</figcaption>
        </figure>
      </Reveal>

      <section className="mt-14">
        <h2 className="m-0 mb-1 font-[family-name:var(--font-label)] text-[13px] tracking-[0.12em] text-primary">FEATURES</h2>
        <p className="m-0 mb-6 text-[22px] font-black text-on-surface">무엇을 해 주나요</p>
        <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <li key={f.title} className="rounded-[14px] border border-outline-variant bg-white p-6">
              <span className="font-pixel text-[12px] tracking-[0.12em] text-tertiary">{f.tag}</span>
              <h3 className="m-0 mt-1 mb-2 text-[18px] font-black text-on-surface">{f.title}</h3>
              <p className="m-0 text-[15px] leading-[1.7] text-on-surface-variant">{f.body}</p>
            </li>
          ))}
        </ul>
        <figure className="m-0 mt-4 rounded-[14px] border border-outline-variant bg-white p-4 sm:p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/board/tools.webp" alt="수업 도구 띠: 타이머, 뽑기, 알림장, 자리바꾸기, 3D 뽑기 단추" width={966} height={184} loading="lazy" className="mx-auto block h-auto w-full max-w-[640px]" />
          <figcaption className="mt-2 text-center text-[13px] text-on-surface-variant">수업 도구 띠</figcaption>
        </figure>
      </section>

      <section className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-[14px] border border-outline-variant bg-white p-7 md:p-8 lg:col-span-7">
          <h2 className="m-0 mb-1 font-[family-name:var(--font-label)] text-[13px] tracking-[0.12em] text-primary">PRIVACY</h2>
          <p className="m-0 mb-6 text-[22px] font-black text-on-surface">쪽지와 학생 정보</p>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {PRIVACY.map((item, i) => (
              <li key={i} className="flex gap-3 rounded-[10px] bg-surface-container px-4 py-3 text-[15px] leading-[1.7] text-on-surface">
                <span aria-hidden className="font-pixel text-primary">◆</span>
                <span className="min-w-0">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[14px] border border-outline-variant bg-white p-7 md:p-8 lg:col-span-5">
          <h2 className="m-0 mb-1 font-[family-name:var(--font-label)] text-[13px] tracking-[0.12em] text-primary">SYSTEM</h2>
          <p className="m-0 mb-6 text-[22px] font-black text-on-surface">필요한 것</p>
          <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[15px] leading-[1.7] text-on-surface">
            <li>· Windows PC (Mac·크롬북에서는 쓸 수 없어요)</li>
            <li>· 관리자 권한은 없어도 돼요</li>
            <li>· 급식·날씨·뉴스·업데이트는 인터넷 연결이 필요해요</li>
            <li>· 3D 뽑기는 Edge 창으로 열려요</li>
          </ul>
          {release && notes.length > 0 && (
            <>
              <p className="m-0 mt-6 mb-2 text-[15px] font-black text-on-surface">v{release.version}에서 바뀐 것</p>
              <ul className="m-0 flex list-none flex-col gap-1 p-0 text-[14px] leading-[1.6] text-on-surface-variant">
                {notes.map((n) => (
                  <li key={n}>· {n}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="install">
        <h2 className="m-0 mb-1 font-[family-name:var(--font-label)] text-[13px] tracking-[0.12em] text-primary">INSTALL</h2>
        <p id="install" className="m-0 mb-6 text-[22px] font-black text-on-surface">설치하는 순서</p>
        <ol className="m-0 flex list-none flex-col gap-4 p-0">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-4 rounded-[14px] border border-outline-variant bg-white p-5 sm:p-6">
              <span aria-hidden className="flex h-10 w-10 flex-none items-center justify-center rounded-[8px] bg-night font-pixel text-lg text-mint">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <h3 className="m-0 mb-2 text-[18px] font-black text-on-surface">
                  <span className="sr-only">{i + 1}단계: </span>
                  {s.title}
                  {s.screen && <span className="ml-2 text-[13px] font-bold text-on-surface-variant">{s.screen}</span>}
                </h3>
                <ul className="m-0 flex list-disc flex-col gap-2 pl-5 text-[15px] leading-[1.8] text-on-surface marker:text-outline">
                  {s.items.map((item, j) => (
                    <li key={j} className="break-keep">{item}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex justify-center">
          <div className="rounded-[14px] bg-night p-5">
            <Download release={release} />
          </div>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="m-0 mb-1 font-[family-name:var(--font-label)] text-[13px] tracking-[0.12em] text-primary">FAQ</h2>
        <p className="m-0 mb-6 text-[22px] font-black text-on-surface">문제 해결</p>
        <div className="flex flex-col gap-3">
          {FAQ.map((f) => (
            <details key={f.q} className="group rounded-[14px] border border-outline-variant bg-white px-5 py-4">
              <summary className="cursor-pointer list-none text-[16px] font-bold text-on-surface [&::-webkit-details-marker]:hidden">
                <span aria-hidden className="mr-2 inline-block font-pixel text-primary transition-transform group-open:rotate-90">▸</span>
                {f.q}
              </summary>
              <p className="m-0 mt-3 text-[15px] leading-[1.8] text-on-surface-variant break-keep">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { isStudentApp, isStudentPartnerGame, toLauncherApp, type LauncherApp } from "@/lib/launcher/catalog";
import { listLauncherRows, publicThumbnailUrl } from "@/lib/repositories/projects";

export const metadata: Metadata = {
  title: "학생용 놀이터 // 방구석게이머 교실 놀이터",
  description: "선생님이 만든 학습 게임을 바로 실행하는 학생용 화면",
  alternates: { canonical: "/students" },
};

/** 학생에게 안내하는 화면: 학생용 앱과 아이스크림 제공 게임(새 탭 연결)만 보이고 교사용 도구는 보이지 않는다. */
export default async function StudentsPage() {
  const rows = await listLauncherRows();
  const all = rows
    .map((r) => toLauncherApp(r, publicThumbnailUrl))
    .filter((a): a is LauncherApp => a !== null)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "ko"));
  const apps = all.filter(isStudentApp);
  const partnerGames = all.filter(isStudentPartnerGame);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-night text-white">
      <header className="px-6 pt-8 pb-6 sm:px-10">
        <p className="m-0 font-pixel text-[13px] tracking-[0.12em] text-mint">CLASSROOM PLAYGROUND · 학생용</p>
        <h1 className="m-0 mt-2 font-pixel text-[30px] font-bold leading-tight sm:text-[38px]">교실 놀이터</h1>
        <p className="m-0 mt-2 text-[15px] text-lilac">게임을 골라 시작하세요. 이름이나 개인정보는 묻지 않아요.</p>
      </header>
      <main className="grid flex-1 grid-cols-1 content-start gap-5 px-6 pb-10 sm:grid-cols-2 sm:px-10 lg:grid-cols-3">
        {apps.map((app) => (
          <Link
            key={app.slug}
            href={`/play/${app.slug}?from=students`}
            className="group flex flex-col overflow-hidden rounded-[14px] bg-white text-night shadow-lg transition-transform hover:-translate-y-1"
          >
            {app.hero || app.thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={app.hero ?? app.thumb ?? ""} alt="" className="aspect-[16/9] w-full object-cover" />
            ) : (
              <span aria-hidden className="aspect-[16/9] w-full bg-night-line" />
            )}
            <span className="flex flex-1 flex-col gap-1 p-4">
              <span className="font-pixel text-lg font-bold">{app.name}</span>
              {app.grade && <span className="text-[13px] text-ink-soft">{app.grade}</span>}
              <span className="mt-auto pt-2 font-pixel text-sm font-bold text-mint group-hover:underline">▶ 시작하기</span>
            </span>
          </Link>
        ))}
      </main>
      {partnerGames.length > 0 && (
        <section aria-labelledby="partner-title" className="px-6 pb-10 sm:px-10">
          <h2 id="partner-title" className="m-0 font-pixel text-xl font-bold">아이스크림 AI마트 게임</h2>
          <p className="m-0 mt-1 mb-4 text-[13px] text-lilac">누르면 아이스크림 사이트가 새 탭으로 열려요. 이 게임들은 아이스크림의 이용 안내와 개인정보처리방침을 따라요.</p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {partnerGames.map((app) => (
              <a
                key={app.slug}
                href={app.action.href}
                target="_blank"
                rel="noopener"
                className="group flex flex-col overflow-hidden rounded-[14px] bg-white text-night shadow-lg transition-transform hover:-translate-y-1"
              >
                {app.hero || app.thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={app.hero ?? app.thumb ?? ""} alt="" className="aspect-[16/9] w-full object-cover" />
                ) : (
                  <span aria-hidden className="aspect-[16/9] w-full bg-night-line" />
                )}
                <span className="flex flex-1 flex-col gap-1 p-4">
                  <span className="font-pixel text-lg font-bold">{app.name}</span>
                  {app.grade && <span className="text-[13px] text-ink-soft">{app.grade}</span>}
                  <span className="mt-auto pt-2 font-pixel text-sm font-bold text-[#e05a8a] group-hover:underline">🍦 아이스크림에서 하기 ↗</span>
                </span>
              </a>
            ))}
          </div>
        </section>
      )}
      <footer className="px-6 py-5 text-[12px] text-[#a99fc9] sm:px-10">
        <Link href="/privacy" className="hover:text-white">개인정보처리방침</Link>
      </footer>
    </div>
  );
}

import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { getDormsFeed, type DormsItem, type DormsProfile } from "@/lib/dorms/feed";

export const metadata: Metadata = {
  title: "도름스 서재 // 방구석게이머",
  description: "교사 커뮤니티 도름스(dorms.school)에 올린 앱·게임·글·자료",
  alternates: { canonical: "/dorms" },
};

const KIND_LABEL: Record<string, string> = {
  app: "앱",
  game: "게임",
  story: "이야기",
  resource: "자료",
  book: "책",
  review: "후기",
  library_post: "서재 글",
};

const DEFAULT_AVATAR = "/launcher/char-pick.webp";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric" });
}

/** 피드 그림이 없을 때 쓰는 기본 그림 */
function DefaultPicture({ kind }: { kind: string }) {
  return (
    <span
      aria-hidden
      data-default-image
      className="flex aspect-[16/10] w-full items-center justify-center bg-night bg-[linear-gradient(rgba(91,224,138,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(91,224,138,0.08)_1px,transparent_1px)] bg-[size:20px_20px]"
    >
      <span className="font-pixel text-3xl text-mint">▣</span>
      <span className="ml-2 font-pixel text-sm text-lilac">{KIND_LABEL[kind] ?? "도름스"}</span>
    </span>
  );
}

function Picture({ item }: { item: DormsItem }) {
  if (!item.image) return <DefaultPicture kind={item.kind} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={item.image} alt="" loading="lazy" className="aspect-[16/10] w-full bg-night object-contain" />
  );
}

/** 링크가 있으면 도름스로 새 탭, 없으면 그냥 상자 */
function Linked({ href, className, label, children }: { href: string | null; className: string; label?: string; children: React.ReactNode }) {
  if (!href) return <div className={className}>{children}</div>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={className}>
      {children}
    </a>
  );
}

function ProfileCard({ profile }: { profile: DormsProfile }) {
  const meta = [profile.region, profile.role].filter(Boolean).join(" · ");
  return (
    <section aria-label="도름스 프로필" data-dorms-profile className="mb-12">
      <Linked
        href={profile.url}
        label={`${profile.name} 도름스 프로필 열기`}
        className="group flex flex-col gap-6 rounded-[18px] border-2 border-night-line bg-surface-container-low p-6 transition-colors hover:border-mint sm:flex-row sm:items-center sm:p-8"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.avatar ?? DEFAULT_AVATAR}
          alt=""
          width={112}
          height={112}
          className="h-[112px] w-[112px] flex-none rounded-full bg-night object-cover"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="font-pixel text-[13px] tracking-[0.12em] text-primary">DORMS · PROFILE</span>
          <span className="font-pixel text-[28px] font-bold leading-tight text-on-surface">{profile.name}</span>
          {profile.handle && profile.handle !== profile.name && (
            <span className="text-sm text-on-surface-variant">@{profile.handle}</span>
          )}
          {meta && <span className="text-sm text-on-surface-variant">{meta}</span>}
          {profile.bio && <p className="m-0 whitespace-pre-line text-[15px] leading-[1.7] text-on-surface">{profile.bio}</p>}
          <span className="mt-1 font-pixel text-sm font-bold text-primary group-hover:underline">도름스 프로필 보기 ↗</span>
        </div>
        <dl className="m-0 grid flex-none grid-cols-2 gap-3 sm:w-[240px]">
          <div className="rounded-[10px] bg-night px-4 py-3 text-white">
            <dt className="text-xs text-lilac">받은 도름</dt>
            <dd className="m-0 font-pixel text-2xl font-bold text-mint">{profile.totalDorms ?? "-"}</dd>
          </div>
          <div className="rounded-[10px] bg-night px-4 py-3 text-white">
            <dt className="text-xs text-lilac">순위</dt>
            <dd className="m-0 font-pixel text-2xl font-bold text-mint">{profile.rank != null ? `${profile.rank}위` : "-"}</dd>
          </div>
        </dl>
      </Linked>
      {(profile.library?.url || profile.links.length > 0) && (
        <ul className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0 text-sm">
          {profile.library?.url && (
            <li>
              <a href={profile.library.url} target="_blank" rel="noopener noreferrer" className="inline-block rounded-full border border-night-line px-4 py-2 text-on-surface hover:border-mint">
                📚 {profile.library.name || "개인 서재"} ↗
              </a>
            </li>
          )}
          {profile.links.map((l) => (
            <li key={l.url}>
              <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-block rounded-full border border-night-line px-4 py-2 text-on-surface hover:border-mint">
                {l.label} ↗
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ItemCard({ item }: { item: DormsItem }) {
  const kind = KIND_LABEL[item.kind] ?? "도름스";
  if (item.locked) {
    return (
      <li data-dorms-item data-locked className="flex flex-col overflow-hidden rounded-[14px] border-2 border-night-line bg-surface-container-low">
        {item.image && <Picture item={item} />}
        <div className="flex flex-1 flex-col gap-3 p-4">
          <span className="font-pixel text-lg font-bold leading-snug text-on-surface">{item.title}</span>
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-auto font-pixel text-sm font-bold text-primary hover:underline">
              도름스에서 보기 ↗
            </a>
          )}
        </div>
      </li>
    );
  }
  const date = formatDate(item.createdAt);
  return (
    <li data-dorms-item className="flex">
      <Linked
        href={item.url}
        label={`${item.title} 도름스에서 보기`}
        className="group flex w-full flex-col overflow-hidden rounded-[14px] border-2 border-night-line bg-surface-container-low transition-transform hover:-translate-y-1 hover:border-mint"
      >
        <Picture item={item} />
        <span className="flex flex-1 flex-col gap-2 p-4">
          <span className="font-pixel text-xs tracking-[0.1em] text-primary">{kind}</span>
          <span className="font-pixel text-lg font-bold leading-snug text-on-surface">{item.title}</span>
          {item.summary && <span className="text-[14px] leading-[1.6] text-on-surface-variant">{item.summary}</span>}
          <span className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-[13px] text-on-surface-variant">
            <span>도름 {item.dorms}</span>
            <span>댓글 {item.comments}</span>
            {date && <span>{date}</span>}
            <span className="ml-auto font-pixel font-bold text-primary group-hover:underline">도름스에서 보기 ↗</span>
          </span>
        </span>
      </Linked>
    </li>
  );
}

function ItemSection({ id, label, title, items, empty }: { id: string; label: string; title: string; items: DormsItem[]; empty: string }) {
  return (
    <section aria-labelledby={id} className="mb-14">
      <div className="mb-5 flex items-baseline gap-3">
        <span className="font-pixel text-[13px] tracking-[0.12em] text-primary">{label}</span>
        <h2 id={id} className="m-0 font-pixel text-2xl font-bold text-on-surface">
          {title} <span className="text-base text-on-surface-variant">{items.length}</span>
        </h2>
      </div>
      {items.length === 0 ? (
        <p className="m-0 rounded-[14px] border-2 border-dashed border-night-line p-8 text-center text-on-surface-variant">{empty}</p>
      ) : (
        <ul className="m-0 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}

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

      {feed ? (
        <>
          <ProfileCard profile={feed.profile} />
          <ItemSection id="dorms-apps" label="APPS · GAMES" title="앱·게임" items={feed.apps} empty="아직 도름스에 올린 앱·게임이 없어요." />
          <ItemSection id="dorms-posts" label="POSTS · RESOURCES" title="글·자료" items={feed.posts} empty="아직 도름스에 올린 글·자료가 없어요." />
        </>
      ) : (
        <p role="status" className="m-0 rounded-[14px] border-2 border-dashed border-night-line p-8 text-center text-on-surface-variant">
          도름스 서재를 잠시 불러오지 못했어요. 잠시 뒤 다시 열어 주세요.
        </p>
      )}
    </main>
  );
}

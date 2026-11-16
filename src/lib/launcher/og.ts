import type { Metadata } from "next";

/** 앱별 링크 미리보기 그림 주소(서버가 썸네일을 1200×630 JPG로 바꿔 준다) */
export function appOgImagePath(slug: string): string {
  return `/og/app/${encodeURIComponent(slug)}`;
}

/** 썸네일 원본 주소: 사이트 경로면 이 사이트 주소로, 그 밖엔 https 주소만 허용 */
export function ogSourceUrl(src: string | null, origin: string): string | null {
  if (!src) return null;
  if (src.startsWith("/") && !src.startsWith("//")) return origin + src;
  try {
    return new URL(src).protocol === "https:" ? src : null;
  } catch {
    return null;
  }
}

/** 카카오톡 등에서 앱 링크를 보냈을 때 보일 제목·설명·그림 */
export function appShareMeta(app: { slug: string; name: string; desc: string }, url: string): Metadata {
  const title = `${app.name} // 방구석게이머 교실 놀이터`;
  const image = appOgImagePath(app.slug);
  return {
    title,
    description: app.desc,
    openGraph: { title, description: app.desc, url, images: [{ url: image, width: 1200, height: 630, alt: app.name }] },
    twitter: { card: "summary_large_image", title, description: app.desc, images: [image] },
  };
}

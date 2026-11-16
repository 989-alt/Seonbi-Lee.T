import sharp from "sharp";
import { toLauncherApp } from "@/lib/launcher/catalog";
import { ogSourceUrl } from "@/lib/launcher/og";
import { listLauncherRows, publicThumbnailUrl } from "@/lib/repositories/projects";

const W = 1200;
const H = 630;
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * 앱 링크 미리보기 그림(1200×630 JPG).
 * 카탈로그에 등록된 앱의 썸네일만 읽는다(주소를 요청에서 받지 않음).
 * 그림 전체가 보이도록 가운데에 두고, 남는 양옆은 같은 그림을 흐리게 깔아 채운다.
 */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const origin = new URL(req.url).origin;
  const fallback = Response.redirect(`${origin}/og.jpg`, 302);

  const rows = await listLauncherRows().catch(() => []);
  const row = rows.find((r) => r.slug === slug);
  const app = row ? toLauncherApp(row, publicThumbnailUrl) : null;
  const src = app ? ogSourceUrl(app.hero ?? app.thumb, origin) : null;
  if (!src) return fallback;

  try {
    const res = await fetch(src, { signal: AbortSignal.timeout(8000), cache: "no-store" });
    if (!res.ok) {
      console.error("[og] source", res.status, src);
      return fallback;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0 || buf.length > MAX_BYTES) return fallback;

    const back = await sharp(buf).resize(W, H, { fit: "cover" }).blur(28).modulate({ brightness: 0.55 }).toBuffer();
    const front = await sharp(buf).resize(W, H, { fit: "inside" }).toBuffer();
    const jpg = await sharp(back)
      .composite([{ input: front, gravity: "center" }])
      .jpeg({ quality: 84, mozjpeg: true })
      .toBuffer();

    return new Response(new Uint8Array(jpg), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  } catch (e) {
    console.error("[og] failed", slug, e);
    return fallback;
  }
}

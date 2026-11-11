import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { parseTrack, seoulDay } from "@/lib/stats/track";
import { getTrackables } from "@/lib/stats/server";

export const runtime = "nodejs";

async function corsHeaders(req: NextRequest): Promise<Record<string, string>> {
  const origin = req.headers.get("origin");
  if (!origin) return {};
  const { origins } = await getTrackables();
  return origins.has(origin)
    ? { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", Vary: "Origin" }
    : {};
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: await corsHeaders(req) });
}

export async function POST(req: NextRequest) {
  const headers = await corsHeaders(req);
  let body: unknown;
  try {
    // sendBeacon은 text/plain으로 보내므로 text로 읽어 파싱
    body = JSON.parse(await req.text());
  } catch {
    return new NextResponse(null, { status: 400, headers });
  }
  const t = parseTrack(body);
  if (!t) return new NextResponse(null, { status: 400, headers });

  if (!checkRateLimit(`track:${t.vid}`, { max: 30, windowMs: 60_000 }).ok) {
    return new NextResponse(null, { status: 429, headers });
  }
  const { slugs } = await getTrackables();
  if (!slugs.has(t.app)) return new NextResponse(null, { status: 400, headers });

  try {
    const { error } = await createSupabaseAdminClient()
      .from("app_visits")
      .upsert({ app_slug: t.app, visitor_id: t.vid, day: seoulDay(new Date()) }, { ignoreDuplicates: true });
    if (error) console.error("[track] insert error:", error.message);
  } catch (e) {
    console.error("[track] failed:", e);
  }
  return new NextResponse(null, { status: 204, headers });
}

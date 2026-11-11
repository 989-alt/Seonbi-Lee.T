import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { MAX_TRACK_BODY, seoulDay, trackGate } from "@/lib/stats/track";
import { getTrackables } from "@/lib/stats/server";

export const runtime = "nodejs";

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function cors(origin: string | null, origins: Set<string>): Record<string, string> {
  return origin && origins.has(origin)
    ? { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", Vary: "Origin" }
    : {};
}

export async function OPTIONS(req: NextRequest) {
  const { origins } = await getTrackables();
  return new NextResponse(null, { status: 204, headers: cors(req.headers.get("origin"), origins) });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  const { slugs, origins } = await getTrackables();
  const headers = cors(origin, origins);

  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_TRACK_BODY) return new NextResponse(null, { status: 400, headers });
  const raw = await req.text();
  let body: unknown = null;
  try { body = JSON.parse(raw); } catch { /* trackGate가 400 처리 */ }

  // IP는 빈도 제한에만 메모리에서 쓰고 저장하지 않는다
  const gate = trackGate({ origin, ip: clientIp(req), bodyLength: raw.length, body, slugs, origins });
  if (gate.status !== 204) return new NextResponse(null, { status: gate.status, headers });

  try {
    const { error } = await createSupabaseAdminClient()
      .from("app_visits")
      .upsert({ app_slug: gate.payload.app, visitor_id: gate.payload.vid, day: seoulDay(new Date()) }, { ignoreDuplicates: true });
    if (error) console.error("[track] insert error:", error.message);
  } catch (e) {
    console.error("[track] failed:", e);
  }
  return new NextResponse(null, { status: 204, headers });
}

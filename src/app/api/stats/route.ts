import { NextResponse } from "next/server";
import { getStats } from "@/lib/stats/server";

export const runtime = "nodejs";

export async function GET() {
  const stats = await getStats();
  return NextResponse.json(stats, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60" } });
}

import Anthropic from "@anthropic-ai/sdk";
import { NextResponse, type NextRequest } from "next/server";
import { DAILY_AI as DAILY } from "@/lib/fortune/ai/limits";
import { AskSchema, buildMessages, SYSTEM_PROMPT } from "@/lib/fortune/ai/prompt";
import { seoulToday } from "@/lib/fortune/saju/core";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 60;

const DAY = 24 * 60 * 60 * 1000;
const say = (error: string, status: number) => NextResponse.json({ error }, { status });

/** 사주·타로 AI 풀이. 질문과 답변은 저장하지 않는다 */
export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) return say("AI 풀이가 아직 준비되지 않았어요.", 503);

  let body: unknown;
  try {
    const raw = await req.text();
    if (raw.length > 30000) return say("대화가 너무 길어요. 새로 물어봐 주세요.", 413);
    body = JSON.parse(raw);
  } catch {
    return say("요청 형식이 올바르지 않아요.", 400);
  }
  const parsed = AskSchema.safeParse(body);
  if (!parsed.success) return say("요청 내용을 확인해 주세요.", 400);

  const built = buildMessages(parsed.data, seoulToday());
  if ("blocked" in built) return NextResponse.json({ text: built.blocked, blocked: true });

  // 기기당 하루 DAILY회. 학교는 여러 사람이 한 IP를 쓰므로 IP 한도는 넉넉히 둔다
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  const device = (req.headers.get("x-fortune-device") ?? "").slice(0, 64) || "none";
  if (!checkRateLimit(`fortune-ip:${ip}`, { max: 200, windowMs: DAY }).ok) return say("오늘은 이 네트워크에서 AI 풀이를 많이 썼어요. 내일 다시 찾아 주세요.", 429);
  if (!checkRateLimit(`fortune-dev:${ip}:${device}`, { max: DAILY, windowMs: DAY }).ok) return say(`AI 상담은 하루 ${DAILY}번까지예요. 내일 다시 물어봐 주세요.`, 429);

  try {
    const res = await new Anthropic().messages.create({
      model: "claude-sonnet-5-5",
      max_tokens: 3000,
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages: built.messages,
    });
    const text = res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("").trim();
    if (res.stop_reason === "refusal" || !text) return say("이 질문에는 AI 풀이를 드리기 어려워요. 위의 기본 풀이를 참고해 주세요.", 422);
    return NextResponse.json({ text });
  } catch (e) {
    console.error("[fortune/ask]", e instanceof Anthropic.APIError ? `${e.status} ${e.name}` : e);
    const busy = e instanceof Anthropic.RateLimitError || (e instanceof Anthropic.APIError && e.status === 529);
    return say(busy ? "지금 AI가 바빠요. 잠시 뒤에 다시 눌러 주세요." : "AI 풀이를 가져오지 못했어요. 잠시 뒤에 다시 시도해 주세요.", 502);
  }
}

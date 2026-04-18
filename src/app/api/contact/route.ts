import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { sendContactMail } from "@/lib/mail";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs"; // nodemailer requires Node runtime

const ContactSchema = z.object({
  subject: z.string().trim().min(1, "제목을 입력해 주세요.").max(100),
  message: z.string().trim().min(10, "문의 내용을 10자 이상 입력해 주세요.").max(2000),
  replyTo: z
    .string()
    .trim()
    .email("올바른 이메일 주소를 입력해 주세요.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  website: z.string().optional(), // honeypot
});

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { error: "요청 형식이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  const parsed = ContactSchema.safeParse(payload);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "입력값을 확인해 주세요." },
      { status: 400 }
    );
  }

  // Honeypot — silently accept (don't leak detection) but skip sending
  if (parsed.data.website && parsed.data.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  // Rate limit
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip);
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: `요청이 너무 많습니다. ${rl.retryAfterSec}초 후 다시 시도해 주세요.`,
      },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec ?? 60) } }
    );
  }

  try {
    await sendContactMail({
      subject: parsed.data.subject,
      message: parsed.data.message,
      replyTo: parsed.data.replyTo,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] mail send failed:", err);
    const detail =
      err instanceof Error
        ? err.message
        : "알 수 없는 오류로 메일 전송에 실패했습니다.";
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? `메일 전송 실패: ${detail}`
            : "메일 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 500 }
    );
  }
}

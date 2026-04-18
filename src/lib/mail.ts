import nodemailer, { type Transporter } from "nodemailer";

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST ?? "smtp.naver.com";
  const port = Number(process.env.SMTP_PORT ?? 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error(
      "SMTP_USER 또는 SMTP_PASS 환경변수가 설정되어 있지 않습니다. .env.local을 확인하세요."
    );
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return cachedTransporter;
}

export interface ContactMailPayload {
  subject: string;
  message: string;
  replyTo?: string;
}

export async function sendContactMail(payload: ContactMailPayload) {
  const to = process.env.CONTACT_TO_EMAIL ?? "sunhak98@naver.com";
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;

  if (!from) {
    throw new Error("SMTP_FROM 또는 SMTP_USER 환경변수가 필요합니다.");
  }

  const now = new Date().toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
  });

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 640px; margin: 0 auto; background: #0e0e0f; color: #ffffff; padding: 32px;">
      <div style="border-top: 2px solid #8ff5ff; padding-top: 24px;">
        <h1 style="color: #8ff5ff; font-size: 14px; letter-spacing: 0.2em; text-transform: uppercase; margin: 0 0 8px 0;">
          SEONBI'S LAB // CONTACT
        </h1>
        <p style="color: #adaaab; font-size: 12px; margin: 0 0 32px 0;">${escapeHtml(now)} KST</p>

        <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0;">${escapeHtml(payload.subject)}</h2>

        <div style="background: #131314; padding: 20px; border-left: 2px solid #ac89ff; margin: 24px 0; white-space: pre-wrap; word-break: break-word; line-height: 1.7;">${escapeHtml(payload.message)}</div>

        ${
          payload.replyTo
            ? `<p style="color: #adaaab; font-size: 13px; margin-top: 24px;">회신: <a href="mailto:${escapeHtml(payload.replyTo)}" style="color: #8ff5ff;">${escapeHtml(payload.replyTo)}</a></p>`
            : `<p style="color: #adaaab; font-size: 13px; margin-top: 24px;">※ 회신 주소 미기재</p>`
        }
      </div>
    </div>
  `;

  const textBody = [
    `[SEONBI'S LAB // CONTACT] ${now} KST`,
    "",
    `제목: ${payload.subject}`,
    "",
    "-- 문의 내용 --",
    payload.message,
    "",
    payload.replyTo ? `회신: ${payload.replyTo}` : "※ 회신 주소 미기재",
  ].join("\n");

  const transporter = getTransporter();

  await transporter.sendMail({
    from,
    to,
    subject: `[LAB 문의] ${payload.subject}`,
    text: textBody,
    html: htmlBody,
    replyTo: payload.replyTo || undefined,
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

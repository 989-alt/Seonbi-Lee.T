/** 로그인 뒤 이동할 경로를 사이트 내부 경로로만 제한한다(open redirect 방지). */
export function safeAdminRedirect(raw: unknown, fallback = "/admin"): string {
  if (typeof raw !== "string") return fallback;
  const v = raw.trim();
  if (!v.startsWith("/") || v.startsWith("//") || v.includes("\\")) return fallback;
  if (/[\u0000-\u001f]/.test(v)) return fallback;
  if (!v.startsWith("/admin")) return fallback;
  return v;
}

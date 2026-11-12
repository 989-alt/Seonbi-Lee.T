/**
 * 요청마다 새 nonce를 넣은 Content-Security-Policy.
 * script는 nonce가 붙은 것만 실행된다('unsafe-inline' 없음).
 * style은 React의 style 속성 때문에 'unsafe-inline'을 유지한다(스크립트 실행 위험 없음).
 */
export function buildCsp(nonce: string, isDev = process.env.NODE_ENV === "development"): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "media-src 'self' https:",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export function newNonce(): string {
  return btoa(crypto.randomUUID());
}

import type { NextConfig } from "next";
import path from "node:path";

const supabaseOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin;
  } catch {
    return "";
  }
})();
const supabaseWs = supabaseOrigin.replace(/^https:/, "wss:");

// Next.js는 하이드레이션용 인라인 스크립트를 쓰므로 nonce 없이 'unsafe-inline'을 허용한다.
// (nonce 방식은 모든 페이지를 동적 렌더로 바꿔 속도가 떨어진다.)
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // 빌드 환경에 Supabase 주소가 없어도 관리자 업로드(브라우저→Storage)가 막히지 않도록 와일드카드도 둔다
  `connect-src 'self' ${supabaseOrigin} ${supabaseWs} https://*.supabase.co wss://*.supabase.co`.replace(/\s+/g, " "),
  "media-src 'self' https:",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: path.resolve(__dirname),
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      { source: "/resources", destination: "/learn", permanent: true },
      { source: "/projects", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;

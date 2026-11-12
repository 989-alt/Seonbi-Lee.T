import type { NextConfig } from "next";
import path from "node:path";

// Content-Security-Policy는 요청마다 nonce를 넣어야 해서 src/proxy.ts에서 붙인다.
const securityHeaders = [
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

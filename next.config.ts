import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    return [
      { source: "/resources", destination: "/learn", permanent: true },
      { source: "/projects", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;

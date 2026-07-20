import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prefer modern browsers; still transpile safely for Safari iOS / Chrome Android.
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
};

export default nextConfig;

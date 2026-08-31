import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prefer modern browsers; still transpile safely for Safari iOS / Chrome Android.
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  // Local dashboard development and browser tests use both host aliases.
  allowedDevOrigins: ["localhost", "127.0.0.1"],
  // Workspace package ships TypeScript source — transpile in the Next bundler.
  transpilePackages: ["@ayurpass/shared"],

  // Tree-shake heavy icon / UI packages for faster dashboard routes.
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  // Allow Next.js Image to load from the API and CDN.
  images: {
    remotePatterns: [
      // Backend uploads (development / direct API)
      { protocol: "https", hostname: "api.ayurpass.com" },
      { protocol: "https", hostname: "api-staging.ayurpass.com" },
      { protocol: "https", hostname: "picsum.photos" },
      // S3 / CloudFront media CDN (when provisioned)
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.cloudfront.net" },
    ],
  },

  // Production security headers — applied to every response.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), payment=(self)",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com https://cdn.amplitude.com https://www.clarity.ms https://*.clarity.ms",
              "worker-src 'self' blob:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http:",
              "connect-src 'self' https://api.ayurpass.com https://api-staging.ayurpass.com https://*.stripe.com https://*.amplitude.com https://*.clarity.ms https://c.bing.com http://localhost:4000",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),

          },
        ],
      },
    ];
  },

  async rewrites() {
    const apiTarget =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:4000";
    return [
      {
        source: "/ai/:path*",
        destination: `${apiTarget}/ai/:path*`,
      },
      {
        source: "/consents/:path*",
        destination: `${apiTarget}/consents/:path*`,
      },
    ];
  },
};

export default nextConfig;

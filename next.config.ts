import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    serverActions: { bodySizeLimit: "100mb" },
  },

  // Vercel uses serverless functions which lack pg-native bindings.
  // The standard `pg` driver works fine; this just suppresses the optional-native warning.
  webpack: (config) => {
    config.externals.push({ "pg-native": "commonjs pg-native" });
    return config;
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "0" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload"
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src 'self'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} 'unsafe-inline'`,
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "img-src 'self' data: blob: https:",
              "font-src 'self' fonts.gstatic.com",
              "connect-src 'self' https://api.resend.com https://api.stripe.com https://*.supabase.co wss://*.ably-realtime.com wss://realtime.ably.net https://*.ably-realtime.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "report-uri /api/csp-report",
            ].join("; "),
          }
        ]
      }
    ];
  },

  // www → bare domain redirect is handled in middleware.ts (307 temporary)
  // to avoid permanent redirect caching issues in browsers.
};

export default withBundleAnalyzer(nextConfig);

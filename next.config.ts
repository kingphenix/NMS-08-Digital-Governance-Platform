import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Content-Security-Policy tuned for this app: Next.js inline runtime,
// Supabase REST/Storage, Paystack checkout and remote avatar images.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://js.paystack.co https://checkout.paystack.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // `ws:`/`wss:` are required in development so the Turbopack HMR socket can
  // connect — without them the dev client retries and reloads the page in a loop.
  isDev
    ? "connect-src 'self' ws: wss: https://*.supabase.co https://api.paystack.co"
    : "connect-src 'self' https://*.supabase.co https://api.paystack.co",
  "frame-src https://checkout.paystack.com https://*.paystack.co https://*.paystack.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // Local IDE previews embed the app in an iframe; production denies framing.
  isDev ? "frame-ancestors 'self'" : "frame-ancestors 'none'",
  // Only force HTTPS upgrades in production so local `next dev` over http keeps working.
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // X-Frame-Options would also block the dev preview iframe; keep it prod-only.
  ...(isDev ? [] : [{ key: "X-Frame-Options", value: "DENY" }]),
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      "",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  turbopack: {
    // Turbopack handles caching natively - no webpack workaround needed
  },
};

export default nextConfig;

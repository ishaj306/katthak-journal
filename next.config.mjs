import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

/**
 * Content-Security-Policy — REPORT-ONLY for now.
 *
 * ⚠ TEST THOROUGHLY, THEN TIGHTEN before switching the header name below from
 * `Content-Security-Policy-Report-Only` to `Content-Security-Policy`.
 * In Report-Only mode the browser blocks nothing; it only logs violations in
 * DevTools → Console. Sign in, sign up, upload/play media, record audio and
 * run a riyaz sequence, and fix every reported violation before enforcing.
 */
const buildCsp = (isDev) => [
  // Fallback for any fetch type not listed below: only this site.
  "default-src 'self'",
  // Next.js emits inline bootstrap scripts (no nonce set up), so
  // 'unsafe-inline' is needed. Clerk loads clerk-js from its Frontend API
  // domain; Cloudflare Turnstile is Clerk's bot check on sign-up.
  // TIGHTEN: move to nonces via middleware, then drop 'unsafe-inline'.
  // Clerk DEV instance only (*.clerk.accounts.dev). If you move to a production
  // Clerk instance, add its Frontend API domain to script/connect/frame-src.
  // 'unsafe-eval' is added in development only — Next's dev server/HMR uses
  // eval; production builds don't.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://*.clerk.accounts.dev https://challenges.cloudflare.com`,
  // Next.js and Clerk inject inline <style> tags and style attributes.
  "style-src 'self' 'unsafe-inline'",
  // Images: own assets, data: URIs (inline SVG/icons), blob: (local previews),
  // and any https source (Clerk avatars, Supabase signed URLs).
  "img-src 'self' data: blob: https:",
  // Audio/video: Supabase signed URLs, and blob: for recordings and players.
  "media-src 'self' blob: https://*.supabase.co",
  // Fonts are self-hosted by next/font; data: covers inlined fonts.
  "font-src 'self' data:",
  // XHR/fetch/WebSocket: Clerk's API + telemetry, Supabase REST/Storage/Realtime.
  "connect-src 'self' https://*.clerk.accounts.dev https://clerk-telemetry.com https://*.supabase.co wss://*.supabase.co",
  // Iframes this site may embed: Clerk and the Turnstile challenge.
  "frame-src 'self' https://*.clerk.accounts.dev https://challenges.cloudflare.com",
  // Clerk and audio tooling spin up blob: workers; the service worker is self.
  "worker-src 'self' blob:",
  // No Flash/plugins, ever.
  "object-src 'none'",
  // Stops injected <base> tags from re-pointing relative URLs.
  "base-uri 'self'",
  // Forms may only post back to this site (server actions) or Clerk.
  "form-action 'self' https://*.clerk.accounts.dev",
  // Nobody may frame this site (matches X-Frame-Options: DENY).
  "frame-ancestors 'none'",
].join("; ");

const buildSecurityHeaders = (isDev) => [
  // Force HTTPS for 2 years, including subdomains; eligible for preload lists.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Browsers must not guess MIME types (stops content-sniffing attacks).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Never render this site inside a frame (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Send only the origin to other sites, the full URL within this one.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Camera and location off. Microphone allowed for THIS site only — the
  // riyaz/composition recorders need it; `microphone=()` would break them.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(self), geolocation=()",
  },
  { key: "Content-Security-Policy-Report-Only", value: buildCsp(isDev) },
];

/** @type {(phase: string) => import('next').NextConfig} */
const nextConfig = (phase) => ({
  reactStrictMode: true,
  // Don't advertise the framework in an `X-Powered-By: Next.js` header.
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  async headers() {
    const isDev = phase === PHASE_DEVELOPMENT_SERVER;
    return [{ source: "/:path*", headers: buildSecurityHeaders(isDev) }];
  },
});

export default nextConfig;

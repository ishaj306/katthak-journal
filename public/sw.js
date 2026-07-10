// Kathak Journal — minimal offline shell service worker.
//
// Navigations are ALWAYS network-first and are never written back into the
// cache: a Next.js page embeds server-action IDs that change every build, so a
// cached HTML document quickly goes stale and causes "Server Action not found"
// errors. Only content-hashed static assets (safe across builds) are cached.

const CACHE = "kathak-v2";
const OFFLINE_ASSETS = ["/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(OFFLINE_ASSETS))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Never intercept Supabase / Clerk / cross-origin API calls.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api")) return;

  // Navigations: network-only (with a bare offline signal). Do not cache HTML.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => new Response("", { status: 504 })));
    return;
  }

  // Static, content-hashed assets: cache-first (filenames change per build, so
  // this can never go stale the way HTML does).
  if (
    url.pathname.startsWith("/_next/static") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".woff2")
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
            return res;
          })
      )
    );
  }
});

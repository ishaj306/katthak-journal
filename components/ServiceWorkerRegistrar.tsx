"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NODE_ENV === "production") {
      const onLoad = () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {
          /* registration is best-effort */
        });
      };
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    }

    // Development: actively tear down any service worker + caches left behind
    // by a previous production run. A stale SW serves cached HTML whose
    // server-action IDs no longer exist on the dev server, which surfaces as
    // "Server Action was not found" errors.
    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => Promise.all(regs.map((r) => r.unregister())))
      .catch(() => {});
    if ("caches" in window) {
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .catch(() => {});
    }
  }, []);

  return null;
}

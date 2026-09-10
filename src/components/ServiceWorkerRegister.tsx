"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });

        // Precache currently loaded script & style chunks into Cache Storage
        // so offline mode works reliably on first load without requiring navigation back & forth
        if ("caches" in window) {
          const cache = await caches.open("fisi-trainer-v2");
          const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
          const assetUrls = resources
            .map((r) => r.name)
            .filter((url) => {
              try {
                const u = new URL(url);
                return (
                  u.origin === window.location.origin &&
                  (u.pathname.startsWith("/_next/") ||
                    u.pathname.endsWith(".js") ||
                    u.pathname.endsWith(".css"))
                );
              } catch {
                return false;
              }
            });
          if (assetUrls.length > 0) {
            await cache.addAll(Array.from(new Set(assetUrls)));
          }
        }
      } catch {
        // Ignored in environments where Service Worker is restricted
      }
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}

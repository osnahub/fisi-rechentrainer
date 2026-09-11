const CACHE_NAME = "fisi-trainer-v2";

const PRECACHE_ASSETS = [
  "/",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png",
  "/manifest.webmanifest",
];

// Install: precache app shell and assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up outdated version caches and immediately claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: network-first for navigation, stale-while-revalidate for static assets
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin GET requests
  if (req.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // HTML navigation requests: Network-first, fallback to cache
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            event.waitUntil(
              caches.open(CACHE_NAME).then((cache) => cache.put(req, clone))
            );
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          const rootCached = await caches.match("/");
          if (rootCached) return rootCached;
          return new Response("Offline", { status: 503, statusText: "Offline" });
        })
    );
    return;
  }

  // Static assets: Cache-first, fallback to network and update cache
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        // Revalidate in background via event.waitUntil
        event.waitUntil(
          fetch(req)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.ok) {
                return caches
                  .open(CACHE_NAME)
                  .then((cache) => cache.put(req, networkResponse));
              }
            })
            .catch(() => {
              // Ignore background fetch failures when offline
            })
        );
        return cachedResponse;
      }

      // Not in cache: fetch from network and store in cache
      return fetch(req)
        .then((networkResponse) => {
          if (!networkResponse || !networkResponse.ok) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          event.waitUntil(
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(req, responseToCache))
          );
          return networkResponse;
        })
        .catch(() => {
          return caches.match(req);
        });
    })
  );
});

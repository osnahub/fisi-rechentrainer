const CACHE_NAME = "fisi-trainer-v1";

const PRECACHE_ASSETS = [
  "/",
  "/favicon.ico",
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

// Activate: clean up outdated version caches
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

// Fetch: network-first for navigation/HTML, stale-while-revalidate for static same-origin assets
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
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(req).then((cached) => cached || caches.match("/"))
        )
    );
    return;
  }

  // Static assets: Cache-first with background revalidation
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        // Revalidate in background
        fetch(req)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(req, networkResponse));
            }
          })
          .catch(() => {
            // Ignore background revalidation failure when offline
          });
        return cachedResponse;
      }

      // Not in cache: fetch and store
      return fetch(req).then((networkResponse) => {
        if (!networkResponse || !networkResponse.ok) {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, responseToCache));
        return networkResponse;
      });
    })
  );
});

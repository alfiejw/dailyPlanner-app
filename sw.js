const CACHE_NAME = 'daily-planner-v1';
const FONT_CACHE  = 'daily-planner-fonts-v1';

const APP_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-maskable.svg',
];

// ── Install: pre-cache app shell ──────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: prune old caches ────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== FONT_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first for own assets, stale-while-revalidate for fonts ───────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Google Fonts: cache after first load so the app looks right offline too
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE).then(cache =>
        cache.match(event.request).then(cached => {
          const networkFetch = fetch(event.request).then(response => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          });
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  // Same-origin assets: cache-first, fall back to index.html for navigation
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then(cached =>
        cached ||
        fetch(event.request)
          .then(response => {
            if (response.ok) {
              caches.open(CACHE_NAME).then(c => c.put(event.request, response.clone()));
            }
            return response;
          })
          .catch(() => caches.match('./index.html'))
      )
    );
  }
});

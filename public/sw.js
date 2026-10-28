const CACHE_NAME = 'sgg-shell-v2';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // API responses must always reflect the current server state. In
  // particular, assessment status and grading must never come from a stale
  // service-worker fallback.
  if (new URL(event.request.url).pathname.startsWith('/api/')) return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request)),
  );
});

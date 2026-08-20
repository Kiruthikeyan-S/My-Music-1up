// 1UP Music Studio - Offline Service Worker
const CACHE_NAME = '1up-music-v4-force-update';

// Install: Skip waiting immediately to activate fresh code
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate: Delete ALL old caches so user gets the new UI immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network-First strategy when online (so fresh UI is always served), Cache fallback when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.protocol.startsWith('chrome-extension')) {
    return;
  }

  // Network-First strategy
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
        }
        return networkResponse;
      })
      .catch(async () => {
        // Offline Fallback
        const cachedResponse = await caches.match(request);
        if (cachedResponse) return cachedResponse;

        if (request.mode === 'navigate') {
          const cachedIndex = await caches.match('/index.html');
          if (cachedIndex) return cachedIndex;
        }

        return new Response('Offline', { status: 503, statusText: 'Offline' });
      })
  );
});

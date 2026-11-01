const CACHE_NAME = 'physiolab-crm-v1';
const STATIC_ASSETS = ['/crm/login', '/icons/crm-icon.svg', '/icons/crm-icon-192.png', '/icons/crm-icon-512.png'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => undefined);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return undefined;
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Always go network-first for CRM pages and API routes so live clinic data is fresh
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/crm')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }
});

/* Admin-scoped service worker for /admin/login PWA */
const CACHE_NAME = 'wangchuk-admin-v1';
const PRECACHE_URLS = [
  '/admin/login',
  '/admin-pwa/manifest.webmanifest',
  '/admin-pwa/icons/icon-192.png',
  '/admin-pwa/icons/icon-512.png',
  '/admin-pwa/icons/icon-512-maskable.png',
  '/admin-pwa/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Only handle same-origin admin + PWA asset requests
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith('/admin') && !url.pathname.startsWith('/admin-pwa')) {
    return;
  }

  // Always network for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // Network-first for admin pages; fall back to cache (login shell offline)
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') {
          const login = await caches.match('/admin/login');
          if (login) return login;
        }
        return Response.error();
      })
  );
});

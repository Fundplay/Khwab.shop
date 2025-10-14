const CACHE_NAME = 'mysite-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install: cache core assets
self.addEventListener('install', evt => {
  self.skipWaiting();
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Activate: clean up old caches
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve()))
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for performance; fallback to network
self.addEventListener('fetch', evt => {
  const req = evt.request;
  // Only handle GET requests
  if (req.method !== 'GET') return;
  evt.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req)
        .then(resp => {
          // Optionally cache new GET responses
          if (resp && resp.status === 200 && req.url.startsWith(self.location.origin)) {
            const respClone = resp.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, respClone));
          }
          return resp;
        })
        .catch(() => {
          // offline fallback: you can return a fallback page if you have one
          return caches.match('/offline.html');
        });
    })
  );
});
